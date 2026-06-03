import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './src/backend/app.ts';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const sitemapApp = getApps().find(a => a.name === 'sitemap') ||
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')),
  }, 'sitemap');

const sitemapDb = getFirestore(sitemapApp);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('/sitemap.xml', async (req, res) => {
  try {
  const snapshot = await sitemapDb.collection('jobs').get();

    const jobUrls = snapshot.docs.map(doc => {
      const data = doc.data();
      const lastmod = data.updatedAt?.toDate?.()?.toISOString?.()?.split('T')[0]
                      || new Date().toISOString().split('T')[0];
      return `
  <url>
    <loc>https://khmerjobs.onrender.com/jobs/${doc.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://khmerjobs.onrender.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${jobUrls}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.sendFile(path.join(process.cwd(), 'sitemap.xml'));
  }
});

    app.get('/robots.txt', (req, res) => {
      res.type('text/plain');
      res.send('User-agent: *\nAllow: /\n\nSitemap: https://khmerjobs.onrender.com/sitemap.xml');
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
