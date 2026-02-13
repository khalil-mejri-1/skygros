import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8181;
const DIST_PATH = path.join(__dirname, 'dist');
const API_BASE_URL = 'https://skygros-eycv.vercel.app';
const CONCURRENCY_LIMIT = 5; // عدد الصفحات التي سيتم معالجتها في نفس الوقت (يمكنك رفعه لـ 10 إذا كان جهازك قوياً)

const STATIC_ROUTES = ['/', '/products', '/login', '/register', '/demos'];

async function getDynamicRoutes() {
    const dynamicRoutes = [];
    try {
        console.log('--- Fetching dynamic routes ---');
        const [catRes, prodRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/categories`),
            fetch(`${API_BASE_URL}/api/products`)
        ]);

        if (catRes.ok) {
            const categories = await catRes.json();
            categories.forEach(cat => {
                dynamicRoutes.push(`/products/${cat.name}`);
                if (cat.subcategories) {
                    cat.subcategories.forEach(sub => dynamicRoutes.push(`/products/${cat.name}?subcategory=${sub}`));
                }
            });
        }
        if (prodRes.ok) {
            const products = await prodRes.json();
            products.forEach(prod => dynamicRoutes.push(`/product/${prod._id}`));
        }
    } catch (err) {
        console.warn('Fallback to static routes.');
    }
    return dynamicRoutes;
}

async function renderRoute(browser, route) {
    const page = await browser.newPage();
    try {
        const isQuery = route.includes('?');
        await page.setViewport({ width: 1280, height: 800 });

        // تقليل وقت الانتظار لـ 2 ثانية كافٍ جداً مع networkidle0
        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 60000 });
        await new Promise(r => setTimeout(r, 2000));

        const content = await page.content();
        let savePath = route === '/' ? path.join(DIST_PATH, 'index.html') :
            isQuery ? path.join(DIST_PATH, route.split('?')[0], route.split('=')[1], 'index.html') :
                path.join(DIST_PATH, route, 'index.html');

        const dir = path.dirname(savePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(savePath, content);
        console.log(`✅ Done: ${route}`);
    } catch (err) {
        console.error(`❌ Error ${route}: ${err.message}`);
    } finally {
        await page.close();
    }
}

async function prerender() {
    const dynamicRoutes = await getDynamicRoutes();
    const ROUTES = [...new Set([...STATIC_ROUTES, ...dynamicRoutes])];
    console.log(`Total routes to render: ${ROUTES.length}`);

    const app = express();
    app.use(express.static(DIST_PATH));
    app.use((req, res) => res.sendFile(path.join(DIST_PATH, 'index.html')));

    const server = app.listen(PORT, async () => {
        const edgePaths = [
            'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
            'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        ];
        const executablePath = edgePaths.find(p => fs.existsSync(p));

        const browser = await puppeteer.launch({
            headless: "new",
            executablePath: executablePath || undefined,
            args: ['--no-sandbox']
        });

        // معالجة الصفحات في مجموعات (Chunks) لتوفير الوقت
        for (let i = 0; i < ROUTES.length; i += CONCURRENCY_LIMIT) {
            const chunk = ROUTES.slice(i, i + CONCURRENCY_LIMIT);
            console.log(`Processing batch: ${i + 1} to ${Math.min(i + CONCURRENCY_LIMIT, ROUTES.length)}`);
            await Promise.all(chunk.map(route => renderRoute(browser, route)));
        }

        await browser.close();
        server.close();
        console.log('--- Prerendering completed in record time! ---');
        process.exit(0);
    });
}

prerender();
