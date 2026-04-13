import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

let cachedSeoPages = null;

const SEO = ({ title, description, keywords, image, url, noindex, schema }) => {
    const location = useLocation();
    const [pageSEO, setPageSEO] = useState(null);

    useEffect(() => {
        const fetchSEO = async () => {
            if (cachedSeoPages) {
                const match = cachedSeoPages.find(p => p.path === location.pathname || p.path === location.pathname + '/');
                if (match) setPageSEO(match);
                return;
            }
            try {
                const res = await axios.get(`${API_BASE_URL}/settings`);
                if (res.data && res.data.seoPages) {
                    cachedSeoPages = res.data.seoPages;
                    const match = cachedSeoPages.find(p => p.path === location.pathname || p.path === location.pathname + '/');
                    if (match) setPageSEO(match);
                }
            } catch (err) {
                console.error("Failed to load SEO pages", err);
            }
        };
        fetchSEO();
    }, [location.pathname]);

    const finalTitle = pageSEO?.title || title || 'Skygros';
    const finalTitleFormatted = finalTitle.includes('Skygros') ? finalTitle : `${finalTitle} | Skygros`;
    const finalDescription = pageSEO?.description || description || "Skygros - Your best choice for IPTV and more.";
    const finalKeywords = pageSEO?.keywords || keywords;
    const finalImage = pageSEO?.ogImage || image;
    const finalOgTitle = pageSEO?.ogTitle || finalTitle;
    const finalOgDesc = pageSEO?.ogDescription || finalDescription;
    const finalUrl = url || window.location.href;

    return (
        <>
            <Helmet>
                {/* Standard Metadata */}
                <title>{finalTitleFormatted}</title>
                <meta name="description" content={finalDescription} />
                {finalKeywords && <meta name="keywords" content={finalKeywords} />}
                {noindex && <meta name="robots" content="noindex, nofollow" />}
                {!noindex && <meta name="robots" content="index, follow" />}
                {pageSEO?.author && <meta name="author" content={pageSEO.author} />}

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={finalUrl} />
                <meta property="og:title" content={finalOgTitle} />
                <meta property="og:description" content={finalOgDesc} />
                {finalImage && <meta property="og:image" content={finalImage} />}

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={finalUrl} />
                <meta property="twitter:title" content={finalOgTitle} />
                <meta property="twitter:description" content={finalOgDesc} />
                {finalImage && <meta property="twitter:image" content={finalImage} />}
            </Helmet>

            {/* Structured Data (JSON-LD) - Rendered directly in Body for faster detection */}
            {schema && (
                <script 
                    type="application/ld+json" 
                    dangerouslySetInnerHTML={{ __html: typeof schema === 'string' ? schema : JSON.stringify(schema) }}
                />
            )}
        </>
    );
};

export default SEO;
