import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, noindex }) => {
    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title ? `${title} | Skygros` : 'Skygros'}</title>
            <meta name="description" content={description || "Skygros - Your best choice for IPTV and more."} />
            {keywords && <meta name="keywords" content={keywords} />}
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {!noindex && <meta name="robots" content="index, follow" />}


            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url || window.location.href} />
            <meta property="og:title" content={title || 'Skygros'} />
            <meta property="og:description" content={description || "Skygros - Your best choice for IPTV and more."} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url || window.location.href} />
            <meta property="twitter:title" content={title || 'Skygros'} />
            <meta property="twitter:description" content={description || "Skygros - Your best choice for IPTV and more."} />
            {image && <meta property="twitter:image" content={image} />}
        </Helmet>
    );
};

export default SEO;
