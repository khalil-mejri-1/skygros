import { useState, useEffect, useContext } from "react";
import { createPortal } from 'react-dom';

import API_BASE_URL, { formatImageUrl } from "../config/api";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { FaShoppingCart, FaCheck, FaShieldAlt, FaBolt, FaGlobe, FaChevronLeft, FaStar, FaPlus, FaRegStar, FaUser, FaRegCheckCircle, FaMoneyBillWave, FaTimes } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import LicenseKeyModal from "../components/LicenseKeyModal";
import AlertModal from "../components/AlertModal";
import axios from "axios";
import SEO from "../components/SEO";
import GoldenIptvOrderForm from "../components/GoldenIptvOrderForm";

const ProductDetails = () => {

    const { id } = useParams();
    const { user, updateBalance } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const [product, setProduct] = useState(null);
    const isNeo4k = product?.title?.toLowerCase().includes("neo4k");
    const [similarProducts, setSimilarProducts] = useState([]);
    const [isPurchased, setIsPurchased] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [lastPurchasedKey, setLastPurchasedKey] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isUltraSmall, setIsUltraSmall] = useState(window.innerWidth <= 660);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // M3U Options State
    const [packages, setPackages] = useState([]);
    const [countries, setCountries] = useState([]);
    const [selectedDuration, setSelectedDuration] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("TN");
    const [selectedRegion, setSelectedRegion] = useState("");
    const [subscriptionType, setSubscriptionType] = useState('m3u'); // 'm3u' or 'code'
    const [mangoIdentifier, setMangoIdentifier] = useState("");
    const [showMangoModal, setShowMangoModal] = useState(false);
    const [mangoRenewType, setMangoRenewType] = useState(""); // 'box' or 'netfly'
    const [mangoServices, setMangoServices] = useState([]);
    const [isFetchingMangoServices, setIsFetchingMangoServices] = useState(false);
    const [selectedMangoService, setSelectedMangoService] = useState(null);
    const [mangoTestResponse, setMangoTestResponse] = useState(null);
    const [showTestModal, setShowTestModal] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [settings, setSettings] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({ whatsapp: "", note: "" });
    const [macAddress, setMacAddress] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("");

    const [goldenProfile, setGoldenProfile] = useState(null);
    const [isTestingGolden, setIsTestingGolden] = useState(false);
    const [goldenTestError, setGoldenTestError] = useState("");

    const [isTestingNeo, setIsTestingNeo] = useState(false);
    const [neoTestData, setNeoTestData] = useState(null);
    const [neoTestError, setNeoTestError] = useState("");



    const handleTestNeoConnection = async () => {
        setIsTestingNeo(true);
        setNeoTestError("");
        setNeoTestData(null);
        try {
            const [testRes, pkgRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/neo/test-connection`, {
                    params: {
                        apiKey: product.apiConfig?.apiKey,
                        baseUrl: product.apiConfig?.baseUrl
                    }
                }),
                // Also try to re-fetch packages during test
                axios.get(`${API_BASE_URL}/neo/packages`, {
                    params: {
                        apiKey: product.apiConfig?.apiKey,
                        baseUrl: product.apiConfig?.baseUrl
                    }
                }).catch(() => ({ data: [] }))
            ]);

            setNeoTestData(testRes.data.data);

            // Update packages if we got them
            if (pkgRes.data) {
                let pkgs = [];
                if (Array.isArray(pkgRes.data)) {
                    pkgs = pkgRes.data;
                } else if (typeof pkgRes.data === 'object' && pkgRes.data !== null) {
                    pkgs = Object.entries(pkgRes.data).map(([id, name]) => ({
                        id: id,
                        name: typeof name === 'string' ? name : (name.name || id)
                    }));
                }
                if (pkgs.length > 0) setPackages(pkgs);
            }
        } catch (err) {
            setNeoTestError(err.response?.data?.message || err.message || "Erreur de connexion API Neo");
        } finally {
            setIsTestingNeo(false);
        }
    };

    const handleTestGoldenProfile = async () => {
        setIsTestingGolden(true);
        setGoldenTestError("");
        setGoldenProfile(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/products/provider/golden/profile`);
            // Golden API response format according to the schema
            setGoldenProfile(res.data.data || res.data);
        } catch (err) {
            setGoldenTestError(err.response?.data?.message || err.message || "Erreur de connexion API");
        } finally {
            setIsTestingGolden(false);
        }
    };

    // Carousel Auto-play
    useEffect(() => {
        const allImages = product ? [product.image, ...(product.secondaryImages || [])] : [];
        if (allImages.length > 1) {
            const interval = setInterval(() => {
                setActiveImageIndex((prev) => (prev + 1) % allImages.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [product]);

    // Fetch NEO Options if M3U
    // Fetch Provider Options if API type
    useEffect(() => {
        if (product?.type === 'm3u' || product?.type === 'mag' || product?.type === 'activecode') {
            // Golden IPTV uses its own dedicated form and package fetching system
            if (product.provider === 'golden') return;

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
                    } else if (product.provider === 'u8k') {
                        providerPrefix = 'u8k';
                    }

                    console.log(`Fetching options for provider: ${providerPrefix}`);

                    const requests = [
                        axios.get(`${API_BASE_URL}/${providerPrefix}/packages`, {
                            params: {
                                apiKey: product.apiConfig?.apiKey,
                                baseUrl: product.apiConfig?.baseUrl
                            }
                        }),
                        axios.get(`${API_BASE_URL}/${providerPrefix}/countries`, {
                            params: {
                                apiKey: product.apiConfig?.apiKey,
                                baseUrl: product.apiConfig?.baseUrl
                            }
                        }).catch(() => axios.get(`${API_BASE_URL}/neo/countries`))
                    ];

                    const [pkgRes, countryRes] = await Promise.all(requests);

                    // Handle Packages
                    let pkgs = [];
                    if (Array.isArray(pkgRes.data)) {
                        pkgs = pkgRes.data;
                    } else if (typeof pkgRes.data === 'object' && pkgRes.data !== null) {
                        // If it's an object with ID as key and Name as value
                        pkgs = Object.entries(pkgRes.data).map(([id, name]) => ({
                            id: id,
                            name: typeof name === 'string' ? name : (name.name || id)
                        }));
                    }
                    
                    setPackages(pkgs);

                    // Auto-select first package if available
                    if (pkgs.length > 0) {
                        const isNeo4k = product?.title?.toLowerCase().includes("neo4k");
                        if (isNeo4k) {
                            const skygrosPkg = pkgs.find(p => p.name?.toLowerCase().includes("skygros") || p.id === "skygros");
                            if (skygrosPkg) {
                                setSelectedRegion(skygrosPkg.id);
                            } else if (!selectedRegion) {
                                setSelectedRegion(pkgs[0].id);
                            }
                        } else if (!selectedRegion) {
                            setSelectedRegion(pkgs[0].id);
                        }
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
                const [productRes, settingsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/products`),
                    axios.get(`${API_BASE_URL}/settings`).catch(() => ({ data: null }))
                ]);

                if (settingsRes.data) {
                    setSettings(settingsRes.data);
                }

                if (Array.isArray(productRes.data)) {
                    const currentProduct = productRes.data.find(p => p._id === id);
                    if (currentProduct) {
                        setProduct(currentProduct);
                        // Auto-select default duration if configured
                        if (currentProduct.defaultDuration) {
                            setSelectedDuration(currentProduct.defaultDuration);
                        }
                        // Get similar products from the same category
                        setSimilarProducts(productRes.data.filter(p => p.category === currentProduct.category && p._id !== id).slice(0, 4));
                    }
                } else {
                    console.error("Products data is not an array:", productRes.data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

    const fetchMangoServices = async () => {
        if (!mangoIdentifier.trim()) return;
        setIsFetchingMangoServices(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/mango/services/${mangoRenewType}/${mangoIdentifier}`);
            if (res.data.code === "200") {
                setMangoServices(res.data.data.serviceList || []);
            } else {
                setAlertModal({
                    isOpen: true,
                    title: "Erreur Mango",
                    message: res.data.message || "Impossible de récupérer les services.",
                    type: "error"
                });
            }
        } catch (err) {
            console.error(err);
            setAlertModal({
                isOpen: true,
                title: "Erreur",
                message: "Serveur Mango indisponible ou identifiant invalide.",
                type: "error"
            });
        } finally {
            setIsFetchingMangoServices(false);
        }
    };

    const handleMangoPurchase = async () => {
        if (!user) return;
        if (!selectedMangoService) {
            setAlertModal({
                isOpen: true,
                title: "Sélection requise",
                message: "Veuillez choisir un plan de renouvellement.",
                type: "warning"
            });
            return;
        }

        // Get calculated price
        const parsePrice = (p) => {
            if (!p) return 0;
            const cleaned = String(p).replace(/[^0-9.]/g, '');
            return parseFloat(cleaned) || 0;
        };

        let finalPrice = parsePrice(selectedMangoService.price);
        if (settings && settings.home?.mangoSettings) {
            if (mangoRenewType === 'netfly') {
                finalPrice += parsePrice(settings.home.mangoSettings.netflyPrice);
            } else if (mangoRenewType === 'box') {
                finalPrice += parsePrice(settings.home.mangoSettings.boxPrice);
            }
        }

        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/mango/purchase`, {
                userId: user._id,
                serviceKey: selectedMangoService.key,
                identifier: mangoIdentifier,
                type: mangoRenewType,
                price: selectedMangoService.originalPrice || selectedMangoService.price, // Send base price, backend adds margin
                customerDetails: customerDetails
            });

            if (res.status === 200) {
                updateBalance(res.data.newBalance);
                setAlertModal({
                    isOpen: true,
                    title: "Achat Réussi",
                    message: "Votre renouvellement Mango a été effectué avec succès !",
                    type: "success"
                });
                setShowMangoModal(false);
                setIsPurchased(true);
                setTimeout(() => setIsPurchased(false), 5000);
            }
        } catch (err) {
            setAlertModal({
                isOpen: true,
                title: "Erreur d'Achat",
                message: err.response?.data?.message || "Une erreur est survenue lors de l'achat Mango.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestMangoConnection = async () => {
        setIsTestingConnection(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/mango/test-connection`);
            setMangoTestResponse(res.data);
            setShowTestModal(true);
        } catch (err) {
            setMangoTestResponse(err.response?.data || { message: err.message });
            setShowTestModal(true);
        } finally {
            setIsTestingConnection(false);
        }
    };

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

        // Validation for selection options
        if (product.type === 'm3u' || product.type === 'mag' || product.type === 'activecode' || product.hasMultiDuration) {
            if (!selectedDuration) {
                setAlertModal({
                    isOpen: true,
                    title: "Configuration Requise",
                    message: "Veuillez sélectionner une durée avant d'acheter.",
                    type: "warning"
                });
                return;
            }

            if ((product.type === 'm3u' || product.type === 'mag' || product.type === 'activecode') && subscriptionType === 'm3u' && !selectedRegion) {
                setAlertModal({
                    isOpen: true,
                    title: "Configuration Requise",
                    message: "Veuillez sélectionner un package/bouquet avant d'acheter.",
                    type: "warning"
                });
                return;
            }

            if (product.type === 'mag' && !macAddress) {
                setAlertModal({
                    isOpen: true,
                    title: "Configuration Requise",
                    message: "Veuillez entrer l'adresse MAC.",
                    type: "warning"
                });
                return;
            }

            if (product.type === 'mango' && !mangoIdentifier) {
                setAlertModal({
                    isOpen: true,
                    title: "Configuration Requise",
                    message: mangoRenewType === 'box' ? "Veuillez entrer le SN or Account/UNID." : "Veuillez entrer l'Account/UNID.",
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
            if (product.type === 'm3u' || product.type === 'mag' || product.type === 'activecode') {
                console.log("Sending Purchase Request with:", {
                    duration: selectedDuration,
                    bouquetId: selectedRegion,
                    country: selectedCountry,
                    mac: macAddress
                });
            }

            const res = await axios.post(`${API_BASE_URL}/products/purchase`, {
                userId: user._id,
                productId: product._id,
                subscriptionDetails: (product.type === 'm3u' || product.type === 'mag' || product.type === 'activecode' || product.type === 'mango' || product.hasMultiDuration) ? {
                    duration: selectedDuration,
                    country: selectedCountry,
                    bouquetId: selectedRegion,
                    templateId: selectedTemplate,
                    subscriptionType: (product.type === 'm3u' || product.type === 'mag' || product.type === 'activecode' || product.type === 'mango' || ((product.subcategory || "").split(',').includes("Abonnement code") && (product.subcategory || "").split(',').includes("Abonnement M3u"))) ? subscriptionType : 'manual',
                    identifier: mangoIdentifier,
                    mac: macAddress
                } : null,
                customerDetails: customerDetails
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


    // Dynamic Pricing Logic
    const getDynamicPriceData = () => {
        if (selectedDuration && product.durationPrices && product.durationPrices.length > 0) {
            // Compare as string to match schema
            const priceConfig = product.durationPrices.find(dp => dp.duration === selectedDuration);
            if (priceConfig) {
                return {
                    price: priceConfig.price,
                    oldPrice: priceConfig.oldPrice
                };
            }
        }
        return {
            price: product.price,
            oldPrice: product.oldPrice
        };
    };

    const { price: currentPrice, oldPrice: currentOldPrice } = getDynamicPriceData();

    const discountPercentage = currentOldPrice > 0
        ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)
        : 0;

    return (
        <div style={{ background: 'var(--bg-primary)', padding: '40px 0', minHeight: '100vh' }}>
            <SEO
                title={product.metaTitle || product.title}
                description={product.metaDescription || product.description || `Achetez ${product.title} au meilleur prix sur Skygros.`}
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

                {/* Admin Controls Window */}
                {user?.role === 'admin' && (
                    <div className="glass" style={{
                        padding: '15px 25px',
                        borderRadius: '16px',
                        marginBottom: '30px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255, 153, 0, 0.1)',
                        border: '1px solid rgba(255, 153, 0, 0.3)',
                        animation: 'fadeIn 0.5s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                                <FaBolt />
                            </div>
                            <div>
                                <div style={{ fontWeight: '900', fontSize: '0.9rem', color: '#fff' }}>PANEL ADMIN</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)', fontWeight: '700' }}>STOCK: {product.keys?.filter(k => !k.isSold).length || 0} DISPONIBLE</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => window.location.href = `/admin?tab=products&edit=${product._id}`}
                                className="btn"
                                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}
                            >
                                MODIFIER
                            </button>
                            <button
                                onClick={() => window.location.href = `/admin?tab=stock&productId=${product._id}`}
                                className="btn"
                                style={{ background: 'rgba(255, 153, 0, 0.2)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}
                            >
                                GÉRER CODES
                            </button>
                            <button
                                onClick={async () => {
                                    if (window.confirm("Supprimer ce produit ?")) {
                                        try {
                                            await axios.delete(`${API_BASE_URL}/products/${product._id}`);
                                            window.location.href = '/products';
                                        } catch (e) {
                                            alert("Erreur lors de la suppression");
                                        }
                                    }
                                }}
                                className="btn"
                                style={{ background: 'rgba(255, 71, 87, 0.2)', color: '#ff4757', border: '1px solid rgba(255, 71, 87, 0.3)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}
                            >
                                SUPPRIMER
                            </button>
                        </div>

                    </div>
                )}


                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: isMobile ? '30px' : '60px', alignItems: 'start' }}>
                    <div style={{ position: isMobile ? 'relative' : 'sticky', top: isMobile ? 'unset' : '100px' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div className="card-premium" style={{
                                flex: 1,
                                aspectRatio: isMobile ? '16/9' : '3/4',
                                maxHeight: isMobile ? '350px' : 'unset',
                                position: 'relative',
                                background: '#0a0b14',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                            }}>
                                {(() => {
                                    const allImages = [product.image, ...(product.secondaryImages || [])];
                                    return (
                                        <>
                                            <img
                                                src={formatImageUrl(allImages[activeImageIndex])}
                                                alt={product.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'all 0.5s ease-in-out'
                                                }}
                                            />
                                            {allImages.length > 1 && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '15px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    display: 'flex',
                                                    gap: '8px',
                                                    zIndex: 10
                                                }}>
                                                    {allImages.map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => setActiveImageIndex(idx)}
                                                            style={{
                                                                width: activeImageIndex === idx ? '24px' : '8px',
                                                                height: '8px',
                                                                borderRadius: '4px',
                                                                background: activeImageIndex === idx ? 'var(--accent-color)' : 'rgba(255,255,255,0.3)',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}

                                {discountPercentage > 0 && (
                                    <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'var(--accent-color)', color: '#000', padding: '6px 12px', borderRadius: '6px', fontWeight: '900', fontSize: '0.75rem', zIndex: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                        OFFRE -{discountPercentage}%
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails on the right */}
                            {!isMobile && product.secondaryImages?.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '80px' }}>
                                    {[product.image, ...product.secondaryImages].map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            style={{
                                                width: '80px',
                                                height: '100px',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: activeImageIndex === idx ? '2px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                                                transition: 'all 0.2s ease',
                                                opacity: activeImageIndex === idx ? 1 : 0.6
                                            }}
                                        >
                                            <img src={formatImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
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

                        {/* Description Section */}
                        <div style={{ marginTop: '40px' }}>
                            <h3 style={{ color: '#fff', marginBottom: '15px', fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase' }}>DESCRIPTION</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                                {product.description || "Ce produit numérique premium vous offre un accès instantané à votre contenu. Utilisez le code secret fourni après l'achat pour activer votre produit sur la plateforme correspondante."}
                            </p>
                        </div>

                        {/* Reviews and Guarantees Section */}
                        {(product.rating || product.reviewsCount || (product.guarantees && product.guarantees.length > 0)) && (
                            <div className="glass p-6 rounded-xl border border-white/10 mt-8 mb-6 bg-black/20">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {(product.rating || product.reviewsCount) && (
                                        <div className="flex flex-col gap-4">
                                            {product.rating && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaRegStar className="text-primary" />
                                                        <span className="text-gray-400 text-sm font-bold opacity-60">Note des Avis</span>
                                                    </div>
                                                    <div className="text-2xl font-black text-white">{product.rating} / 5</div>
                                                </div>
                                            )}
                                            {product.reviewsCount && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaUser className="text-gray-400" />
                                                        <span className="text-gray-400 text-sm font-bold opacity-60">Nombre d'Avis</span>
                                                    </div>
                                                    <div className="text-2xl font-black text-white">{product.reviewsCount}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {product.guarantees && product.guarantees.length > 0 && product.guarantees.some(g => g.trim() !== '') && (
                                        <div className="border-l border-white/10 pl-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <FaShieldAlt className="text-gray-400" />
                                                <span className="text-gray-400 text-sm font-bold opacity-60">Garanties</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {product.guarantees.map((garantie, index) => {
                                                    if (!garantie || garantie.trim() === '') return null;
                                                    return (
                                                        <span key={index} className="text-[0.7rem] font-bold text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                                                            {garantie}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <div style={{ marginBottom: '10px' }}>
                            <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {product.category} • REGION GLOBALE
                            </span>
                        </div>
                        <h1 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '900', color: '#fff', marginBottom: '10px', lineHeight: '1.1', fontFamily: 'var(--font-main)' }}>
                            {product.title}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: '900', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>${currentPrice.toFixed(2)}</span>
                                {currentOldPrice > 0 && (
                                    <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through', fontWeight: '700' }}>
                                        ${currentOldPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>
                            {discountPercentage > 0 && (
                                <div style={{ background: 'rgba(255, 153, 0, 0.1)', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', fontSize: '0.7rem', fontWeight: '900', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                                    OFFRE -{discountPercentage}%
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center gap-1" style={{ color: '#f1c40f' }}>
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                <span style={{ color: '#fff', marginLeft: '5px', fontWeight: '700' }}>4.9</span>
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>(12.5k avis)</span>
                        </div>



                        {/* Golden API Diagnostic Block */}
                        {product.provider === 'golden' && user?.isAdmin && (
                            <div className="glass p-6 rounded-xl border border-white/10 mb-6" style={{ background: 'rgba(255, 193, 7, 0.05)' }}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                        <FaGlobe style={{ color: '#ffc107' }} /> Diagnostic GOLDEN API
                                    </h3>
                                    <button
                                        onClick={handleTestGoldenProfile}
                                        disabled={isTestingGolden}
                                        className="btn hover-lift"
                                        style={{
                                            background: '#ffc107',
                                            color: '#000',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            fontWeight: '800',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {isTestingGolden ? "Test en cours..." : "Tester la connexion"}
                                    </button>
                                </div>
                                
                                {goldenTestError && (
                                    <div style={{ background: 'rgba(244, 67, 54, 0.1)', color: '#f44336', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                                        {goldenTestError}
                                    </div>
                                )}
                                
                                {goldenProfile && (
                                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', fontSize: '0.85rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div><strong style={{ color: '#ffc107' }}>Username:</strong> {goldenProfile.username}</div>
                                            <div><strong style={{ color: '#ffc107' }}>Credit:</strong> {goldenProfile.credit}</div>
                                            <div><strong style={{ color: '#ffc107' }}>Role:</strong> {goldenProfile.role}</div>
                                            <div><strong style={{ color: '#ffc107' }}>Created By:</strong> {goldenProfile.created_by}</div>
                                            <div><strong style={{ color: '#ffc107' }}>Last Login:</strong> {goldenProfile.last_login}</div>
                                            <div><strong style={{ color: '#ffc107' }}>Created At:</strong> {goldenProfile.created_at}</div>
                                            <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#ffc107' }}>Last IP:</strong> {goldenProfile.last_ip}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}





                        {/* Configuration de l'offre Moved Here */}
                        {(() => {
                            const subs = (product.subcategory || "").split(',').map(s => s.trim());
                            const isHybrid = subs.includes("Abonnement code") && subs.includes("Abonnement M3u");
                            const hasVisibilityOptions = product.showBouquetSorter || product.showCountrySelector !== false;
                            const isMango = product.type === 'mango' || product.title?.toLowerCase().includes('mango');
                            return (product.type === 'm3u' || product.type === 'mag' || product.type === 'activecode' || product.hasMultiDuration || isHybrid || hasVisibilityOptions) && !isMango;
                        })() && (
                            <div className="glass p-6 rounded-xl border border-white/10 mb-6 bg-black/20">
                                <h3 className="text-white font-bold mb-4 text-lg">Configuration de l'offre</h3>

                                {/* Order Completion Inputs */}
                                {product.provider !== 'u8k' && (
                                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)' }}>NUMÉRO (POUR LE SUIVI)</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: +216..."
                                                className="admin-input"
                                                value={customerDetails.whatsapp}
                                                onChange={(e) => setCustomerDetails({ ...customerDetails, whatsapp: e.target.value })}
                                                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}
                                            />
                                        </div>

                                    </div>
                                )}


                                {/* Subscription Duration */}
                                <div className="mb-4">
                                    <label className="block text-gray-400 text-sm mb-2 font-bold">Durée (Option)</label>
                                    <select
                                        className="w-full bg-[#151725] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                        value={selectedDuration}
                                        onChange={(e) => setSelectedDuration(e.target.value)}
                                    >
                                        <option value="">Sélectionner une durée</option>

                                        {/* Dynamic Options from Backend or Default List */}
                                        {product.durationPrices && product.durationPrices.length > 0 ? (
                                            product.durationPrices.map((dp, i) => (
                                                <option key={i} value={dp.duration}>
                                                    {dp.duration}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="1">1 Month</option>
                                                <option value="3">3 Months</option>
                                                <option value="6">6 Months</option>
                                                <option value="12">12 Months</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                {(() => {
                                    const subs = (product.subcategory || "").split(',').map(s => s.trim());
                                    const isHybrid = subs.includes("Abonnement code") && subs.includes("Abonnement M3u");
                                    const isMango = product.type === 'mango' || product.title?.toLowerCase().includes('mango');
                                    return (product.type === 'm3u' || isHybrid) && !isMango;
                                })() && (
                                    <>
                                        {/* Subscription Type Selector - Specific to multi-choice subcategories */}
                                        {(() => {
                                            const subs = (product.subcategory || "").split(',').map(s => s.trim());
                                            return subs.includes("Abonnement code") && subs.includes("Abonnement M3u");
                                        })() && (
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
                                                            {product.keys?.filter(k => !k.isSold).length > 0 ? `${product.keys?.filter(k => !k.isSold).length} Codes Disponibles en stock` : "Commande en attente (Livraison manuelle par l'admin)"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Sort Bouquets (Packages) */}
                                        {product.showBouquetSorter !== false && !isNeo4k && (
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
                                        {product.showCountrySelector !== false && (product.type === 'm3u' || product.type === 'mag') && (
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
                                        )}
                                        
                                        {product.type === 'mag' && (
                                            <div className="mb-4">
                                                <label className="block text-gray-400 text-sm mb-2 font-bold text-white uppercase">MAC Address</label>
                                                <input
                                                    type="text"
                                                    placeholder="00:1A:79:XX:XX:XX"
                                                    className="w-full bg-[#151725] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                                    value={macAddress}
                                                    onChange={(e) => setMacAddress(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <div className="glass" style={{ padding: isMobile ? '20px' : '30px', borderRadius: 'var(--radius-lg)', marginBottom: '30px', border: '1px solid rgba(255, 153, 0, 0.2)' }}>
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-gray-500 font-bold text-xs uppercase tracking-widest">Achat Rapide</div>
                                <div style={{ fontSize: '0.8rem', color: (subscriptionType === 'm3u' || (product.keys?.filter(k => !k.isSold).length > 0)) ? 'var(--success)' : '#ff4757', fontWeight: '800' }}>
                                    {subscriptionType === 'm3u' ? "✓ LIVRAISON INSTANTANÉE" :
                                        (product.keys?.filter(k => !k.isSold).length > 0 ? "✓ EN STOCK - LIVRAISON RAPIDE" : "⌛ SUR COMMANDE (MAX 24H)")}
                                </div>
                            </div>

                            {product.provider === 'golden' && (
                                <div className="mb-8">
                                    <GoldenIptvOrderForm />
                                </div>
                            )}

                            {(product.type === 'mango' || product.title?.toLowerCase().includes('mango')) && (
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                setMangoRenewType('box');
                                                setSubscriptionType('box');
                                                setMangoIdentifier("");
                                                setMangoServices([]);
                                                setSelectedMangoService(null);
                                                setShowMangoModal(true);
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #FF9900 0%, #FF6B00 100%)',
                                                color: '#000',
                                                padding: '16px',
                                                fontSize: '0.95rem',
                                                fontWeight: '950',
                                                borderRadius: '14px',
                                                boxShadow: '0 8px 16px rgba(255, 153, 0, 0.2)'
                                            }}
                                        >
                                            RENEW BOX
                                        </button>
                                        <button
                                            onClick={() => {
                                                setMangoRenewType('netfly');
                                                setSubscriptionType('netfly');
                                                setMangoIdentifier("");
                                                setMangoServices([]);
                                                setSelectedMangoService(null);
                                                setShowMangoModal(true);
                                            }}
                                            style={{
                                                background: 'rgba(255, 153, 0, 0.05)',
                                                border: '2px solid var(--accent-color)',
                                                color: 'var(--accent-color)',
                                                padding: '16px',
                                                fontSize: '0.95rem',
                                                fontWeight: '950',
                                                borderRadius: '14px'
                                            }}
                                        >
                                            RENEW NETFLY
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleTestMangoConnection}
                                        disabled={isTestingConnection}
                                        className="w-full opacity-60 hover:opacity-100 transition-all py-3 border border-dashed border-white/20 rounded-xl text-[0.7rem] font-bold text-white/50"
                                    >
                                        {isTestingConnection ? "VÉRIFICATION..." : "TESTER LA CONNEXION API MANGO"}
                                    </button>
                                    
                                    <button
                                        onClick={handleBuy}
                                        style={{
                                            background: isPurchased ? 'var(--success)' : 'var(--accent-color)',
                                            color: '#000',
                                            padding: '18px 25px',
                                            fontSize: '1.1rem',
                                            fontWeight: '950',
                                            borderRadius: '16px',
                                            boxShadow: isPurchased ? 'none' : '0 12px 24px rgba(255, 153, 0, 0.25)',
                                            width: '100%',
                                            transition: 'all 0.3s ease'
                                        }}
                                        disabled={isPurchased}
                                    >
                                        {isLoading ? "Veuillez patienter..." : (isPurchased ? "✓ ACHAT RÉUSSI" : "ACHETER MAINTENANT")}
                                    </button>
                                    <button
                                        onClick={handleAddToCart}
                                        style={{
                                            background: isAdded ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: isAdded ? '#000' : '#fff',
                                            width: '100%',
                                            height: '45px',
                                            fontSize: '1.2rem',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {isAdded ? <FaCheck /> : <FaPlus />}
                                    </button>
                                </div>
                            )}

                            {product.provider !== 'golden' && !(product.type === 'mango' || product.title?.toLowerCase().includes('mango')) && (
                                <div className="flex gap-4 items-stretch">
                                    <button
                                        onClick={handleBuy}
                                        style={{
                                            background: isPurchased ? 'var(--success)' : 'var(--accent-color)',
                                            color: '#000',
                                            padding: '18px 25px',
                                            fontSize: '1.1rem',
                                            fontWeight: '950',
                                            borderRadius: '16px',
                                            boxShadow: isPurchased ? 'none' : '0 12px 24px rgba(255, 153, 0, 0.25)',
                                            flex: 4,
                                            transition: 'all 0.3s ease'
                                        }}
                                        disabled={isPurchased}
                                    >
                                        {isLoading ? "Veuillez patienter..." :
                                            (isPurchased ? "✓ ACHAT RÉUSSI" :
                                                (subscriptionType === 'code' ? "COMMANDER MAINTENANCE" : "ACHETER MAINTENANT"))}
                                    </button>
                                    <button
                                        onClick={handleAddToCart}
                                        style={{
                                            background: isAdded ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: isAdded ? '#000' : '#fff',
                                            width: '60px',
                                            height: '60px',
                                            fontSize: '1.5rem',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                            flexShrink: 0
                                        }}
                                        title="Ajouter au panier"
                                    >
                                        {isAdded ? <FaCheck /> : <FaPlus />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>



                {similarProducts.length > 0 && (
                    <section style={{ marginTop: '80px' }}>
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="section-title" style={{ marginBottom: 40 }}>PRODUITS <span style={{ color: 'var(--accent-color)' }}>SIMILAIRES</span></h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isUltraSmall ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: isUltraSmall ? '15px' : '25px' }}>
                            {similarProducts.map(p => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Mango Renewal Modal - Portal ensures it's above everything */}
            {showMangoModal && createPortal(
                <div className="modal-overlay" style={{ zIndex: 1000000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(10px)' }}>
                    <div className="modal-content glass" style={{ maxWidth: '450px', width: '100%', position: 'relative', zIndex: 1000001, padding: '30px' }}>
                        <button 
                            onClick={() => setShowMangoModal(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem', transition: '0.3s' }}
                            className="hover:text-red-500"
                        >
                            <FaTimes />
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
                                    {mangoRenewType === 'box' ? 'Renew Box' : 'Renew Netfly'}
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                    Veuillez entrer les détails requis pour finaliser votre commande.
                                </p>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-[0.7rem] font-black uppercase tracking-widest mb-2 opacity-50">
                                    {mangoRenewType === 'box' ? 'SN or Account/UNID:' : 'Account/UNID:'}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="EX: 20121600..."
                                        className="admin-input flex-1"
                                        value={mangoIdentifier}
                                        onChange={(e) => setMangoIdentifier(e.target.value)}
                                        style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
                                    />
                                    <button 
                                        onClick={fetchMangoServices}
                                        disabled={isFetchingMangoServices || !mangoIdentifier}
                                        className="btn btn-glass"
                                        style={{ padding: '0 20px', fontWeight: '900' }}
                                    >
                                        {isFetchingMangoServices ? "..." : "VÉRIFIER"}
                                    </button>
                                </div>
                            </div>

                            {mangoServices.length > 0 && (
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="custom-scrollbar pr-1">
                                    <p className="text-[0.7rem] font-black text-primary uppercase tracking-widest mb-3">Services Disponibles</p>
                                    <div className="flex flex-col gap-2">
                                        {mangoServices.map((serviceGroup) => (
                                            <div key={serviceGroup.serviceName}>
                                                {serviceGroup.priceList.map((plan) => (
                                                    <div
                                                        key={plan.key}
                                                        onClick={() => setSelectedMangoService(plan)}
                                                        className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center mb-2 ${selectedMangoService?.key === plan.key ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                                    >
                                                        <div>
                                                            <div className="text-sm font-bold text-white">{plan.name}</div>
                                                            <div className="text-[0.65rem] text-gray-500">Plan de renouvellement</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-primary font-black">
                                                                ${(() => {
                                                                    const raw = String(plan.price || "0").replace(/[^0-9.]/g, '');
                                                                    const base = parseFloat(raw) || 0;
                                                                    if (!plan.marginAdded) {
                                                                        const m = settings?.home?.mangoSettings ? (mangoRenewType === 'netfly' ? parseFloat(settings.home.mangoSettings.netflyPrice) : parseFloat(settings.home.mangoSettings.boxPrice)) : 0;
                                                                        return (base + (parseFloat(m) || 0)).toFixed(2);
                                                                    }
                                                                    return base.toFixed(2);
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleMangoPurchase}
                                    disabled={!selectedMangoService || isLoading}
                                    className="btn btn-primary"
                                    style={{ padding: '15px', borderRadius: '12px', fontWeight: '900', boxShadow: '0 10px 20px rgba(255,153,0,0.2)' }}
                                >
                                    {isLoading ? "PATIENTEZ..." : (selectedMangoService ? "CHOISIR UN PLAN" : "SÉLECTIONNEZ UN PLAN")}
                                </button>
                                <button
                                    onClick={() => setShowMangoModal(false)}
                                    className="btn btn-glass"
                                    style={{ padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '0.8rem' }}
                                >
                                    ANNULER
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Mango Test Connection Response Modal - Portal */}
            {showTestModal && createPortal(
                <div className="modal-overlay" style={{ zIndex: 1000000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(15px)' }}>
                    <div className="modal-content glass" style={{ maxWidth: '600px', width: '100%', maxHeight: '85vh', padding: '30px', position: 'relative', zIndex: 1000001 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
                            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '900' }}>Réponse Mango API</h2>
                            <div style={{ background: '#000', padding: '20px', borderRadius: '15px', flex: 1, overflow: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #333' }}>
                                <pre style={{ color: mangoTestResponse?.status === 'success' ? '#2ed573' : '#ff4757', whiteSpace: 'pre-wrap' }}>
                                    {JSON.stringify(mangoTestResponse, null, 2)}
                                </pre>
                            </div>
                            <button onClick={() => setShowTestModal(false)} className="btn btn-primary" style={{ padding: '15px', borderRadius: '10px', fontWeight: '900' }}>
                                FERMER
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ProductDetails;
