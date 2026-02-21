import { useState, useEffect, useContext } from "react";

import API_BASE_URL from "../config/api";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { FaShoppingCart, FaCheck, FaShieldAlt, FaBolt, FaGlobe, FaChevronLeft, FaStar, FaPlus } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import LicenseKeyModal from "../components/LicenseKeyModal";
import AlertModal from "../components/AlertModal";
import axios from "axios";
import SEO from "../components/SEO";

const ProductDetails = () => {

    const { id } = useParams();
    const { user, updateBalance } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [isPurchased, setIsPurchased] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [lastPurchasedKey, setLastPurchasedKey] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isUltraSmall, setIsUltraSmall] = useState(window.innerWidth <= 660);

    // M3U Options State
    const [packages, setPackages] = useState([]);
    const [countries, setCountries] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("TN");
    const [selectedRegion, setSelectedRegion] = useState("");
    const [subscriptionType, setSubscriptionType] = useState('m3u'); // 'm3u' or 'code'

    // Fetch NEO Options if M3U
    useEffect(() => {
        if (product?.type === 'm3u') {
            const fetchProviderOptions = async () => {
                try {
                    let providerPrefix = 'neo'; // Default
                    if (product.provider === 'strong8k') {
                        providerPrefix = 'strong8k';
                    } else if (product.provider === 'activation') {
                        providerPrefix = 'activation';
                    } else if (product.provider === 'tivipanel') {
                        providerPrefix = 'tivipanel';
                    } else if (product.provider === 'promax') {
                        providerPrefix = 'promax';
                    }

                    console.log(`Fetching options for provider: ${providerPrefix}`);

                    const [pkgRes, countryRes] = await Promise.all([
                        axios.get(`${API_BASE_URL}/${providerPrefix}/packages`),
                        // Re-use countries endpoint or provider specific if available
                        axios.get(`${API_BASE_URL}/${providerPrefix}/countries`).catch(() => axios.get(`${API_BASE_URL}/neo/countries`))
                    ]);

                    // Handle Packages
                    // Both APIs return array of objects: [{id, name}, ...]
                    const pkgs = Array.isArray(pkgRes.data) ? pkgRes.data : Object.values(pkgRes.data || {});
                    setPackages(pkgs);

                    // Auto-select first package if available
                    if (pkgs.length > 0) {
                        setSelectedRegion(pkgs[0].id);
                    }

                    // Handle Countries
                    const cnts = Array.isArray(countryRes.data) ? countryRes.data : Object.values(countryRes.data || {});
                    setCountries(cnts);

                } catch (err) {
                    console.error(`Failed to load options for ${product.provider}`, err);
                }
            };
            fetchProviderOptions();
        }
    }, [product]);


    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsUltraSmall(window.innerWidth <= 660);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/products`);
                if (Array.isArray(res.data)) {
                    const currentProduct = res.data.find(p => p._id === id);
                    if (currentProduct) {
                        setProduct(currentProduct);
                        // Get similar products from the same category
                        setSimilarProducts(res.data.filter(p => p.category === currentProduct.category && p._id !== id).slice(0, 4));
                    }
                } else {
                    console.error("Products data is not an array:", res.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

    const handleBuy = async () => {
        if (!user) {
            setAlertModal({
                isOpen: true,
                title: "Connexion Requise",
                message: "Veuillez vous connecter pour effectuer un achat !",
                type: "info"
            });
            return;
        }

        // Validation for M3U options
        if (product.type === 'm3u') {
            // If M3U type is selected, we need bouquet and duration
            if (subscriptionType === 'm3u' && (!selectedDuration || !selectedRegion)) {
                setAlertModal({
                    isOpen: true,
                    title: "Configuration Requise",
                    message: "Veuillez sélectionner une durée et un bouquet avant d'acheter.",
                    type: "warning"
                });
                return;
            }
            // If Code type is selected, we just need duration (price depends on it)
            if (subscriptionType === 'code' && !selectedDuration) {
                setAlertModal({
                    isOpen: true,
                    title: "Configuration Requise",
                    message: "Veuillez sélectionner une durée.",
                    type: "warning"
                });
                return;
            }
        }

        if (user.balance < currentPrice) {
            setAlertModal({
                isOpen: true,
                title: "Solde Insuffisant",
                message: `Votre solde est insuffisant pour cet achat ($${currentPrice.toFixed(2)} requis).`,
                type: "error"
            });
            return;
        }

        setIsLoading(true);
        try {
            // DEBUG SELECTED OPTIONS BEFORE SENDING
            if (product.type === 'm3u') {
                console.log("Sending Purchase Request with:", {
                    duration: selectedDuration,
                    bouquetId: selectedRegion,
                    country: selectedCountry
                });
            }

            const res = await axios.post(`${API_BASE_URL}/products/purchase`, {
                userId: user._id,
                productId: product._id,
                subscriptionDetails: product.type === 'm3u' ? {
                    duration: selectedDuration, // Changed from packId -> duration
                    country: selectedCountry,
                    bouquetId: selectedRegion,  // Changed from region -> bouquetId
                    subscriptionType: subscriptionType // 'm3u' or 'code'
                } : null
            });

            if (res.status === 200) {
                updateBalance(res.data.newBalance);
                setLastPurchasedKey(res.data.licenseKey);

                // Refresh product data to update stock status immediately
                try {
                    const productRes = await axios.get(`${API_BASE_URL}/products`);
                    if (Array.isArray(productRes.data)) {
                        const updated = productRes.data.find(p => p._id === id);
                        if (updated) setProduct(updated);
                    }
                } catch (e) {
                    console.error("Error refreshing product:", e);
                }

                setIsPurchased(true);
                setShowKeyModal(true);
                setTimeout(() => setIsPurchased(false), 5000);
            }
        } catch (err) {
            setAlertModal({
                isOpen: true,
                title: "Erreur d'Achat",
                message: err.response?.data?.message || "Une erreur est survenue lors de l'achat.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = () => {
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const Skeleton = ({ height, width, style, borderRadius = '12px' }) => (
        <div style={{
            width: width || '100%',
            height,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
            backgroundSize: '200% 100%',
            borderRadius,
            animation: 'skeletonLoading 1.5s infinite',
            ...style
        }}>
            <style>{`
            @keyframes skeletonLoading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `}</style>
        </div>
    );

    if (!product) {
        return (
            <div style={{ background: 'var(--bg-primary)', padding: '40px 0', minHeight: '100vh' }}>
                <SEO title="Chargement..." />
                <div className="container">
                    <Skeleton width="200px" height="20px" style={{ marginBottom: '30px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: isMobile ? '30px' : '60px', alignItems: 'start' }}>
                        {/* Image/Left Column Skeleton */}
                        <div style={{ order: isMobile ? 1 : 'unset' }}>
                            <Skeleton width="100%" height={isMobile ? "300px" : "500px"} borderRadius="var(--radius-lg)" />
                            <div className="flex gap-4 mt-6">
                                <Skeleton width="100%" height="80px" borderRadius="var(--radius-md)" />
                                <Skeleton width="100%" height="80px" borderRadius="var(--radius-md)" />
                            </div>
                        </div>
                        {/* Details/Right Column Skeleton */}
                        <div style={{ order: isMobile ? 2 : 'unset' }}>
                            <Skeleton width="150px" height="20px" style={{ marginBottom: '15px' }} />
                            <Skeleton width="80%" height="60px" style={{ marginBottom: '20px' }} />
                            <Skeleton width="200px" height="30px" style={{ marginBottom: '40px' }} />

                            <div className="glass" style={{ padding: '30px', borderRadius: 'var(--radius-lg)', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                    <Skeleton width="150px" height="60px" />
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                                        <Skeleton width="200px" height="20px" />
                                        <Skeleton width="150px" height="15px" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Skeleton width="100%" height="60px" borderRadius="var(--radius-md)" />
                                    <Skeleton width="80px" height="60px" borderRadius="var(--radius-md)" />
                                </div>
                            </div>

                            <Skeleton width="150px" height="30px" style={{ marginBottom: '20px' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Skeleton width="100%" height="15px" />
                                <Skeleton width="100%" height="15px" />
                                <Skeleton width="80%" height="15px" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const discountPercentage = product.oldPrice > 0
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0;

    // Dynamic Pricing Logic
    const getDynamicPrice = () => {
        if (selectedDuration && product.durationPrices && product.durationPrices.length > 0) {
            const priceConfig = product.durationPrices.find(dp => dp.duration === parseInt(selectedDuration));
            if (priceConfig) return priceConfig.price;
        }
        return product.price;
    };

    const currentPrice = getDynamicPrice();

    return (
        <div style={{ background: 'var(--bg-primary)', padding: '40px 0', minHeight: '100vh' }}>
            <SEO
                title={product.title}
                description={product.description || `Achetez ${product.title} au meilleur prix sur Skygros.`}
                image={product.image}
            />
            <LicenseKeyModal
                isOpen={showKeyModal}
                onClose={() => setShowKeyModal(false)}
                productTitle={product.title}
                licenseKey={lastPurchasedKey}
            />

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />

            <div className="container">
                <Link to="/products" className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '30px', fontWeight: '600' }}>
                    <FaChevronLeft size={12} /> RETOUR AU MAGASIN
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: isMobile ? '30px' : '60px', alignItems: 'start' }}>
                    <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 'unset' : '100px' }}>
                        <div className="card-premium" style={{
                            aspectRatio: isMobile ? '16/9' : '3/4',
                            maxHeight: isMobile ? '350px' : 'unset',
                            position: 'relative',
                            background: '#0a0b14', // Match theme background or keep black
                            borderRadius: 'var(--radius-lg)', // Ensure consistency
                            overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.4)', // Add depth
                            margin: '0 auto' // Center if width constrained
                        }}>
                            <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {discountPercentage > 0 && (
                                <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'var(--accent-color)', color: '#000', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                    OFFRE -{discountPercentage}%
                                </div>
                            )}
                        </div>

                        {/* Badges moved here for mobile logic too, keeping structure consistency */}
                        <div className="flex gap-4 mt-6" style={{ flexDirection: isMobile ? 'row' : 'row' }}>
                            <div className="flex-1 glass flex items-center gap-3 p-4" style={{ borderRadius: 'var(--radius-md)', padding: isMobile ? '12px' : '16px', justifyContent: 'center' }}>
                                <FaShieldAlt style={{ color: 'var(--success)', fontSize: isMobile ? '1.2rem' : '1.5rem' }} />
                                <div>
                                    <div style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', fontWeight: '800', color: '#fff' }}>SÉCURISÉ</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>100% Garanti</div>
                                </div>
                            </div>
                            <div className="flex-1 glass flex items-center gap-3 p-4" style={{ borderRadius: 'var(--radius-md)', padding: isMobile ? '12px' : '16px', justifyContent: 'center' }}>
                                <FaBolt style={{ color: 'var(--accent-color)', fontSize: isMobile ? '1.2rem' : '1.5rem' }} />
                                <div>
                                    <div style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', fontWeight: '800', color: '#fff' }}>INSTANTANÉ</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Clé Digitale</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ marginBottom: '10px' }}>
                            <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {product.category} • REGION GLOBALE
                            </span>
                        </div>
                        <h1 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '900', color: '#fff', marginBottom: '15px', lineHeight: '1.1', fontFamily: 'var(--font-main)' }}>
                            {product.title}
                        </h1>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center gap-1" style={{ color: '#f1c40f' }}>
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                <span style={{ color: '#fff', marginLeft: '5px', fontWeight: '700' }}>4.9</span>
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>(12.5k avis)</span>
                        </div>

                        <div className="glass" style={{ padding: isMobile ? '20px' : '30px', borderRadius: 'var(--radius-lg)', marginBottom: '30px', border: '1px solid rgba(255, 153, 0, 0.2)' }}>
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    {product.oldPrice > 0 && (
                                        <div style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '1rem', marginBottom: '2px' }}>
                                            ${product.oldPrice.toFixed(2)}
                                        </div>
                                    )}
                                    <div style={{ color: 'var(--accent-color)', fontSize: '2.5rem', fontWeight: '900' }}>
                                        ${currentPrice.toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', color: (subscriptionType === 'm3u' || (product.keys?.filter(k => !k.isSold).length > 0)) ? 'var(--success)' : '#ff4757', fontWeight: '800', marginBottom: '5px' }}>
                                        {subscriptionType === 'm3u' ? "✓ LIVRAISON INSTANTANÉE" :
                                            (product.keys?.filter(k => !k.isSold).length > 0 ? "✓ EN STOCK - LIVRAISON RAPIDE" : "⌛ SUR COMMANDE (MAX 24H)")}
                                    </div>

                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleBuy}
                                    // ...
                                    className="btn flex-1"
                                    disabled={isPurchased}
                                    style={{
                                        background: isPurchased ? 'var(--success)' : 'var(--accent-color)',
                                        color: '#000',
                                        padding: isMobile ? '15px' : '18px',
                                        fontSize: isMobile ? '1rem' : '1.1rem',
                                        fontWeight: '900',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: '0 10px 20px rgba(255, 153, 0, 0.2)'
                                    }}
                                >
                                    {isLoading ? "Chargement..." :
                                        (isPurchased ? <FaCheck /> :
                                            ((product.type !== 'normal' || product.keys?.filter(k => !k.isSold).length > 0) ? "ACHETER MAINTENANT" : "COMMANDER"))}
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    className="btn"
                                    style={{
                                        background: isAdded ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: isAdded ? '#000' : '#fff',
                                        padding: isMobile ? '0 15px' : '0 25px',
                                        fontSize: isMobile ? '1.1rem' : '1.3rem',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                    title="Ajouter au panier"
                                >
                                    {isAdded ? <FaCheck /> : <FaPlus />}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            {product.type === 'm3u' && (
                                <div className="glass p-6 rounded-xl border border-white/10 mb-6 bg-black/20">
                                    <h3 className="text-white font-bold mb-4 text-lg">Configuration de l'abonnement</h3>

                                    {/* Subscription Duration */}
                                    <div className="mb-4">
                                        <label className="block text-gray-400 text-sm mb-2 font-bold">Duration (Subscription)</label>
                                        <select
                                            className="w-full bg-[#151725] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                            value={selectedDuration}
                                            onChange={(e) => setSelectedDuration(e.target.value)}
                                        >
                                            <option value="">Sélectionner une durée</option>

                                            {/* Dynamic Options from Backend */}
                                            {product.durationPrices && product.durationPrices.length > 0 ? (
                                                product.durationPrices.sort((a, b) => a.duration - b.duration).map(dp => (
                                                    <option key={dp.duration} value={dp.duration}>
                                                        {dp.duration} Mois - ${dp.price}
                                                    </option>
                                                ))
                                            ) : (
                                                <>
                                                    {product.provider === 'tivipanel' && <option value="trial">24h (Test)</option>}
                                                    <option value="1">1 Month</option>
                                                    <option value="3">3 Months</option>
                                                    <option value="6">6 Months</option>
                                                    <option value="12">12 Months</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    {/* Subscription Type Selector */}
                                    <div className="mb-4">
                                        <label className="block text-gray-400 text-sm mb-2 font-bold">Type d'abonnement</label>
                                        <div className="flex gap-4">
                                            <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all ${subscriptionType === 'm3u' ? 'bg-primary border-primary text-white' : 'bg-[#151725] border-white/10 text-gray-400 hover:border-white/30'}`}>
                                                <input
                                                    type="radio"
                                                    name="subtype"
                                                    value="m3u"
                                                    checked={subscriptionType === 'm3u'}
                                                    onChange={() => setSubscriptionType('m3u')}
                                                    className="hidden"
                                                />
                                                <div className="text-center font-bold">Lien M3U</div>
                                            </label>
                                            <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all ${subscriptionType === 'code' ? 'bg-primary border-primary text-white' : 'bg-[#151725] border-white/10 text-gray-400 hover:border-white/30'}`}>
                                                <input
                                                    type="radio"
                                                    name="subtype"
                                                    value="code"
                                                    checked={subscriptionType === 'code'}
                                                    onChange={() => setSubscriptionType('code')}
                                                    className="hidden"
                                                />
                                                <div className="text-center font-bold">Code d'activation</div>
                                            </label>
                                        </div>
                                        {subscriptionType === 'code' && (
                                            <div className="mt-3 p-3 rounded-lg bg-black/30 border border-white/5 flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${product.keys?.filter(k => !k.isSold).length > 0 ? 'bg-success' : 'bg-yellow-500 animate-pulse'}`}></div>
                                                <span className="text-xs font-bold" style={{ color: product.keys?.filter(k => !k.isSold).length > 0 ? 'var(--success)' : '#f1c40f' }}>
                                                    {product.keys?.filter(k => !k.isSold).length > 0
                                                        ? `${product.keys.filter(k => !k.isSold).length} codes disponibles en stock.`
                                                        : "Stock épuisé: Livraison manuelle par l'administrateur."}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sort Bouquets (Packages) - Only show if M3U is selected */}
                                    {product.showBouquetSorter !== false && subscriptionType === 'm3u' && (
                                        <div className="mb-4">
                                            <label className="block text-gray-400 text-sm mb-2 font-bold">Sort Bouquets (Package)</label>
                                            <select
                                                className="w-full bg-[#151725] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                                value={selectedRegion}
                                                onChange={(e) => setSelectedRegion(e.target.value)}
                                            >
                                                <option value="">Sélectionner un bouquet</option>
                                                {packages.map(pkg => (
                                                    <option key={pkg.id} value={pkg.id}>
                                                        {(product.bouquetNames && product.bouquetNames[pkg.id]) ? product.bouquetNames[pkg.id] : pkg.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Country */}
                                    <div className="mb-2">
                                        <label className="block text-gray-400 text-sm mb-2 font-bold">Country</label>
                                        <select
                                            className="w-full bg-[#151725] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                            value={selectedCountry}
                                            onChange={(e) => setSelectedCountry(e.target.value)}
                                        >
                                            {countries.map(c => (
                                                <option key={c.code} value={c.code}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '1.2rem', fontWeight: '800' }}>DESCRIPTION</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                                {product.description || "Ce produit numérique premium vous offre un accès instantané à votre contenu. Utilisez le code secret fourni après l'achat pour activer votre produit sur la plateforme correspondante."}
                            </p>
                        </div>
                    </div>
                </div>

                {similarProducts.length > 0 && (
                    <section style={{ marginTop: '80px' }}>
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="section-title" style={{ marginBottom: 40 }}>PRODUITS <span style={{ color: 'var(--accent-color)' }}>SIMILAIRES</span></h2>
                            {/* <Link to="/products" style={{ color: 'var(--accent-color)', fontWeight: '700', fontSize: '0.9rem' marginB }}>VOIR TOUT</Link> */}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isUltraSmall ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: isUltraSmall ? '15px' : '25px' }}>
                            {similarProducts.map(p => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
