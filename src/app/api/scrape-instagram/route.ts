import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { NextRequest } from 'next/server';

interface ScrapeRequest {
  instagramHandle: string;
  venueName: string;
  confirm?: boolean;
  sessionId?: string;
  closeBrowser?: boolean;
}

interface ScrapeResponse {
  success: boolean;
  venueName?: string;
  profileImage?: string;
  images?: string[];
  count?: number;
  status?: 'waiting' | 'completed';
  sessionId?: string;
  error?: string;
}

// Store browser sessions in memory (for manual login flow)
const browserSessions = new Map<string, { browser: any; page: any; instagramHandle: string; venueName: string }>();

export async function POST(request: NextRequest): Promise<Response> {
  console.log('🚀 [INSTAGRAM-SCRAPER] Starting Instagram scraping...');
  
  try {
    const { instagramHandle, venueName, confirm, sessionId, closeBrowser }: ScrapeRequest = await request.json();
    console.log('📝 [INSTAGRAM-SCRAPER] Request data:', { instagramHandle, venueName, confirm, sessionId, closeBrowser });

    // Se è una richiesta di chiusura browser
    if (closeBrowser && sessionId) {
      const session = browserSessions.get(sessionId);
      if (!session) {
        return Response.json({ error: 'Session not found or already closed.' }, { status: 404 });
      }

      try {
        await session.browser.close();
        browserSessions.delete(sessionId);
        console.log('🔒 [INSTAGRAM-SCRAPER] Browser closed manually');
        return Response.json({
          success: true,
          message: 'Browser closed successfully'
        });
      } catch (error) {
        browserSessions.delete(sessionId);
        console.error('❌ [INSTAGRAM-SCRAPER] Error closing browser:', error);
        return Response.json({ 
          error: `Failed to close browser: ${(error as Error).message}` 
        }, { status: 500 });
      }
    }

    // Se è una conferma, usa la sessione esistente
    if (confirm && sessionId) {
      const session = browserSessions.get(sessionId);
      if (!session) {
        return Response.json({ error: 'Session not found or expired.' }, { status: 404 });
      }

      // Aggiorna la sessione con i nuovi parametri
      session.instagramHandle = instagramHandle;
      session.venueName = venueName;
      browserSessions.set(sessionId, session);

      const { browser, page, instagramHandle: currentHandle, venueName: currentVenueName } = session;
      
      try {
        console.log('✅ [INSTAGRAM-SCRAPER] Using existing session, navigating to profile...');

        // Naviga al profilo Instagram dopo il login
        const instagramUrl = `https://www.instagram.com/${currentHandle.replace('@', '')}/`;
        console.log('🔗 [INSTAGRAM-SCRAPER] Navigating to profile:', instagramUrl);
        
        await page.goto(instagramUrl, { waitUntil: 'networkidle2' });
        console.log('✅ [INSTAGRAM-SCRAPER] Profile page loaded successfully');

        // Aspetta che il contenuto si carichi completamente
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Screenshot per debug
        const screenshotPath = path.join(process.cwd(), 'public', 'debug-screenshot.png');
        await page.screenshot({ 
          path: screenshotPath as `${string}.png`, 
          fullPage: true,
          type: 'png'
        });
        console.log('📸 [INSTAGRAM-SCRAPER] Screenshot saved to:', screenshotPath);

        // Estrai TUTTE le immagini (senza filtri) per trovare la prima
        const allImages = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('img'))
            .map((img: HTMLImageElement) => img.src)
            .filter((src: string) => src && src.length > 0);
        });

        console.log(`📸 [INSTAGRAM-SCRAPER] Found ${allImages.length} total images`);

        if (allImages.length === 0) {
          await browser.close();
          browserSessions.delete(sessionId);
          console.log('❌ [INSTAGRAM-SCRAPER] No images found. Profile might be private.');
          return Response.json({ 
            error: 'No images found. Make sure you are logged in and the Instagram profile is accessible.' 
          }, { status: 404 });
        }

        // La prima immagine diventa profileImage (senza filtri)
        const profileImageUrl = allImages[0];
        console.log('👤 [INSTAGRAM-SCRAPER] First image selected as profileImage:', profileImageUrl);

        // Estrai le altre immagini con filtri per dimensioni (escludendo la prima)
        const galleryImageData = await page.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img'));
          const imageInfo: Array<{ src: string; width: number; height: number }> = [];
          
          images.forEach((img: HTMLImageElement, index: number) => {
            // Salta la prima immagine (già usata come profileImage)
            if (index === 0) return;
            
            // Usa le dimensioni naturali dell'immagine
            const naturalWidth = img.naturalWidth || img.width || 0;
            const naturalHeight = img.naturalHeight || img.height || 0;
            
            // Filtra: altezza > 300px E altezza > larghezza - 1 ( - 1 per includere le immagini 1:1)
            if (naturalHeight > 300 && naturalHeight > naturalWidth -1 && img.src) {
              imageInfo.push({
                src: img.src,
                width: naturalWidth,
                height: naturalHeight
              });
            }
          });
          
          return imageInfo;
        });

        console.log(`📸 [INSTAGRAM-SCRAPER] Found ${galleryImageData.length} gallery images matching criteria (height > 300px and height > width)`);

        // Crea cartella per il venue
        const venueDir = path.join(process.cwd(), 'public', 'venues', currentVenueName.toLowerCase().replace(/\s+/g, '-'));
        console.log('📁 [INSTAGRAM-SCRAPER] Venue directory:', venueDir);
        
        if (!fs.existsSync(venueDir)) {
          fs.mkdirSync(venueDir, { recursive: true });
          console.log('✅ [INSTAGRAM-SCRAPER] Created venue directory');
        }

        // Scarica profileImage (prima immagine, senza filtri)
        let downloadedProfileImage = '';
        try {
          console.log(`⬇️ [INSTAGRAM-SCRAPER] Downloading profileImage:`, profileImageUrl);
          const profileRes = await fetch(profileImageUrl);
          const profileBuffer = await profileRes.arrayBuffer();
          const profileFileName = 'profile.jpg';
          const profileFilePath = path.join(venueDir, profileFileName);
          fs.writeFileSync(profileFilePath, Buffer.from(profileBuffer));
          downloadedProfileImage = `/venues/${currentVenueName.toLowerCase().replace(/\s+/g, '-')}/${profileFileName}`;
          console.log(`✅ [INSTAGRAM-SCRAPER] Saved profileImage: ${profileFilePath}`);
        } catch (error) {
          console.error(`❌ [INSTAGRAM-SCRAPER] Error downloading profileImage:`, (error as Error).message);
        }

        // Scarica le immagini della gallery (filtrate)
        const downloadedImages = [];
        console.log(`📥 [INSTAGRAM-SCRAPER] Downloading ${galleryImageData.length} gallery images...`);
        
        for (let i = 0; i < galleryImageData.length; i++) {
          try {
            const imgData = galleryImageData[i];
            console.log(`⬇️ [INSTAGRAM-SCRAPER] Downloading gallery image ${i + 1}/${galleryImageData.length} (${imgData.width}x${imgData.height}):`, imgData.src);
            
            const res = await fetch(imgData.src);
            const buffer = await res.arrayBuffer();
            const fileName = `img_${i + 1}.jpg`;
            const filePath = path.join(venueDir, fileName);
            fs.writeFileSync(filePath, Buffer.from(buffer));
            downloadedImages.push(`/venues/${currentVenueName.toLowerCase().replace(/\s+/g, '-')}/${fileName}`);
            console.log(`✅ [INSTAGRAM-SCRAPER] Saved: ${filePath}`);
          } catch (error) {
            console.error(`❌ [INSTAGRAM-SCRAPER] Error downloading gallery image ${i + 1}:`, (error as Error).message);
          }
        }

        // NON chiudere il browser automaticamente - lascia aperto per l'utente
        // La sessione rimane attiva finché l'utente non chiude manualmente
        console.log('🎉 [INSTAGRAM-SCRAPER] Scraping completed successfully! Browser remains open.');
        console.log('📊 [INSTAGRAM-SCRAPER] Final results:', {
          success: true,
          venueName: currentVenueName,
          imagesCount: downloadedImages.length
        });

        return Response.json({
          success: true,
          venueName: currentVenueName,
          profileImage: downloadedProfileImage,
          images: downloadedImages,
          count: downloadedImages.length,
          status: 'completed',
          sessionId: sessionId // Mantieni il sessionId per permettere la chiusura manuale
        });

      } catch (error) {
        await browser.close();
        browserSessions.delete(sessionId);
        console.error('❌ [INSTAGRAM-SCRAPER] Error during scraping process:', error);
        return Response.json({ 
          error: `Failed to scrape Instagram: ${(error as Error).message}` 
        }, { status: 500 });
      }
    }

    // Prima fase: apre Chrome e naviga a Instagram
    if (!instagramHandle) {
      console.log('❌ [INSTAGRAM-SCRAPER] No Instagram handle provided');
      return Response.json({ error: 'Instagram handle is required.' }, { status: 400 });
    }

    // Check if running on Vercel (production)
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
      console.log('❌ [INSTAGRAM-SCRAPER] Instagram scraping is not available in production on Vercel');
      return Response.json({ 
        error: 'Instagram scraping is not available in production. Please use the local development environment.',
        success: false 
      }, { status: 503 });
    }

    // Percorso di Chrome installato su macOS
    const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    
    let browser;
    try {
      console.log('🌐 [INSTAGRAM-SCRAPER] Launching Chrome browser...');
      browser = await puppeteer.launch({
        headless: false,
        executablePath: chromePath
      });
      console.log('✅ [INSTAGRAM-SCRAPER] Browser launched successfully');
      
      const page = await browser.newPage();
      console.log('📄 [INSTAGRAM-SCRAPER] New page created');

      // Naviga alla pagina di login invece che direttamente al profilo
      const loginUrl = 'https://www.instagram.com/accounts/login/';
      console.log('🔗 [INSTAGRAM-SCRAPER] Navigating to login page:', loginUrl);
      
      await page.goto(loginUrl, { waitUntil: 'networkidle2' });
      console.log('✅ [INSTAGRAM-SCRAPER] Login page loaded successfully');
      console.log('🔐 [INSTAGRAM-SCRAPER] Please login manually in the browser window, then use the scraping buttons in the admin panel');

      // Genera session ID univoco
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      // Salva la sessione
      browserSessions.set(sessionId, { browser, page, instagramHandle, venueName });

      return Response.json({
        success: true,
        status: 'waiting',
        sessionId,
        message: 'Browser opened. Please login manually and click Confirm when ready.'
      });

    } catch (error) {
      console.error('❌ [INSTAGRAM-SCRAPER] Error during browser launch:', error);
      if (browser) {
        await browser.close();
        console.log('🔒 [INSTAGRAM-SCRAPER] Browser closed due to error');
      }
      return Response.json({ 
        error: `Failed to launch browser: ${(error as Error).message}` 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ [INSTAGRAM-SCRAPER] Error parsing request:', error);
    return Response.json({ 
      error: 'Invalid request body' 
    }, { status: 400 });
  }
}
