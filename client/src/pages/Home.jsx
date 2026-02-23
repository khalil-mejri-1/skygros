import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

import SEO from '../components/SEO';
import API_BASE_URL from '../config/api';
import ProductCard from '../components/ProductCard';

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade, Grid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import 'swiper/css/grid';

const Home = () => {
    // ... existing state ...
    const [isYearly, setIsYearly] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [movies, setMovies] = useState([]);
    const [settings, setSettings] = useState(null);
    const [allProducts, setAllProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [deals, setDeals] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const { user } = useContext(AuthContext);

    // Notification State
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Editor State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null); // 'hero', 'movies', 'channels', 'sports'
    const [editData, setEditData] = useState(null);
    const [screenSize, setScreenSize] = useState({
        isSmall: window.innerWidth <= 930,
        isUltraSmall: window.innerWidth <= 660
    });

    const isAdmin = user?.isAdmin || user?.email === "feridadmin@admin.com";

    const formatImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
        const baseUrl = API_BASE_URL.replace('/api', '');
        return `${baseUrl}${url}`;
    };

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                isSmall: window.innerWidth <= 930,
                isUltraSmall: window.innerWidth <= 660
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isEditModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isEditModalOpen]);

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings`);
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        }
    };

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch('https://api.themoviedb.org/3/trending/movie/week?api_key=4d039cadaa42a698f4bb258d94dc4181&language=fr-FR');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setMovies(data.results.slice(0, 10)); // Get top 10 movies
            } catch (error) {
                console.error("Failed to fetch movies:", error);
            }
        };

        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);
                const response = await axios.get(`${API_BASE_URL}/products`);
                if (response.status === 200) {
                    setAllProducts(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchMovies();
        fetchSettings();
        fetchProducts();
    }, []);

    useEffect(() => {
        if (settings?.home?.bestSellers && allProducts.length > 0) {
            const filtered = allProducts.filter(p => settings.home.bestSellers.includes(p._id) && !p.isHidden);
            setBestSellers(filtered);
        } else if (allProducts.length > 0) {
            // Default: show first 4 non-hidden products if nothing set
            setBestSellers(allProducts.filter(p => !p.isHidden).slice(0, 4));
        }

        if (settings?.home?.deals && allProducts.length > 0) {
            const filtered = allProducts.filter(p => settings.home.deals.includes(p._id) && !p.isHidden);
            setDeals(filtered);
        }
    }, [settings, allProducts]);

    const togglePricing = () => {
        setIsYearly(!isYearly);
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const showNotify = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
    };

    const handleEditClick = (section, data) => {
        setEditingSection(section);

        let initialData = data;
        if (section === 'deals') {
            initialData = {
                items: settings?.home?.deals || [],
                title: settings?.home?.dealsTitle || "Deals",
                coloredWord: settings?.home?.dealsColoredWord || "Deals",
                subtitle: settings?.home?.dealsSubtitle || "Offres exceptionnelles à durée limitée"
            };
        } else if (section === 'bestSellers') {
            initialData = {
                items: settings?.home?.bestSellers || [],
                title: settings?.home?.bestSellersTitle || "Meilleures Ventes",
                coloredWord: settings?.home?.bestSellersColoredWord || "Ventes"
            };
        }

        setEditData(JSON.parse(JSON.stringify(initialData))); // Deep clone
        setIsEditModalOpen(true);
    };

    const handleSaveSettings = async () => {
        try {
            const updatedSettings = { ...settings };
            if (editingSection === 'hero') updatedSettings.home.hero = editData;
            if (editingSection === 'movies') updatedSettings.home.movies = editData;
            if (editingSection === 'channels') updatedSettings.home.channels = editData;
            if (editingSection === 'sports') updatedSettings.home.sportsSection = editData;
            if (editingSection === 'devices') updatedSettings.home.devicesSection = editData;
            if (editingSection === 'countries') updatedSettings.home.countriesSection = editData;
            if (editingSection === 'features') updatedSettings.home.featuresSection = editData;
            if (editingSection === 'pricing') updatedSettings.home.pricingSection = editData;
            if (editingSection === 'panel') updatedSettings.home.panelSection = editData;
            if (editingSection === 'library') updatedSettings.home.librarySection = editData;
            if (editingSection === 'testimonials') updatedSettings.home.testimonialsSection = editData;
            if (editingSection === 'faq') updatedSettings.home.faqSection = editData;
            if (editingSection === 'cta') updatedSettings.home.ctaSection = editData;
            if (editingSection === 'footer') updatedSettings.home.footerSection = editData;
            if (editingSection === 'carousel') updatedSettings.home.carousel = editData;
            if (editingSection === 'bestSellers') {
                updatedSettings.home.bestSellers = editData.items;
                updatedSettings.home.bestSellersTitle = editData.title;
                updatedSettings.home.bestSellersColoredWord = editData.coloredWord;
            }
            if (editingSection === 'deals') {
                updatedSettings.home.deals = editData.items;
                updatedSettings.home.dealsTitle = editData.title;
                updatedSettings.home.dealsColoredWord = editData.coloredWord;
                updatedSettings.home.dealsSubtitle = editData.subtitle;
            }
            if (editingSection === 'memberships') updatedSettings.home.membershipsSection = editData;
            if (editingSection === 'giftCards') updatedSettings.home.giftCardsSection = editData;

            const response = await axios.put(`${API_BASE_URL}/settings`, updatedSettings);
            if (response.status === 200) {
                setSettings(response.data);
                setIsEditModalOpen(false);
                showNotify("Paramètres enregistrés avec succès !", "success");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            showNotify("Erreur lors de l'enregistrement.", "error");
        }
    };

    const ProductSlider = ({ products, id }) => {
        return (
            <div className="relative group/slider px-4">
                <Swiper
                    modules={[Navigation, Grid]}
                    slidesPerView={2}
                    grid={{
                        rows: 2,
                        fill: 'row'
                    }}
                    spaceBetween={15}
                    navigation={{
                        nextEl: `.swiper-button-next-${id}`,
                        prevEl: `.swiper-button-prev-${id}`,
                    }}
                    breakpoints={{
                        660: {
                            slidesPerView: 3,
                            grid: { rows: 2 },
                            spaceBetween: 20
                        },
                        1024: {
                            slidesPerView: 5,
                            grid: { rows: 2 },
                            spaceBetween: 25
                        }
                    }}
                    className={`product-swiper-${id} !pb-12`}
                >
                    {products.map(product => (
                        <SwiperSlide key={product._id} className="!h-auto">
                            <ProductCard product={product} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Custom Navigation Buttons */}
                <button className={`swiper-button-prev-${id} absolute top-1/2 -left-2 md:-left-4 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 md:bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-all hover:bg-primary hover:border-primary disabled:hidden shadow-xl`}>
                    <i className="fas fa-chevron-left text-xs md:text-base"></i>
                </button>
                <button className={`swiper-button-next-${id} absolute top-1/2 -right-2 md:-right-4 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 md:bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-100 md:opacity-0 md:group-hover/slider:opacity-100 transition-all hover:bg-primary hover:border-primary disabled:hidden shadow-xl`}>
                    <i className="fas fa-chevron-right text-xs md:text-base"></i>
                </button>

                <style>{`
                    .product-swiper-${id} .swiper-wrapper {
                        flex-direction: row !important;
                        display: flex !important;
                    }
                    .product-swiper-${id} .swiper-slide {
                        margin-top: 0 !important;
                        height: calc((100% - 30px) / 2) !important;
                        margin-bottom: 30px !important;
                    }
                    .product-swiper-${id} .swiper-slide:nth-child(2n) {
                        margin-bottom: 0 !important;
                    }
                `}</style>
            </div>
        );
    };

    const ColoredTitle = ({ title, coloredWord, color, useGradient, gradient, className, style, as: Component = "h2" }) => {
        if (!coloredWord || !title.toLowerCase().includes(coloredWord.toLowerCase())) {
            return <Component className={className} style={style}>{title}</Component>;
        }

        const parts = title.split(new RegExp(`(${coloredWord})`, 'gi'));

        const coloredStyle = useGradient ? {
            backgroundImage: gradient || 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block'
        } : {
            color: color || '#6366f1'
        };

        return (
            <Component className={className} style={style}>
                {parts.map((part, i) =>
                    part.toLowerCase() === coloredWord.toLowerCase()
                        ? <span key={i} style={coloredStyle}>{part}</span>
                        : part
                )}
            </Component>
        );
    };

    const defaultChannels = [
        "ABC News", "beIN", "CNN", "Disney", "ESPN", "FOX", "HBO", "NBC", "AMC", "NBA",
        "Eleven", "Canal+", "BT Sport", "Play", "DAZN", "Nova", "Super", "SN"
    ];

    const defaultSports = [
        "LaLiga", "Serie A", "Premier", "Champions", "Europa", "NHL", "NFL", "MLB", "MLS", "NBA", "F1", "Bundesliga"
    ];

    const devices = [
        { name: "FireTV", icon: "fab fa-amazon" },
        { name: "Android", icon: "fab fa-android" },
        { name: "Roku", icon: "fas fa-tv" },
        { name: "Xbox", icon: "fab fa-xbox" },
        { name: "MagBox", icon: "fas fa-hdd" },
        { name: "Apple", icon: "fab fa-apple" },
        { name: "Samsung", icon: "fas fa-tv" },
        { name: "Sony", icon: "fas fa-tv" },
        { name: "Windows", icon: "fab fa-windows" },
        { name: "LG", icon: "fas fa-tv" },
        { name: "Huawei", icon: "fas fa-mobile-alt" },
    ];

    const countries = [
        { name: "Europe", flag: "🇪🇺" }, { name: "United States", flag: "🇺🇸" }, { name: "United Kingdom", flag: "🇬🇧" }, { name: "Canada", flag: "🇨🇦" }, { name: "Germany", flag: "🇩🇪" },
        { name: "France", flag: "🇫🇷" }, { name: "Italy", flag: "🇮🇹" }, { name: "Spain", flag: "🇪🇸" }, { name: "Netherlands", flag: "🇳🇱" }, { name: "Belgium", flag: "🇧🇪" },
        { name: "Switzerland", flag: "🇨🇭" }, { name: "Sweden", flag: "🇸🇪" }, { name: "Norway", flag: "🇳🇴" }, { name: "Denmark", flag: "🇩🇰" }, { name: "Finland", flag: "🇫🇮" },
        { name: "Ireland", flag: "🇮🇪" }, { name: "Australia", flag: "🇦🇺" }, { name: "New Zealand", flag: "🇳🇿" }, { name: "Brazil", flag: "🇧🇷" }, { name: "Saudi Arabia", flag: "🇸🇦" },
        { name: "United Arab Emirates", flag: "🇦🇪" }, { name: "Poland", flag: "🇵🇱" }, { name: "Turkey", flag: "🇹🇷" }, { name: "Russia", flag: "🇷🇺" }, { name: "Portugal", flag: "🇵🇹" },
        { name: "Greece", flag: "🇬🇷" }
    ];

    if (user) {
        return (
            <div className="min-h-screen bg-[#020617] text-white font-[Inter]">
                <SEO title="Espace Client - SKYGROS" noindex={true} />

                <style>{`
                    .hero-swiper .swiper-pagination-bullet {
                        background: white;
                        opacity: 0.3;
                        width: 12px;
                        height: 4px;
                        border-radius: 2px;
                        transition: all 0.3s ease;
                    }
                    .hero-swiper .swiper-pagination-bullet-active {
                        background: #6366f1;
                        opacity: 1;
                        width: 32px;
                    }
                    .hero-swiper .swiper-button-next, .hero-swiper .swiper-button-prev {
                        color: white !important;
                        background: rgba(255, 255, 255, 0.05) !important;
                        width: 40px !important;
                        height: 40px !important;
                        border-radius: 50% !important;
                        padding:10px !important;

                        backdrop-filter: blur(12px) !important;
                        border: 2px solid rgba(255, 255, 255, 0.1) !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }
                    .hero-swiper .swiper-button-next:after, .hero-swiper .swiper-button-prev:after {
                        font-size: 18px !important;
                        font-weight: bold !important;
                    }
                    .hero-swiper .swiper-button-next:hover, .hero-swiper .swiper-button-prev:hover {
                        background: #6366f1 !important;
                        border-color: #6366f1 !important;
                        transform: scale(1.1);
                        box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
                    }
                    .hero-swiper .swiper-slide {
                        opacity: 0.3;
                        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                        transform: scale(0.85);
                        filter: blur(2px);
                    }
                    .hero-swiper .swiper-slide-active {
                        opacity: 1;
                        transform: scale(1);
                        filter: blur(0);
                    }

                    @keyframes fadeInDown {
                        from {
                            opacity: 0;
                            transform: translate(-50%, -20px);
                        }
                        to {
                            opacity: 1;
                            transform: translate(-50%, 0);
                        }
                    }

                    .animate-fade-in-down {
                        animation: fadeInDown 0.4s ease-out forwards;
                    }

                    @keyframes progress {
                        from { width: 100%; }
                        to { width: 0%; }
                    }

                    .animate-progress {
                        animation: progress 4s linear forwards;
                    }
                `}</style>

                {/* Hero Slider Section */}
                <br />
                <div className="relative w-full h-[35vh] md:h-[45vh] overflow-hidden mb-8 bg-[#020617] ">
                    {isAdmin && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick('carousel', settings?.home?.carousel || []);
                            }}
                            className="absolute top-6 right-6 z-[500] bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-xl backdrop-blur-xl"
                            style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                        >
                            <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors text-sm" style={{ color: 'var(--accent-color)' }}></i>
                        </button>
                    )}

                    <Swiper
                        modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={20}
                        slidesPerView={1.2}
                        breakpoints={{
                            768: { slidesPerView: 1.5, spaceBetween: 40 }
                        }}
                        centeredSlides={true}
                        speed={1000}
                        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                        pagination={{ clickable: true }}
                        navigation={true}
                        loop={true}
                        className="hero-swiper h-full w-full"
                    >
                        {(settings?.home?.carousel?.length > 0 ? settings.home.carousel : [
                            { image: "/assets/slider1.png", title: "Expérience IPTV Premium", subtitle: "Plus de 22,000 chaînes en 4K/FHD" },
                            { image: "/assets/slider2.png", title: "Infrastruture Wholesale", subtitle: "La solution n°1 pour les revendeurs" }
                        ]).map((slide, idx) => (
                            <SwiperSlide key={idx} className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent z-10 transition-opacity duration-700 group-hover:opacity-80"></div>
                                <img
                                    src={formatImageUrl(slide.image)}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-110"
                                    alt={slide.title}
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=2000' }}
                                />
                                <div className="relative h-full flex flex-col items-start justify-end p-8 md:p-16 z-20">
                                    <div className="max-w-3xl transform transition-transform duration-700 group-hover:translate-x-2">
                                        <h1 className="text-2xl md:text-5xl font-black mb-4 tracking-tight text-white leading-tight drop-shadow-2xl">
                                            {slide.title}
                                        </h1>
                                        <p className="text-sm md:text-lg text-gray-300 font-medium line-clamp-2 mb-8 opacity-80 drop-shadow-xl">
                                            {slide.subtitle}
                                        </p>
                                        {slide.buttonText && (
                                            <Link
                                                to={slide.link || "#"}
                                                className="inline-flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm bg-primary hover:bg-white hover:text-primary transition-all shadow-xl shadow-primary/20"
                                                style={{ backgroundColor: slide.color }}
                                            >
                                                <span>{slide.buttonText}</span>
                                                <i className="fas fa-chevron-right text-[10px]"></i>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Best Sellers Section */}
                {user && (
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative">
                        <div style={{ marginBottom: '30px' }}>
                            <h1 className="section-title" style={{ marginBottom: '10px' }}>
                                {settings?.home?.bestSellersTitle || "Meilleures Ventes"}
                            </h1>
                            <div className="flex justify-between items-center" style={{ gap: '15px', flexWrap: 'wrap' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                                    {loadingProducts ? "Chargement..." : `Affichage de ${bestSellers.length} produits premium`}
                                </p>
                                <div className="flex items-center gap-4">
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleEditClick('bestSellers', settings?.home?.bestSellers || [])}
                                            className="bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group"
                                            style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                                        >
                                            <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {loadingProducts ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-[300px] bg-white/5 rounded-3xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : bestSellers.length > 0 ? (
                            <ProductSlider products={bestSellers} id="bestsellers-auth" />
                        ) : (
                            <div className="py-20 text-center glass rounded-3xl border border-dashed border-white/10">
                                <i className="fas fa-shopping-bag text-4xl text-gray-600 mb-4 block"></i>
                                <p className="text-gray-500">Aucun produit dans cette section.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Memberships Section */}
                {user && (
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative">
                        <div className="flex justify-between items-center mb-10">
                            <h1 className="section-title">
                                {settings?.home?.membershipsSection?.title || "Memberships"}
                            </h1>
                            {isAdmin && (
                                <button
                                    onClick={() => handleEditClick('memberships', settings?.home?.membershipsSection || { items: [] })}
                                    className="bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group"
                                >
                                    <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors"></i>
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                            {(settings?.home?.membershipsSection?.items || []).map((item, i) => (
                                <Link to={item.link || "#"} key={i} className="group relative overflow-hidden rounded-xl md:rounded-[24px] aspect-square md:aspect-[3/4] block shadow-2xl border border-white/5 transition-all duration-500 hover:shadow-primary/20 hover:-translate-y-2">
                                    <img src={formatImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>

                                    {/* Overlay Content */}
                                    <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6 flex items-start gap-2 md:gap-3">
                                        <div className="w-0.5 md:w-1 h-6 md:h-10 bg-[#3cfdb3] rounded-full shadow-[0_0_20px_rgba(60,253,179,0.6)] shrink-0 transition-transform duration-500 group-hover:scale-y-110"></div>
                                        <h3 className="text-sm md:text-2xl font-[900] text-white leading-[1.1] tracking-tight drop-shadow-2xl">
                                            {item.title}
                                        </h3>
                                    </div>

                                    {/* Subtle Glow & Shine on Hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ring-1 ring-inset ring-white/20 rounded-xl md:rounded-[24px]"></div>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Gift Cards Section */}
                {user && (
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative">
                        <div className="flex justify-between items-center mb-10">
                            <h1 className="section-title">
                                {settings?.home?.giftCardsSection?.title || "Gift Cards"}
                            </h1>
                            {isAdmin && (
                                <button
                                    onClick={() => handleEditClick('giftCards', settings?.home?.giftCardsSection || { items: [] })}
                                    className="bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group"
                                >
                                    <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors"></i>
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {(settings?.home?.giftCardsSection?.items || []).map((item, i) => (
                                <Link to={item.link || "#"} key={i}
                                    style={{ backgroundColor: item.color || '#0070d1' }}
                                    className="relative overflow-hidden p-6 rounded-2xl h-40 flex flex-col items-center justify-center text-center transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group shadow-lg border border-white/10"
                                >
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10 transition-transform group-hover:scale-110 duration-300">
                                        <h4 className="text-sm font-bold opacity-80 mb-1 uppercase tracking-widest">{item.title}</h4>
                                        <h3 className="text-xl md:text-2xl font-black">{item.subtitle}</h3>
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12">
                                        <i className="fas fa-gift text-8xl"></i>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Deals Section (Copy of Best Sellers design) */}
                {user && (
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative">
                        <div style={{ marginBottom: '30px' }}>
                            <ColoredTitle
                                title={settings?.home?.dealsTitle || "Deals"}
                                coloredWord={settings?.home?.dealsColoredWord || "Deals"}
                                className="section-title"
                                style={{ marginBottom: '10px' }}
                                as="h1"
                            />
                            <div className="flex justify-between items-center" style={{ gap: '15px', flexWrap: 'wrap' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                                    {loadingProducts ? "Chargement..." : (settings?.home?.dealsSubtitle || "Offres exceptionnelles à durée limitée")}
                                </p>
                                <div className="flex items-center gap-4">
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleEditClick('deals', settings?.home?.deals || [])}
                                            className="bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group"
                                            style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                                        >
                                            <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {loadingProducts ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-[300px] bg-white/5 rounded-3xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : deals.length > 0 ? (
                            <ProductSlider products={deals} id="deals-auth" />
                        ) : (
                            <div className="py-20 text-center glass rounded-3xl border border-dashed border-white/10">
                                <i className="fas fa-tag text-4xl text-gray-600 mb-4 block"></i>
                                <p className="text-gray-500">Aucune offre spéciale disponible pour le moment.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                        <img src="/logo.png" alt="SKYGROS" style={{ height: '70px', width: 'auto', margin: '0 auto' }} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white/90">
                            Bienvenue sur votre espace professionnel
                        </h2>
                        <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
                            Votre session est active. Utilisez la barre de navigation pour accéder à vos outils et services IPTV de haute qualité.
                        </p>
                    </div>
                    <div className="flex justify-center gap-4">
                        <div className="w-12 h-1 bg-primary/50 rounded-full"></div>
                        <div className="w-4 h-1 bg-primary/30 rounded-full"></div>
                        <div className="w-2 h-1 bg-primary/20 rounded-full"></div>
                    </div>
                </div>

                {/* Notification Area */}
                {notification.show && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] min-w-[350px] animate-fade-in-down">
                        <div className={`relative px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-2xl border overflow-hidden ${notification.type === 'success'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {/* Progress Bar Animation */}
                            <div
                                className={`absolute bottom-0 left-0 h-1 animate-progress ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                            ></div>

                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${notification.type === 'success' ? 'bg-green-500/20 animate-pulse' : 'bg-red-500/20'
                                }`}>
                                <i className={`fas ${notification.type === 'success' ? 'fa-check' : 'fa-times'} text-lg`}></i>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg leading-none">
                                    {notification.type === 'success' ? "Succès" : "Erreur"}
                                </span>
                                <span className="text-sm opacity-80 mt-1">{notification.message}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Home Modal (Duplicate for User View) */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl animate-modal-backdrop" onClick={() => setIsEditModalOpen(false)}></div>
                        <div className="relative bg-[#0f172a]/95 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-8 custom-scrollbar text-left text-white animate-modal-content">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white capitalize">Modifier {editingSection}</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {editingSection === 'carousel' ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-400 text-sm font-semibold block">Images du Carrousel</span>
                                            <button
                                                onClick={() => setEditData([...(editData || []), { image: "", title: "", subtitle: "", color: "#6366f1", buttonText: "DÉCOUVRIR", link: "#" }])}
                                                className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full hover:bg-primary/30 font-bold"
                                            >
                                                + Ajouter Photo
                                            </button>
                                        </div>
                                        <div className="space-y-6">
                                            {Array.isArray(editData) && editData.map((slide, i) => (
                                                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4 relative group">
                                                    <button
                                                        onClick={() => setEditData(editData.filter((_, idx) => idx !== i))}
                                                        className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center text-[10px] invisible group-hover:visible z-[10010]"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <label className="block">
                                                            <span className="text-gray-400 text-[10px] mb-1 block uppercase">URL de l'image</span>
                                                            <input
                                                                type="text"
                                                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs"
                                                                value={slide.image}
                                                                onChange={(e) => {
                                                                    const newData = [...editData];
                                                                    newData[i].image = e.target.value;
                                                                    setEditData(newData);
                                                                }}
                                                            />
                                                        </label>
                                                        <label className="block">
                                                            <span className="text-gray-400 text-[10px] mb-1 block uppercase">Titre</span>
                                                            <input
                                                                type="text"
                                                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs font-bold"
                                                                value={slide.title}
                                                                onChange={(e) => {
                                                                    const newData = [...editData];
                                                                    newData[i].title = e.target.value;
                                                                    setEditData(newData);
                                                                }}
                                                            />
                                                        </label>
                                                        <label className="block">
                                                            <span className="text-gray-400 text-[10px] mb-1 block uppercase">Sous-titre</span>
                                                            <input
                                                                type="text"
                                                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs"
                                                                value={slide.subtitle}
                                                                onChange={(e) => {
                                                                    const newData = [...editData];
                                                                    newData[i].subtitle = e.target.value;
                                                                    setEditData(newData);
                                                                }}
                                                            />
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <label className="block">
                                                                <span className="text-gray-400 text-[10px] mb-1 block uppercase">Texte Bouton</span>
                                                                <input
                                                                    type="text"
                                                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs"
                                                                    value={slide.buttonText}
                                                                    onChange={(e) => {
                                                                        const newData = [...editData];
                                                                        newData[i].buttonText = e.target.value;
                                                                        setEditData(newData);
                                                                    }}
                                                                />
                                                            </label>
                                                            <label className="block">
                                                                <span className="text-gray-400 text-[10px] mb-1 block uppercase">Lien (URL)</span>
                                                                <input
                                                                    type="text"
                                                                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs"
                                                                    value={slide.link}
                                                                    onChange={(e) => {
                                                                        const newData = [...editData];
                                                                        newData[i].link = e.target.value;
                                                                        setEditData(newData);
                                                                    }}
                                                                />
                                                            </label>
                                                            <label className="block">
                                                                <span className="text-gray-400 text-[10px] mb-1 block uppercase">Couleur</span>
                                                                <input
                                                                    type="color"
                                                                    className="w-full h-8 bg-black/20 border border-white/10 rounded cursor-pointer p-0.5"
                                                                    value={slide.color || "#6366f1"}
                                                                    onChange={(e) => {
                                                                        const newData = [...editData];
                                                                        newData[i].color = e.target.value;
                                                                        setEditData(newData);
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : editingSection === 'footer' ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className="block">
                                                <span className="text-gray-400 text-sm mb-1 block">Titre de la marque</span>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                    value={editData.brandTitle || ""}
                                                    onChange={(e) => setEditData({ ...editData, brandTitle: e.target.value })}
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-gray-400 text-sm mb-1 block">Mot à colorer</span>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                    value={editData.brandColoredWord || ""}
                                                    onChange={(e) => setEditData({ ...editData, brandColoredWord: e.target.value })}
                                                />
                                            </label>
                                        </div>
                                        <label className="block">
                                            <span className="text-gray-400 text-sm mb-1 block">Description du Footer</span>
                                            <textarea
                                                rows="3"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                value={editData.description || ""}
                                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                            ></textarea>
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-400 text-sm mb-1 block">Copyright</span>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                value={editData.copyright || ""}
                                                onChange={(e) => setEditData({ ...editData, copyright: e.target.value })}
                                            />
                                        </label>

                                        {/* Socials Editor */}
                                        <div className="space-y-4 border-t border-white/10 pt-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-gray-400 text-sm font-semibold">Réseaux Sociaux</span>
                                                <button
                                                    onClick={() => setEditData({ ...editData, socials: [...(editData.socials || []), { icon: "fab fa-facebook", link: "#" }] })}
                                                    className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full hover:bg-primary/30 font-bold"
                                                >
                                                    + Ajouter
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {(editData.socials || []).map((social, i) => (
                                                    <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2 relative">
                                                        <button
                                                            onClick={() => setEditData({ ...editData, socials: editData.socials.filter((_, idx) => idx !== i) })}
                                                            className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                        <input
                                                            type="text"
                                                            placeholder="Icon (ex: fab fa-facebook)"
                                                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                                            value={social.icon}
                                                            onChange={(e) => {
                                                                const newSocials = [...editData.socials];
                                                                newSocials[i].icon = e.target.value;
                                                                setEditData({ ...editData, socials: newSocials });
                                                            }}
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Lien"
                                                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                                            value={social.link}
                                                            onChange={(e) => {
                                                                const newSocials = [...editData.socials];
                                                                newSocials[i].link = e.target.value;
                                                                setEditData({ ...editData, socials: newSocials });
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Footer Columns Editor */}
                                        <div className="space-y-4 border-t border-white/10 pt-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-gray-400 text-sm font-semibold block">Colonnes du Footer</span>
                                                <button
                                                    onClick={() => setEditData({ ...editData, columns: [...(editData.columns || []), { title: "Nouvelle Colonne", links: [] }] })}
                                                    className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full hover:bg-primary/30 font-bold"
                                                >
                                                    + Ajouter Colonne
                                                </button>
                                            </div>
                                            <div className="space-y-6">
                                                {(editData.columns || []).map((col, i) => (
                                                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4 relative">
                                                        <button
                                                            onClick={() => setEditData({ ...editData, columns: editData.columns.filter((_, idx) => idx !== i) })}
                                                            className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center text-[10px] z-10"
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                        <div className="flex justify-between items-center">
                                                            <input
                                                                type="text"
                                                                placeholder="Titre de la colonne"
                                                                className="bg-transparent border-b border-white/20 focus:border-primary text-white font-bold outline-none"
                                                                value={col.title}
                                                                onChange={(e) => {
                                                                    const newCols = [...editData.columns];
                                                                    newCols[i].title = e.target.value;
                                                                    setEditData({ ...editData, columns: newCols });
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newCols = [...editData.columns];
                                                                    newCols[i].links = [...(newCols[i].links || []), { name: "Lien", link: "#" }];
                                                                    setEditData({ ...editData, columns: newCols });
                                                                }}
                                                                className="text-[10px] bg-white/10 text-white px-2 py-1 rounded-md hover:bg-white/20"
                                                            >
                                                                + Lien
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {(col.links || []).map((link, j) => (
                                                                <div key={j} className="flex gap-2 items-center">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Nom"
                                                                        className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                                                        value={link.name}
                                                                        onChange={(e) => {
                                                                            const newCols = [...editData.columns];
                                                                            newCols[i].links[j].name = e.target.value;
                                                                            setEditData({ ...editData, columns: newCols });
                                                                        }}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="URL"
                                                                        className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                                                        value={link.link}
                                                                        onChange={(e) => {
                                                                            const newCols = [...editData.columns];
                                                                            newCols[i].links[j].link = e.target.value;
                                                                            setEditData({ ...editData, columns: newCols });
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            const newCols = [...editData.columns];
                                                                            newCols[i].links = newCols[i].links.filter((_, idx) => idx !== j);
                                                                            setEditData({ ...editData, columns: newCols });
                                                                        }}
                                                                        className="text-red-500 hover:text-red-400"
                                                                    >
                                                                        <i className="fas fa-trash text-[10px]"></i>
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (editingSection === 'bestSellers' || editingSection === 'deals') ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-gray-500 uppercase font-bold">Titre principal</span>
                                                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={editData.title || ""} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                                            </div>
                                            {editingSection === 'deals' && (
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Sous-titre / Description</span>
                                                    <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={editData.subtitle || ""} onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-400 text-sm font-semibold block">
                                                {editingSection === 'bestSellers' ? "Sélectionner les Meilleurs Produits" : "Sélectionner les Produits en Promotion"}
                                            </span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{(allProducts || []).filter(p => (editData?.items || []).includes(p._id)).length} Sélectionnés</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {allProducts.map(product => (
                                                <div key={product._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 group">
                                                    <div className="flex items-center gap-4">
                                                        <img src={product.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                                        <div>
                                                            <div className="text-xs font-bold text-white truncate max-w-[200px]">{product.title}</div>
                                                            <div className="text-[10px] text-gray-500">{product.category} • {product.price}€</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await axios.put(`${API_BASE_URL}/products/${product._id}`, { isHidden: !product.isHidden });
                                                                    const updated = allProducts.map(p => p._id === product._id ? { ...p, isHidden: !p.isHidden } : p);
                                                                    setAllProducts(updated);
                                                                } catch (err) { showNotify("Erreur", "error"); }
                                                            }}
                                                            className={`p-2 rounded-lg transition-all ${product.isHidden ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400 hover:bg-white/10'}`}
                                                            title={product.isHidden ? "Rendre visible" : "Masquer"}
                                                        >
                                                            <i className={`fas ${product.isHidden ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm("Supprimer définitivement ce produit ?")) {
                                                                    try {
                                                                        await axios.delete(`${API_BASE_URL}/products/${product._id}`);
                                                                        setAllProducts(allProducts.filter(p => p._id !== product._id));
                                                                        setEditData({ ...editData, items: (editData.items || []).filter(id => id !== product._id) });
                                                                    } catch (err) { showNotify("Erreur", "error"); }
                                                                }
                                                            }}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const currentItems = editData?.items || [];
                                                                if (currentItems.includes(product._id)) {
                                                                    setEditData({ ...editData, items: currentItems.filter(id => id !== product._id) });
                                                                } else {
                                                                    setEditData({ ...editData, items: [...currentItems, product._id] });
                                                                }
                                                            }}
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${(editData?.items || []).includes(product._id) ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-gray-500 border border-white/10 hover:border-primary/50'}`}
                                                        >
                                                            <i className={`fas ${(editData?.items || []).includes(product._id) ? 'fa-check' : 'fa-plus'}`}></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Shared fields like title / subtitle (Copied from the other modal) */}
                                        {['memberships', 'giftCards', 'hero', 'pricing', 'cta', 'panel', 'library', 'channels', 'sports', 'features', 'footer', 'devices', 'countries', 'testimonials', 'faq'].includes(editingSection) && (
                                            <div className="grid grid-cols-1 gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold">Titre principal</span>
                                                        <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={editData.title || ""} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                                                    </div>
                                                    {editingSection !== 'footer' && (
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] text-gray-500 uppercase font-bold">Sous-titre / Description</span>
                                                            <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={editData.subtitle || ""} onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* List Items Editor (Memberships, Gift Cards, etc.) */}
                                        {editData?.items && Array.isArray(editData.items) && (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-sm font-bold text-gray-400">Éléments de la liste</h4>
                                                    <button
                                                        onClick={() => {
                                                            const newItemMap = {
                                                                memberships: { title: "", image: "", link: "#" },
                                                                giftCards: { title: "", subtitle: "", link: "#", color: "#0070d1" },
                                                                hero: { title: "", subtitle: "", image: "", buttonText: "Commencer", link: "#" },
                                                                testimonials: { name: "", initials: "", text: "", stars: 5 },
                                                                faq: { question: "", answer: "" },
                                                                channels: { name: "", image: "", link: "#" },
                                                                sports: { name: "", image: "", link: "#" },
                                                                devices: { name: "", icon: "fas fa-desktop" },
                                                                countries: { name: "", flag: "🏳️" }
                                                            };
                                                            setEditData({ ...editData, items: [...editData.items, newItemMap[editingSection] || {}] });
                                                        }}
                                                        className="text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30 font-bold transition-all"
                                                    >
                                                        + Ajouter un élément
                                                    </button>
                                                </div>
                                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {editData.items.map((item, i) => (
                                                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 relative group">
                                                            <button
                                                                onClick={() => {
                                                                    const newItems = editData.items.filter((_, idx) => idx !== i);
                                                                    setEditData({ ...editData, items: newItems });
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center text-[10px] invisible group-hover:visible shadow-lg z-10"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>

                                                            {editingSection === 'memberships' ? (
                                                                <div className="space-y-3">
                                                                    <div className="flex gap-3">
                                                                        <div className="flex-1 space-y-2">
                                                                            <input type="text" placeholder="Texte à afficher (ex: Xbox Game Pass)" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.title} onChange={(e) => {
                                                                                const newItems = [...editData.items];
                                                                                newItems[i].title = e.target.value;
                                                                                setEditData({ ...editData, items: newItems });
                                                                            }} />
                                                                            <input type="text" placeholder="Lien de l'image (URL)" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.image} onChange={(e) => {
                                                                                const newItems = [...editData.items];
                                                                                newItems[i].image = e.target.value;
                                                                                setEditData({ ...editData, items: newItems });
                                                                            }} />
                                                                        </div>
                                                                        {item.image && (
                                                                            <div className="w-16 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                                                                <img src={item.image} className="w-full h-full object-cover" alt="preview" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <input type="text" placeholder="Lien de redirection" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.link} onChange={(e) => {
                                                                        const newItems = [...editData.items];
                                                                        newItems[i].link = e.target.value;
                                                                        setEditData({ ...editData, items: newItems });
                                                                    }} />
                                                                </div>
                                                            ) : editingSection === 'giftCards' ? (
                                                                <div className="space-y-3">
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="space-y-1">
                                                                            <span className="text-[10px] text-gray-500 uppercase font-bold">Petit Titre</span>
                                                                            <input type="text" placeholder="ex: XBOX" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.title} onChange={(e) => {
                                                                                const newItems = [...editData.items];
                                                                                newItems[i].title = e.target.value;
                                                                                setEditData({ ...editData, items: newItems });
                                                                            }} />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <span className="text-[10px] text-gray-500 uppercase font-bold">Grand Titre</span>
                                                                            <input type="text" placeholder="ex: Gift Cards" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.subtitle} onChange={(e) => {
                                                                                const newItems = [...editData.items];
                                                                                newItems[i].subtitle = e.target.value;
                                                                                setEditData({ ...editData, items: newItems });
                                                                            }} />
                                                                        </div>
                                                                    </div>
                                                                    <input type="text" placeholder="Lien" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.link} onChange={(e) => {
                                                                        const newItems = [...editData.items];
                                                                        newItems[i].link = e.target.value;
                                                                        setEditData({ ...editData, items: newItems });
                                                                    }} />
                                                                    <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                                                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Couleur:</span>
                                                                        <input type="color" className="bg-transparent border-none cursor-pointer h-8 w-16" value={item.color || "#0070d1"} onChange={(e) => {
                                                                            const newItems = [...editData.items];
                                                                            newItems[i].color = e.target.value;
                                                                            setEditData({ ...editData, items: newItems });
                                                                        }} />
                                                                    </div>
                                                                </div>
                                                            ) : editingSection === 'testimonials' ? (
                                                                <div className="space-y-2">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input type="text" placeholder="Nom" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs" value={item.name} onChange={(e) => {
                                                                            const newItems = [...editData.items];
                                                                            newItems[i].name = e.target.value;
                                                                            setEditData({ ...editData, items: newItems });
                                                                        }} />
                                                                        <input type="text" placeholder="Initiales" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs" value={item.initials} onChange={(e) => {
                                                                            const newItems = [...editData.items];
                                                                            newItems[i].initials = e.target.value;
                                                                            setEditData({ ...editData, items: newItems });
                                                                        }} />
                                                                    </div>
                                                                    <textarea placeholder="Témoignage" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs h-20" value={item.text} onChange={(e) => {
                                                                        const newItems = [...editData.items];
                                                                        newItems[i].text = e.target.value;
                                                                        setEditData({ ...editData, items: newItems });
                                                                    }} />
                                                                </div>
                                                            ) : editingSection === 'faq' ? (
                                                                <div className="space-y-2">
                                                                    <input type="text" placeholder="Question" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs" value={item.question} onChange={(e) => {
                                                                        const newItems = [...editData.items];
                                                                        newItems[i].question = e.target.value;
                                                                        setEditData({ ...editData, items: newItems });
                                                                    }} />
                                                                    <textarea placeholder="Réponse" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs h-20" value={item.answer} onChange={(e) => {
                                                                        const newItems = [...editData.items];
                                                                        newItems[i].answer = e.target.value;
                                                                        setEditData({ ...editData, items: newItems });
                                                                    }} />
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <input type="text" placeholder="Nom" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs" value={item.name} onChange={(e) => {
                                                                        const newItems = [...editData.items];
                                                                        newItems[i].name = e.target.value;
                                                                        setEditData({ ...editData, items: newItems });
                                                                    }} />
                                                                    <input type="text" placeholder="Lien/Image" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs" value={item.image || item.icon || item.flag} onChange={(e) => {
                                                                        const newItems = [...editData.items];
                                                                        if (item.flag !== undefined) newItems[i].flag = e.target.value;
                                                                        else if (item.icon !== undefined) newItems[i].icon = e.target.value;
                                                                        else newItems[i].image = e.target.value;
                                                                        setEditData({ ...editData, items: newItems });
                                                                    }} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex gap-4 pt-6 border-t border-white/10">
                                    <button
                                        onClick={handleSaveSettings}
                                        className="flex-1 py-3 bg-primary rounded-xl font-bold text-white hover:bg-primary/80 transition-all"
                                    >
                                        Enregistrer les modifications
                                    </button>
                                    <button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-6 py-3 bg-white/10 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Section */}
                <footer className="bg-darker border-t border-white/10 pt-16 pb-8 relative mt-20">
                    {isAdmin && (
                        <button
                            onClick={() => handleEditClick('footer', settings?.home?.footerSection || {})}
                            className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                            style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                        >
                            <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                        </button>
                    )}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-12 mb-12">
                            <div className="col-span-2">
                                <div className="flex items-center space-x-2 mb-4">
                                    <img src="/logo.png" alt="SKYGROS" style={{ height: '40px', width: 'auto' }} />
                                </div>
                                <p className="text-gray-400 mb-6 max-w-sm">
                                    {settings?.home?.footerSection?.description || "La solution wholesale IPTV la plus fiable pour les revendeurs professionnels. Infrastructure stable, API puissante et support 24/7."}
                                </p>
                                <div className="flex space-x-4">
                                    {(settings?.home?.footerSection?.socials || [
                                        { icon: "fab fa-telegram", link: "#" },
                                        { icon: "fab fa-whatsapp", link: "#" },
                                        { icon: "fab fa-discord", link: "#" },
                                        { icon: "fab fa-skype", link: "#" }
                                    ]).map((social, idx) => (
                                        <a key={idx} href={social.link} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all">
                                            <i className={social.icon}></i>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {(settings?.home?.footerSection?.columns || [
                                {
                                    title: "Produit",
                                    links: [
                                        { name: "Fonctionnalités", link: "#" },
                                        { name: "Tarifs", link: "#" },
                                        { name: "API Documentation", link: "#" },
                                        { name: "Panel Demo", link: "#" }
                                    ]
                                },
                                {
                                    title: "Support",
                                    links: [
                                        { name: "Centre d'aide", link: "#" },
                                        { name: "Status Serveur", link: "#" },
                                        { name: "Contact", link: "#" },
                                        { name: "Affiliation", link: "#" }
                                    ]
                                },
                                {
                                    title: "Légal",
                                    links: [
                                        { name: "CGV", link: "#" },
                                        { name: "Politique de confidentialité", link: "#" },
                                        { name: "DMCA", link: "#" },
                                        { name: "Contact", link: "#" }
                                    ]
                                }
                            ]).map((col, idx) => (
                                <div key={idx}>
                                    <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                                    <ul className="space-y-2 text-gray-400">
                                        {(col.links || []).map((link, lIdx) => (
                                            <li key={lIdx}><a href={link.link} className="hover:text-white transition-colors">{link.name}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-500 text-sm mb-4 md:mb-0">
                                {settings?.home?.footerSection?.copyright || "© 2026SKYGROS. Tous droits réservés."}
                            </p>
                            <div className="flex items-center space-x-4 text-gray-500 text-sm">
                                <span className="flex items-center"><i className="fas fa-lock mr-2"></i> Paiement sécurisé SSL</span>
                                <span className="flex items-center"><i className="fas fa-server mr-2"></i> Uptime 99.9%</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="antialiased bg-[#020617] text-[#e2e8f0] font-[Inter]" style={{ overflowX: 'hidden' }}>
            <SEO
                title="La Solution Wholesale IPTV Pour Les Professionnels"
                description="Boostez votre business avec notre infrastructure IPTV professionnelle. Panel de gestion complet, API REST, livraison instantanée et marges compétitives."
                keywords="IPTV, Wholesale, Reseller, Panel, API, Streaming, VOD, 4K"
            />
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                .glass-effect {
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .gradient-text {
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .hero-gradient {
                    background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                                radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.15) 0%, transparent 50%);
                }
                
                .card-hover {
                    transition: all 0.3s ease;
                }
                
                .card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px -15px rgba(99, 102, 241, 0.3);
                }
                
                .grid-pattern {
                    background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 50px 50px;
                }
                
                .glow {
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
                }
                
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -20px);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }

                .animate-fade-in-down {
                    animation: fadeInDown 0.4s ease-out forwards;
                }

                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }

                .animate-progress {
                    animation: progress 4s linear forwards;
                }

                @keyframes modalBackdropIn {
                    from { opacity: 0; backdrop-filter: blur(0); }
                    to { opacity: 1; backdrop-filter: blur(12px); }
                }

                @keyframes modalContentIn {
                    from { opacity: 0; transform: scale(0.9) translateY(30px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .animate-modal-backdrop {
                    animation: modalBackdropIn 0.4s ease-out forwards;
                }

                .animate-modal-content {
                    animation: modalContentIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
            `}</style>

            {/* Notification */}
            {notification.show && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in-down">
                    <div className={`relative px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-2xl border overflow-hidden ${notification.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {/* Progress Bar Animation */}
                        <div
                            className={`absolute bottom-0 left-0 h-1 animate-progress ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        ></div>

                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${notification.type === 'success' ? 'bg-green-500/20 animate-pulse' : 'bg-red-500/20'
                            }`}>
                            <i className={`fas ${notification.type === 'success' ? 'fa-check' : 'fa-times'} text-lg`}></i>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-none">
                                {notification.type === 'success' ? "Succès" : "Erreur"}
                            </span>
                            <span className="text-sm opacity-80 mt-1">{notification.message}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center hero-gradient pt-20 overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-50"></div>

                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('hero', settings?.home?.hero || {})}
                        className="absolute top-24 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}

                {/* Animated Background Elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-float">
                        <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                        <span className="text-sm text-gray-300">Plus de 15,000 revendeurs actifs worldwide</span>
                    </div>

                    <ColoredTitle
                        title={settings?.home?.hero?.title || "La Solution Wholesale IPTV Pour Les Professionnels"}
                        coloredWord={settings?.home?.hero?.coloredWord || "Wholesale IPTV"}
                        color={settings?.home?.hero?.color}
                        useGradient={settings?.home?.hero?.useGradient}
                        gradient={settings?.home?.hero?.gradient}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
                        as="h1"
                    />

                    <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        {settings?.home?.hero?.subtitle || "Boostez votre business avec notre infrastructure IPTV professionnelle. Panel de gestion complet, API REST, livraison instantanée et marges compétitives jusqu'à 300%."}
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to={settings?.home?.hero?.primaryBtnLink || "/register"} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-full font-semibold text-white text-lg hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                            <span>{settings?.home?.hero?.primaryBtnText || "Commencer Gratuitement"}</span>
                            <i className="fas fa-arrow-right"></i>
                        </Link>
                        <Link to={settings?.home?.hero?.secondaryBtnLink || "/demos"} className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/20 rounded-full font-semibold text-white text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            <i className="fas fa-play-circle"></i>
                            <span>{settings?.home?.hero?.secondaryBtnText || "Voir la Démo"}</span>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        {(settings?.home?.hero?.stats || [
                            { value: "22K+", label: "Chaînes TV" },
                            { value: "99.9%", label: "Uptime SLA" },
                            { value: "<24h", label: "Support 24/7" },
                            { value: "API", label: "Intégration complète" }
                        ]).map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Movies Section */}
            <section className="py-12 bg-white/5 relative overflow-hidden">
                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('movies', settings?.home?.movies || {})}
                        className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <ColoredTitle
                            title={settings?.home?.movies?.title || "Derniers Films Ajoutés"}
                            coloredWord={settings?.home?.movies?.coloredWord || "Films Ajoutés"}
                            color={settings?.home?.movies?.color}
                            useGradient={settings?.home?.movies?.useGradient}
                            gradient={settings?.home?.movies?.gradient}
                            className="text-2xl md:text-4xl font-bold mb-4"
                        />
                        <p className="text-gray-400">{settings?.home?.movies?.subtitle || "Découvrez les nouveautés disponibles sur notre plateforme VOD"}</p>
                    </div>

                    <div className="relative">
                        <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide px-4">
                            {movies.map((movie) => (
                                <div key={movie.id} className="flex-none w-[160px] md:w-[200px] relative group cursor-pointer card-hover">
                                    <div className="rounded-xl overflow-hidden aspect-[2/3] border border-white/10 relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                                        <img
                                            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                            alt={movie.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                                            <div className="flex items-center space-x-1 text-yellow-400 text-xs mb-1">
                                                <i className="fas fa-star"></i>
                                                <span>{movie.vote_average.toFixed(1)}</span>
                                            </div>
                                            <h4 className="text-white font-bold text-sm line-clamp-2 leading-tight">{movie.title}</h4>
                                        </div>
                                        <div className="absolute top-2 right-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm z-20">VOD</div>
                                    </div>
                                </div>
                            ))}
                            {/* Loading Skeletons */}
                            {movies.length === 0 && [...Array(6)].map((_, i) => (
                                <div key={i} className="flex-none w-[160px] md:w-[200px] animate-pulse">
                                    <div className="bg-white/5 rounded-xl aspect-[2/3]"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-24 relative">
                {isAdmin && (
                    <div className="absolute top-8 right-8 z-50 flex flex-col gap-2">
                        <button
                            onClick={() => handleEditClick('channels', settings?.home?.channels || {})}
                            className="bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                            style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                        >
                            <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                        </button>
                        <button
                            onClick={() => handleEditClick('sports', settings?.home?.sportsSection || {})}
                            className="bg-white/5 hover:bg-red-500/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                            style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        >
                            <i className="fas fa-cog text-gray-400 group-hover:text-red-500 transition-colors"></i>
                        </button>
                    </div>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <ColoredTitle
                            title={settings?.home?.channels?.title || "Watch All Channels with IPTV No Cable TV Required"}
                            coloredWord={settings?.home?.channels?.coloredWord || "IPTV"}
                            color={settings?.home?.channels?.color}
                            useGradient={settings?.home?.channels?.useGradient}
                            gradient={settings?.home?.channels?.gradient}
                            className="text-3xl md:text-5xl font-bold mb-4"
                        />
                        <p className="text-gray-400 text-lg max-w-4xl mx-auto">
                            {settings?.home?.channels?.subtitle || "We offer thousands of TV channels covering Canada, United States, United Kingdom, Portugal, Albania, Germany, Italy, France, Brazil, Romania, Greece, Spain, Sweden, Finland, Ireland, Norway, Denmark, Latin American countries, Arab countries, and almost all countries worldwide."}
                        </p>
                    </div>

                    <div className="glass-effect rounded-3xl p-8 border border-white/10">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4 text-center">
                            {(settings?.home?.channels?.items || defaultChannels.map(n => ({ name: n }))).map((channel, idx) => (
                                <a
                                    key={idx}
                                    href={channel.link || "#"}
                                    className="bg-white/5 rounded-lg h-16 flex items-center justify-center border border-white/5 hover:bg-primary/20 hover:border-primary/30 transition-all group overflow-hidden"
                                >
                                    {channel.image ? (
                                        <img src={channel.image} alt={channel.name} className="max-h-[70%] max-w-[80%] object-contain" />
                                    ) : (
                                        <span className="text-white font-bold opacity-70 group-hover:opacity-100 text-xs sm:text-sm px-1 line-clamp-2">{channel.name}</span>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="text-center mt-20 mb-12">
                        <ColoredTitle
                            title={settings?.home?.sportsSection?.title || "The Best IPTV 2025 To Watch All International Sports Events, including ppv iptv"}
                            coloredWord={settings?.home?.sportsSection?.coloredWord || "Sports Events"}
                            color={settings?.home?.sportsSection?.color}
                            useGradient={settings?.home?.sportsSection?.useGradient}
                            gradient={settings?.home?.sportsSection?.gradient}
                            className="text-3xl md:text-4xl font-bold mb-4"
                        />
                        <p className="text-gray-400 text-lg max-w-4xl mx-auto">
                            {settings?.home?.sportsSection?.subtitle || "At our IPTV subscription service, we are proud to offer an extensive range of sports channels that cater to every sports enthusiast's needs. Our sports channels cover a vast variety of sports including football, basketball, baseball, tennis, golf, rugby, and more."}
                        </p>
                    </div>

                    <div className="glass-effect rounded-3xl p-8 border border-white/10">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-6">
                            {(settings?.home?.sportsSection?.items || defaultSports.map(n => ({ name: n }))).map((sport, idx) => (
                                <a
                                    key={idx}
                                    href={sport.link || "#"}
                                    className="bg-white/5 rounded-lg h-24 flex items-center justify-center border border-white/5 hover:bg-red-500/20 hover:border-red-500/30 transition-all group p-4 overflow-hidden"
                                >
                                    {sport.image ? (
                                        <img
                                            src={sport.image}
                                            alt={sport.name}
                                            className="max-h-full max-w-full object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"
                                        />
                                    ) : (
                                        <span className="text-white font-bold opacity-70 group-hover:opacity-100 text-center text-sm">{sport.name}</span>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Supported Devices Section */}
            <section className="py-20 bg-black/20 relative group">
                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('devices', settings?.home?.devicesSection || {})}
                        className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <ColoredTitle
                        title={settings?.home?.devicesSection?.title || "All Devices Are Supported"}
                        coloredWord={settings?.home?.devicesSection?.coloredWord || "Supported"}
                        color={settings?.home?.devicesSection?.color}
                        useGradient={settings?.home?.devicesSection?.useGradient}
                        gradient={settings?.home?.devicesSection?.gradient}
                        className="text-3xl md:text-5xl font-bold mb-4"
                    />
                    <p className="text-gray-400 text-lg mb-12">
                        {settings?.home?.devicesSection?.subtitle || "Experience seamless streaming across all your favorite devices"}
                    </p>

                    <div className="flex flex-wrap justify-center gap-6">
                        {(settings?.home?.devicesSection?.items || devices).map((device, idx) => (
                            <div key={idx} className="bg-white/5 px-6 py-4 rounded-xl border border-white/10 flex items-center gap-3 min-w-[140px] justify-center hover:border-primary/50 transition-colors">
                                <i className={`${device.icon} text-2xl text-gray-400`}></i>
                                <span className="font-semibold text-gray-300">{device.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Countries Grid Section */}
            <section className="py-20 bg-black/40 relative group">
                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('countries', settings?.home?.countriesSection || {})}
                        className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <ColoredTitle
                            title={settings?.home?.countriesSection?.title || "More Than 50 Countries Available"}
                            coloredWord={settings?.home?.countriesSection?.coloredWord || "50 Countries"}
                            color={settings?.home?.countriesSection?.color}
                            useGradient={settings?.home?.countriesSection?.useGradient}
                            gradient={settings?.home?.countriesSection?.gradient}
                            className="text-3xl md:text-4xl font-bold mb-4"
                        />
                        <p className="text-gray-400 text-lg mb-12">
                            {settings?.home?.countriesSection?.subtitle || "We offer thousands of TV channels from all over the world."}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {(settings?.home?.countriesSection?.items || countries.map(c => ({ name: c.name, image: null, flag: c.flag }))).map((country, idx) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-3 flex items-center space-x-3 border border-white/5 hover:border-white/20 transition-all cursor-default">
                                {country.image ? (
                                    <img src={country.image} alt={country.name} className="w-8 h-6 object-cover rounded shadow-sm" />
                                ) : (
                                    <span className="text-2xl">{country.flag || "🏳️"}</span>
                                )}
                                <span className="text-gray-300 font-medium text-sm">{country.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 relative group">
                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('features', settings?.home?.featuresSection || {})}
                        className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <ColoredTitle
                            title={settings?.home?.featuresSection?.title || "Pourquoi Choisir SKYGROS ?"}
                            coloredWord={settings?.home?.featuresSection?.coloredWord || "SKYGROS"}
                            color={settings?.home?.featuresSection?.color}
                            useGradient={settings?.home?.featuresSection?.useGradient}
                            gradient={settings?.home?.featuresSection?.gradient}
                            className="text-3xl md:text-5xl font-bold mb-4"
                        />
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            {settings?.home?.featuresSection?.subtitle || "Une infrastructure robuste conçue pour les revendeurs sérieux qui veulent scaler leur business."}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(settings?.home?.featuresSection?.items || [
                            { title: "Panel Admin Pro", description: "Gérez vos clients, créez des lignes IPTV, surveillez l'utilisation en temps réel depuis une interface intuitive et moderne.", icon: "fas fa-server", iconBg: "bg-primary/20", iconColor: "text-primary" },
                            { title: "API REST Complète", description: "Automatisez la création et le renouvellement des abonnements. Documentation complète avec exemples en PHP, Node.js et Python.", icon: "fas fa-code", iconBg: "bg-secondary/20", iconColor: "text-secondary" },
                            { title: "Livraison Instantanée", description: "Crédits ajoutés instantanément. Création de lignes en moins de 2 secondes. Zéro délai d'attente pour vos clients.", icon: "fas fa-bolt", iconBg: "bg-accent/20", iconColor: "text-accent" },
                            { title: "Anti-Freeze™", description: "Technologie propriétaire de buffering réduite. Serveurs CDN répartis sur 12 pays pour une latence minimale.", icon: "fas fa-shield-alt", iconBg: "bg-green-500/20", iconColor: "text-green-400" },
                            { title: "Support Prioritaire", description: "Assistance technique dédiée pour les revendeurs via Telegram, WhatsApp et ticket system. Réponse garantie sous 1h.", icon: "fas fa-headset", iconBg: "bg-orange-500/20", iconColor: "text-orange-400" },
                            { title: "Analyses Détaillées", description: "Statistiques de vente, taux de renouvellement, chaînes les plus regardées. Export CSV et rapports automatisés.", icon: "fas fa-chart-line", iconBg: "bg-pink-500/20", iconColor: "text-pink-400" }
                        ]).map((feature, idx) => (
                            <div key={idx} className="glass-effect p-8 rounded-2xl card-hover border border-white/10">
                                <div className={`w-14 h-14 ${feature.iconBg || 'bg-primary/20'} rounded-xl flex items-center justify-center mb-6`}>
                                    <i className={`${feature.icon} text-2xl ${feature.iconColor || 'text-primary'}`}></i>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 relative overflow-hidden group">
                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('pricing', settings?.home?.pricingSection || {})}
                        className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <ColoredTitle
                            title={settings?.home?.pricingSection?.title || "Tarifs Wholesale"}
                            coloredWord={settings?.home?.pricingSection?.coloredWord || "Wholesale"}
                            color={settings?.home?.pricingSection?.color}
                            useGradient={settings?.home?.pricingSection?.useGradient}
                            gradient={settings?.home?.pricingSection?.gradient}
                            className="text-3xl md:text-5xl font-bold mb-4"
                        />
                        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                            {settings?.home?.pricingSection?.subtitle || "Plus vous achetez de crédits, plus le prix unitaire est bas."}
                        </p>

                        {/* Toggle */}
                        <div className="flex justify-center items-center gap-4 mb-8">
                            <span className="text-gray-300">{settings?.home?.pricingSection?.toggleLabel1 || "Paiement Unique"}</span>
                            <button className="w-14 h-7 bg-primary rounded-full relative transition-colors" onClick={togglePricing}>
                                <div id="toggle-circle" className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full transition-transform" style={{ transform: isYearly ? 'translateX(-28px)' : 'translateX(0)' }}></div>
                            </button>
                            <span className="text-gray-300">
                                {settings?.home?.pricingSection?.toggleLabel2 || "Abonnement Mensuel"}
                                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full ml-1">
                                    {settings?.home?.pricingSection?.toggleBadge || "-20%"}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {(settings?.home?.pricingSection?.items || [
                            {
                                badge: "Starter",
                                title: "Pack Démarrage",
                                subtitle: "Parfait pour tester le service",
                                price: "2.50€",
                                unit: "/crédit",
                                features: ["Minimum 20 crédits", "Panel de base", "Support par email", "Mise à jour auto"],
                                buttonText: "Choisir ce pack",
                                isPopular: false
                            },
                            {
                                badge: "Populaire",
                                title: "Pack Pro",
                                subtitle: "Pour les revendeurs actifs",
                                price: "1.80€",
                                unit: "/crédit",
                                features: ["Minimum 100 crédits", "Panel Pro + Statistiques", "API Access", "Support WhatsApp 24/7", "White Label possible"],
                                buttonText: "Choisir ce pack",
                                isPopular: true,
                                highlightColor: "#6366f1"
                            },
                            {
                                badge: "Enterprise",
                                title: "Pack Platinum",
                                subtitle: "Pour les gros volumes",
                                price: "1.20€",
                                unit: "/crédit",
                                features: ["Minimum 500 crédits", "Panel Entreprise", "API + Webhooks", "Account Manager dédié", "Custom DNS"],
                                buttonText: "Contacter les ventes",
                                isPopular: false
                            }
                        ]).map((plan, idx) => (
                            <div
                                key={idx}
                                className={`glass-effect rounded-2xl p-8 border relative transition-all duration-300 ${plan.isPopular
                                    ? 'border-primary transform scale-105 shadow-2xl shadow-primary/20 bg-primary/5'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                {plan.badge && (
                                    <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm font-semibold ${plan.isPopular ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'
                                        }`}>
                                        {plan.badge}
                                    </div>
                                )}
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.title}</h3>
                                <p className="text-gray-400 mb-6">{plan.subtitle}</p>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-gray-400">{plan.unit || "/crédit"}</span>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features?.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center text-gray-300">
                                            <i className="fas fa-check text-primary mr-3 text-sm"></i>
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.isPopular
                                    ? 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg'
                                    : 'border border-white/20 text-white hover:bg-white/5'
                                    }`}>
                                    {plan.buttonText || 'Choisir ce pack'}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-gray-400 text-sm">
                            {settings?.home?.pricingSection?.footerText || "1 Crédit = 1 Mois d'abonnement | Paiement sécurisé par Crypto, PayPal ou virement bancaire"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Panel Preview Section */}
            <section id="panel" className="py-24 relative">
                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('panel', settings?.home?.panelSection || {})}
                        className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="relative group">
                            <ColoredTitle
                                title={settings?.home?.panelSection?.title || "Panel Reseller Ultra-Moderne"}
                                coloredWord={settings?.home?.panelSection?.coloredWord || "Reseller"}
                                color={settings?.home?.panelSection?.color}
                                useGradient={settings?.home?.panelSection?.useGradient}
                                gradient={settings?.home?.panelSection?.gradient}
                                className="text-3xl md:text-5xl font-bold mb-6"
                            />
                            <p className="text-gray-400 text-lg mb-8">
                                {settings?.home?.panelSection?.subtitle || "Gérez votre business IPTV comme un pro avec notre dashboard intuitif. Créez, modifiez, supprimez des lignes en quelques clics."}
                            </p>

                            <div className="space-y-6">
                                {(settings?.home?.panelSection?.items || [
                                    { title: "Gestion Multi-Utilisateurs", description: "Créez des sous-revendeurs avec des limites de crédits personnalisables.", icon: "fas fa-users", iconBg: "bg-primary/20", iconColor: "text-primary" },
                                    { title: "100% Responsive", description: "Gérez vos clients depuis votre smartphone, tablette ou ordinateur.", icon: "fas fa-mobile-alt", iconBg: "bg-secondary/20", iconColor: "text-secondary" },
                                    { title: "Historique Complet", description: "Suivi de toutes les actions, renouvellements et connexions en temps réel.", icon: "fas fa-history", iconBg: "bg-accent/20", iconColor: "text-accent" }
                                ]).map((item, idx) => (
                                    <div key={idx} className="flex items-start">
                                        <div className={`w-12 h-12 rounded-lg ${item.iconBg || 'bg-primary/20'} flex items-center justify-center flex-shrink-0 mr-4`}>
                                            <i className={`${item.icon || 'fas fa-users'} ${item.iconColor || 'text-primary'} text-xl`}></i>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold text-lg mb-1">{item.title}</h4>
                                            <p className="text-gray-400">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link to={settings?.home?.panelSection?.primaryBtnLink || "/demos"} className="mt-8 inline-block px-8 py-3 bg-white/5 border border-white/20 rounded-full text-white font-semibold hover:bg-white/10 transition-all">
                                {settings?.home?.panelSection?.primaryBtnText || "Voir la Démo Live"} <i className="fas fa-external-link-alt ml-2"></i>
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-2xl opacity-30 blur-2xl"></div>
                            <div className="relative glass-effect rounded-2xl p-4 border border-white/10 shadow-2xl">
                                <div className="bg-dark rounded-xl overflow-hidden">
                                    {/* Mock Header */}
                                    <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b border-white/10">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="text-xs text-gray-400">Panel Reseller Pro</div>
                                    </div>
                                    {/* Mock Content */}
                                    <div className="p-6 space-y-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <div className="text-gray-400 text-sm">Crédits Disponibles</div>
                                                <div className="text-3xl font-bold text-white">1,240</div>
                                            </div>
                                            <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm">Recharger</button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="bg-white/5 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-white">342</div>
                                                <div className="text-xs text-gray-400">Actifs</div>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-white">18</div>
                                                <div className="text-xs text-gray-400">Expirés</div>
                                            </div>
                                            <div className="bg-white/5 p-3 rounded-lg text-center">
                                                <div className="text-2xl font-bold text-white">€4.2k</div>
                                                <div className="text-xs text-gray-400">Ce mois</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                        <i className="fas fa-check text-green-400 text-xs"></i>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-white">user_39201</div>
                                                        <div className="text-xs text-gray-400">Exp: 24 jours</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-primary">En ligne</div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                        <i className="fas fa-check text-green-400 text-xs"></i>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-white">user_39202</div>
                                                        <div className="text-xs text-gray-400">Exp: 12 jours</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-primary">En ligne</div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg opacity-50">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                                        <i className="fas fa-times text-red-400 text-xs"></i>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-white">user_39203</div>
                                                        <div className="text-xs text-gray-400">Expiré</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-red-400">Hors ligne</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Library */}
            <section className="py-24 bg-white/5 relative">
                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('library', settings?.home?.librarySection || {})}
                        className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative group">
                    <div className="text-center mb-16">
                        <ColoredTitle
                            title={settings?.home?.librarySection?.title || "Contenu Premium"}
                            coloredWord={settings?.home?.librarySection?.coloredWord || "Premium"}
                            color={settings?.home?.librarySection?.color}
                            useGradient={settings?.home?.librarySection?.useGradient}
                            gradient={settings?.home?.librarySection?.gradient}
                            className="text-3xl md:text-5xl font-bold mb-4"
                        />
                        <p className="text-gray-400 text-lg">
                            {settings?.home?.librarySection?.subtitle || "Plus de 22,000 chaînes et 80,000 VOD dans toutes les langues"}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {(settings?.home?.librarySection?.items || [
                            { title: "Sports", description: "Tous les matchs en 4K/FHD", icon: "fas fa-futbol", iconColor: "text-primary" },
                            { title: "Cinéma", description: "Derniers films et classiques", icon: "fas fa-film", iconColor: "text-secondary" },
                            { title: "Jeunesse", description: "Dessins animés et éducatif", icon: "fas fa-child", iconColor: "text-accent" },
                            { title: "International", description: "50+ pays disponibles", icon: "fas fa-globe", iconColor: "text-pink-400" }
                        ]).map((item, idx) => (
                            <div key={idx} className="glass-effect p-6 rounded-xl text-center border border-white/10 hover:border-primary/50 transition-colors">
                                <i className={`${item.icon || 'fas fa-futbol'} text-4xl ${item.iconColor || 'text-primary'} mb-4`}></i>
                                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-400">{item.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        {(settings?.home?.librarySection?.tags || ["France", "Belgique", "Suisse", "UK", "USA", "Canada", "Espagne", "Portugal", "+42 autres"]).map((tag, idx) => (
                            <span key={idx} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">{tag}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 relative overflow-hidden">
                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('testimonials', settings?.home?.testimonialsSection || {})}
                        className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative group">
                    <div className="text-center mb-16">
                        <ColoredTitle
                            title={settings?.home?.testimonialsSection?.title || "Ils Nous Font Confiance"}
                            coloredWord={settings?.home?.testimonialsSection?.coloredWord || "Confiance"}
                            color={settings?.home?.testimonialsSection?.color}
                            useGradient={settings?.home?.testimonialsSection?.useGradient}
                            gradient={settings?.home?.testimonialsSection?.gradient}
                            className="text-3xl md:text-5xl font-bold mb-4"
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {(settings?.home?.testimonialsSection?.items || [
                            { name: "Alex K.", role: "Revendeur depuis 2021", text: "Le meilleur fournisseur avec lequel j'ai travaillé. L'API est stable, le support réactif et mes clients sont satisfaits. J'ai multiplié mon CA par 3 en 6 mois.", initials: "AK", color: "from-primary to-secondary" },
                            { name: "Sarah M.", role: "Agence Digital", text: "L'intégration API a été un jeu changer pour mon business. Je peux maintenant vendre des abonnements automatiquement sur mon site sans intervention manuelle.", initials: "SM", color: "from-secondary to-accent" },
                            { name: "Jean D.", role: "Revendeur Pro", text: "Le panel est intuitif et professionnel. La qualité des streams est excellente avec très peu de buffering. Je recommande à 100% pour les sérieux.", initials: "JD", color: "from-accent to-primary" }
                        ]).map((item, idx) => (
                            <div key={idx} className="glass-effect p-8 rounded-2xl border border-white/10 relative">
                                <div className="text-primary text-4xl absolute top-4 right-4 opacity-30">"</div>
                                <div className="flex items-center mb-4">
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color || 'from-primary to-secondary'} flex items-center justify-center text-white font-bold text-lg mr-4`}>
                                        {item.initials}
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">{item.name}</div>
                                        <div className="text-gray-400 text-sm">{item.role}</div>
                                    </div>
                                </div>
                                <p className="text-gray-300 italic">"{item.text}"</p>
                                <div className="mt-4 flex text-yellow-400 text-sm">
                                    {[...Array(item.stars || 5)].map((_, i) => (
                                        <i key={i} className="fas fa-star"></i>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 bg-white/5 relative">
                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('faq', settings?.home?.faqSection || {})}
                        className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative group">
                    <div className="text-center mb-16">
                        <ColoredTitle
                            title={settings?.home?.faqSection?.title || "Questions Fréquentes"}
                            coloredWord={settings?.home?.faqSection?.coloredWord || "Fréquentes"}
                            color={settings?.home?.faqSection?.color}
                            useGradient={settings?.home?.faqSection?.useGradient}
                            gradient={settings?.home?.faqSection?.gradient}
                            className="text-3xl md:text-5xl font-bold mb-4"
                        />
                    </div>

                    <div className="space-y-4">
                        {(settings?.home?.faqSection?.items || [
                            { q: "Comment fonctionne le système de crédits ?", a: "1 crédit équivaut à 1 mois d'abonnement pour 1 appareil. Vous achetez des crédits en gros à prix réduit et vous les utilisez pour créer des lignes IPTV pour vos clients. Plus vous achetez de crédits, plus le prix unitaire est bas." },
                            { q: "Puis-je tester le service avant d'acheter ?", a: "Oui, nous offrons un compte démo avec 5 crédits pour tester le panel et la qualité des streams. Contactez-nous via Telegram ou le chat pour obtenir votre accès test." },
                            { q: "Quels sont les délais de livraison ?", a: "Les crédits sont ajoutés instantanément après confirmation du paiement (souvent moins de 2 minutes). Pour les virements bancaires, cela peut prendre 24-48h." },
                            { q: "Proposez-vous du support technique ?", a: "Absolument. Nous offrons un support 24/7 via Telegram, WhatsApp et ticket system. Les revendeurs Pro et Platinum ont accès à un support prioritaire avec temps de réponse garanti sous 1 heure." }
                        ]).map((item, index) => (
                            <div key={index} className="glass-effect rounded-xl border border-white/10 overflow-hidden">
                                <button
                                    className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span className="font-semibold text-white">{item.q}</span>
                                    <i className={`fas fa-chevron-down text-gray-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}></i>
                                </button>
                                <div className={`px-6 pb-4 text-gray-400 transition-all duration-300 ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                    {item.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
                <div className="absolute inset-0 grid-pattern opacity-30"></div>

                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('cta', settings?.home?.ctaSection || {})}
                        className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center group">
                    <ColoredTitle
                        title={settings?.home?.ctaSection?.title || "Prêt à Développer Votre Business ?"}
                        coloredWord={settings?.home?.ctaSection?.coloredWord || "Business"}
                        color={settings?.home?.ctaSection?.color}
                        useGradient={settings?.home?.ctaSection?.useGradient}
                        gradient={settings?.home?.ctaSection?.gradient}
                        className="text-4xl md:text-6xl font-bold mb-6"
                    />
                    <p className="text-xl text-gray-300 mb-10">
                        {settings?.home?.ctaSection?.subtitle || "Rejoignez plus de 15,000 revendeurs qui nous font confiance. Commencez avec seulement 20 crédits."}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to={settings?.home?.ctaSection?.primaryBtnLink || "/register"} className="px-8 py-4 bg-white text-dark rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-2xl">
                            {settings?.home?.ctaSection?.primaryBtnText || "Créer un Compte Gratuit"}
                        </Link>
                        <Link to={settings?.home?.ctaSection?.secondaryBtnLink || "#"} className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                            {settings?.home?.ctaSection?.secondaryBtnText || "Discuter sur Telegram"}
                        </Link>
                    </div>

                    <div className="mt-8 flex justify-center items-center space-x-6 text-gray-400">
                        {(settings?.home?.ctaSection?.features || ["Sans engagement", "Support inclus", "Mise à jour auto"]).map((feat, idx) => (
                            <div key={idx} className="flex items-center">
                                <i className="fas fa-check-circle text-green-400 mr-2"></i> {feat}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-darker border-t border-white/10 pt-16 pb-8 relative">
                {isAdmin && (
                    <button
                        onClick={() => handleEditClick('footer', settings?.home?.footerSection || {})}
                        className="absolute top-8 right-8 z-50 bg-white/5 hover:bg-primary/20 p-3 rounded-2xl border border-white/10 transition-all group shadow-lg backdrop-blur-sm"
                        style={{ borderColor: 'rgba(255,153,0,0.2)' }}
                    >
                        <i className="fas fa-cog text-gray-400 group-hover:text-primary transition-colors" style={{ color: 'var(--accent-color)' }}></i>
                    </button>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <img src="/logo.png" alt="SKYGROS" style={{ height: '40px', width: 'auto' }} />
                            </div>
                            <p className="text-gray-400 mb-6 max-w-sm">
                                {settings?.home?.footerSection?.description || "La solution wholesale IPTV la plus fiable pour les revendeurs professionnels. Infrastructure stable, API puissante et support 24/7."}
                            </p>
                            <div className="flex space-x-4">
                                {(settings?.home?.footerSection?.socials || [
                                    { icon: "fab fa-telegram", link: "#" },
                                    { icon: "fab fa-whatsapp", link: "#" },
                                    { icon: "fab fa-discord", link: "#" },
                                    { icon: "fab fa-skype", link: "#" }
                                ]).map((social, idx) => (
                                    <a key={idx} href={social.link} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all">
                                        <i className={social.icon}></i>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {(settings?.home?.footerSection?.columns || [
                            {
                                title: "Produit",
                                links: [
                                    { name: "Fonctionnalités", link: "#" },
                                    { name: "Tarifs", link: "#" },
                                    { name: "API Documentation", link: "#" },
                                    { name: "Panel Demo", link: "#" }
                                ]
                            },
                            {
                                title: "Support",
                                links: [
                                    { name: "Centre d'aide", link: "#" },
                                    { name: "Status Serveur", link: "#" },
                                    { name: "Contact", link: "#" },
                                    { name: "Affiliation", link: "#" }
                                ]
                            },
                            {
                                title: "Légal",
                                links: [
                                    { name: "CGV", link: "#" },
                                    { name: "Politique de confidentialité", link: "#" },
                                    { name: "DMCA", link: "#" },
                                    { name: "Contact", link: "#" }
                                ]
                            }
                        ]).map((col, idx) => (
                            <div key={idx}>
                                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                                <ul className="space-y-2 text-gray-400">
                                    {(col.links || []).map((link, lIdx) => (
                                        <li key={lIdx}><a href={link.link} className="hover:text-white transition-colors">{link.name}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm mb-4 md:mb-0">
                            {settings?.home?.footerSection?.copyright || "© 2026SKYGROS. Tous droits réservés."}
                        </p>
                        <div className="flex items-center space-x-4 text-gray-500 text-sm">
                            <span className="flex items-center"><i className="fas fa-lock mr-2"></i> Paiement sécurisé SSL</span>
                            <span className="flex items-center"><i className="fas fa-server mr-2"></i> Uptime 99.9%</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Edit Home Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xl animate-modal-backdrop" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="relative bg-[#0f172a]/95 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-8 custom-scrollbar animate-modal-content">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white capitalize">
                                {editingSection === 'deals' ? 'Modifier les Offres' :
                                    editingSection === 'bestSellers' ? 'Modifier les Meilleures Ventes' :
                                        `Modifier ${editingSection}`}
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Footer Specific Fields */}
                            {editingSection === 'footer' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-gray-400 text-sm mb-1 block">Titre de la marque</span>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                value={editData.brandTitle}
                                                onChange={(e) => setEditData({ ...editData, brandTitle: e.target.value })}
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-400 text-sm mb-1 block">Mot à colorer</span>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                value={editData.brandColoredWord}
                                                onChange={(e) => setEditData({ ...editData, brandColoredWord: e.target.value })}
                                            />
                                        </label>
                                    </div>
                                    <label className="block">
                                        <span className="text-gray-400 text-sm mb-1 block">Description du Footer</span>
                                        <textarea
                                            rows="3"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                            value={editData.description}
                                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        ></textarea>
                                    </label>
                                    <label className="block">
                                        <span className="text-gray-400 text-sm mb-1 block">Copyright</span>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                            value={editData.copyright}
                                            onChange={(e) => setEditData({ ...editData, copyright: e.target.value })}
                                        />
                                    </label>

                                    {/* Socials Editor */}
                                    <div className="space-y-4 border-t border-white/10 pt-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-400 text-sm font-semibold">Réseaux Sociaux</span>
                                            <button
                                                onClick={() => setEditData({ ...editData, socials: [...(editData.socials || []), { icon: "fab fa-facebook", link: "#" }] })}
                                                className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full hover:bg-primary/30 font-bold"
                                            >
                                                + Ajouter
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {editData.socials?.map((social, i) => (
                                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2 relative">
                                                    <button
                                                        onClick={() => setEditData({ ...editData, socials: editData.socials.filter((_, idx) => idx !== i) })}
                                                        className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                    <input
                                                        type="text"
                                                        placeholder="Icon (ex: fab fa-facebook)"
                                                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                                        value={social.icon}
                                                        onChange={(e) => {
                                                            const newSocials = [...editData.socials];
                                                            newSocials[i].icon = e.target.value;
                                                            setEditData({ ...editData, socials: newSocials });
                                                        }}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Lien"
                                                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                                        value={social.link}
                                                        onChange={(e) => {
                                                            const newSocials = [...editData.socials];
                                                            newSocials[i].link = e.target.value;
                                                            setEditData({ ...editData, socials: newSocials });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer Columns Editor */}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-400 text-sm font-semibold block">Colonnes du Footer</span>
                                        <button
                                            onClick={() => setEditData({ ...editData, columns: [...(editData.columns || []), { title: "Nouvelle Colonne", links: [] }] })}
                                            className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full hover:bg-primary/30 font-bold"
                                        >
                                            + Ajouter Colonne
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {editData.columns?.map((col, i) => (
                                            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4 relative">
                                                <button
                                                    onClick={() => setEditData({ ...editData, columns: editData.columns.filter((_, idx) => idx !== i) })}
                                                    className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center text-[10px] z-10"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                                <div className="flex justify-between items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Titre de la colonne"
                                                        className="bg-transparent border-b border-white/20 focus:border-primary text-white font-bold outline-none"
                                                        value={col.title}
                                                        onChange={(e) => {
                                                            const newCols = [...editData.columns];
                                                            newCols[i].title = e.target.value;
                                                            setEditData({ ...editData, columns: newCols });
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newCols = [...editData.columns];
                                                            newCols[i].links = [...(newCols[i].links || []), { name: "Lien", link: "#" }];
                                                            setEditData({ ...editData, columns: newCols });
                                                        }}
                                                        className="text-[10px] bg-white/10 text-white px-2 py-1 rounded-md hover:bg-white/20"
                                                    >
                                                        + Lien
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {col.links?.map((link, j) => (
                                                        <div key={j} className="flex gap-2 items-center">
                                                            <input
                                                                type="text"
                                                                placeholder="Nom"
                                                                className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                                                value={link.name}
                                                                onChange={(e) => {
                                                                    const newCols = [...editData.columns];
                                                                    newCols[i].links[j].name = e.target.value;
                                                                    setEditData({ ...editData, columns: newCols });
                                                                }}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="URL"
                                                                className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-xs"
                                                                value={link.link}
                                                                onChange={(e) => {
                                                                    const newCols = [...editData.columns];
                                                                    newCols[i].links[j].link = e.target.value;
                                                                    setEditData({ ...editData, columns: newCols });
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newCols = [...editData.columns];
                                                                    newCols[i].links = newCols[i].links.filter((_, idx) => idx !== j);
                                                                    setEditData({ ...editData, columns: newCols });
                                                                }}
                                                                className="text-red-500 hover:text-red-400"
                                                            >
                                                                <i className="fas fa-trash text-[10px]"></i>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : editingSection === 'carousel' ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-gray-400 text-sm font-semibold block">Images du Carrousel</span>
                                        <button
                                            onClick={() => setEditData([...(editData || []), { image: "", title: "", subtitle: "", color: "#6366f1", buttonText: "DÉCOUVRIR", link: "#" }])}
                                            className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full hover:bg-primary/30 font-bold"
                                        >
                                            + Ajouter Photo
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {Array.isArray(editData) && editData.map((slide, i) => (
                                            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4 relative group">
                                                <button
                                                    onClick={() => setEditData(editData.filter((_, idx) => idx !== i))}
                                                    className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center text-[10px] invisible group-hover:visible"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <label className="block">
                                                        <span className="text-gray-400 text-[10px] mb-1 block uppercase">URL de l'image</span>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs"
                                                            value={slide.image}
                                                            onChange={(e) => {
                                                                const newData = [...editData];
                                                                newData[i].image = e.target.value;
                                                                setEditData(newData);
                                                            }}
                                                        />
                                                    </label>
                                                    <label className="block">
                                                        <span className="text-gray-400 text-[10px] mb-1 block uppercase">Titre</span>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs font-bold"
                                                            value={slide.title}
                                                            onChange={(e) => {
                                                                const newData = [...editData];
                                                                newData[i].title = e.target.value;
                                                                setEditData(newData);
                                                            }}
                                                        />
                                                    </label>
                                                    <label className="block">
                                                        <span className="text-gray-400 text-[10px] mb-1 block uppercase">Sous-titre</span>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs"
                                                            value={slide.subtitle}
                                                            onChange={(e) => {
                                                                const newData = [...editData];
                                                                newData[i].subtitle = e.target.value;
                                                                setEditData(newData);
                                                            }}
                                                        />
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <label className="block">
                                                            <span className="text-gray-400 text-[10px] mb-1 block uppercase">Texte Bouton</span>
                                                            <input
                                                                type="text"
                                                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs"
                                                                value={slide.buttonText}
                                                                onChange={(e) => {
                                                                    const newData = [...editData];
                                                                    newData[i].buttonText = e.target.value;
                                                                    setEditData(newData);
                                                                }}
                                                            />
                                                        </label>
                                                        <label className="block">
                                                            <span className="text-gray-400 text-[10px] mb-1 block uppercase">Lien (URL)</span>
                                                            <input
                                                                type="text"
                                                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs"
                                                                value={slide.link}
                                                                onChange={(e) => {
                                                                    const newData = [...editData];
                                                                    newData[i].link = e.target.value;
                                                                    setEditData(newData);
                                                                }}
                                                            />
                                                        </label>
                                                        <label className="block">
                                                            <span className="text-gray-400 text-[10px] mb-1 block uppercase">Couleur</span>
                                                            <input
                                                                type="color"
                                                                className="w-full h-8 bg-black/20 border border-white/10 rounded cursor-pointer p-0.5"
                                                                value={slide.color || "#6366f1"}
                                                                onChange={(e) => {
                                                                    const newData = [...editData];
                                                                    newData[i].color = e.target.value;
                                                                    setEditData(newData);
                                                                }}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (editingSection === 'bestSellers' || editingSection === 'deals') ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-gray-400 text-sm mb-1 block">Titre de la section</span>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                value={editData.title}
                                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-400 text-sm mb-1 block">Mot à Colorer</span>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                value={editData.coloredWord}
                                                onChange={(e) => setEditData({ ...editData, coloredWord: e.target.value })}
                                            />
                                        </label>
                                    </div>

                                    {editingSection === 'deals' && (
                                        <label className="block">
                                            <span className="text-gray-400 text-sm mb-1 block">Sous-titre (Description)</span>
                                            <textarea
                                                rows="2"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                value={editData.subtitle}
                                                onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                                            ></textarea>
                                        </label>
                                    )}

                                    <div className="border-t border-white/10 pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-400 text-sm font-semibold block">Sélectionner les Produits</span>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{allProducts.filter(p => (editData.items || []).includes(p._id)).length} Sélectionnés</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {allProducts.map(product => (
                                                <div key={product._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 group">
                                                    <div className="flex items-center gap-4">
                                                        <img src={product.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                                        <div>
                                                            <div className="text-xs font-bold text-white truncate max-w-[200px]">{product.title}</div>
                                                            <div className="text-[10px] text-gray-500">{product.category} • {product.price}€</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await axios.put(`${API_BASE_URL}/products/${product._id}`, { isHidden: !product.isHidden });
                                                                    const updated = allProducts.map(p => p._id === product._id ? { ...p, isHidden: !p.isHidden } : p);
                                                                    setAllProducts(updated);
                                                                } catch (err) { showNotify("Erreur", "error"); }
                                                            }}
                                                            className={`p-2 rounded-lg transition-all ${product.isHidden ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400 hover:bg-white/10'}`}
                                                            title={product.isHidden ? "Rendre visible" : "Masquer"}
                                                        >
                                                            <i className={`fas ${product.isHidden ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm("Supprimer définitivement ce produit ?")) {
                                                                    try {
                                                                        await axios.delete(`${API_BASE_URL}/products/${product._id}`);
                                                                        setAllProducts(allProducts.filter(p => p._id !== product._id));
                                                                        setEditData({ ...editData, items: (editData.items || []).filter(id => id !== product._id) });
                                                                    } catch (err) { showNotify("Erreur", "error"); }
                                                                }
                                                            }}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const currentItems = editData.items || [];
                                                                if (currentItems.includes(product._id)) {
                                                                    setEditData({ ...editData, items: currentItems.filter(id => id !== product._id) });
                                                                } else {
                                                                    setEditData({ ...editData, items: [...currentItems, product._id] });
                                                                }
                                                            }}
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${(editData.items || []).includes(product._id) ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-gray-500 border border-white/10 hover:border-primary/50'}`}
                                                        >
                                                            <i className={`fas ${(editData.items || []).includes(product._id) ? 'fa-check' : 'fa-plus'}`}></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Common Fields: Title, Colored Word, Color, Subtitle */}
                                    <div className="grid gap-4">
                                        <label className="block">
                                            <span className="text-gray-400 text-sm mb-1 block">Titre Principal</span>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                value={editData.title}
                                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-gray-400 text-sm mb-1 block">Mot à Colorer</span>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                value={editData.coloredWord}
                                                onChange={(e) => setEditData({ ...editData, coloredWord: e.target.value })}
                                            />
                                        </label>

                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-sm font-semibold">Style de la couleur</span>
                                                <div className="flex bg-black/40 p-1 rounded-lg">
                                                    <button
                                                        onClick={() => setEditData({ ...editData, useGradient: false })}
                                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!editData.useGradient ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                                    >
                                                        Solide
                                                    </button>
                                                    <button
                                                        onClick={() => setEditData({ ...editData, useGradient: true })}
                                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${editData.useGradient ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                                    >
                                                        Dégradé
                                                    </button>
                                                </div>
                                            </div>

                                            {!editData.useGradient ? (
                                                <label className="flex items-center gap-4">
                                                    <span className="text-gray-400 text-sm whitespace-nowrap">Couleur fixe</span>
                                                    <input
                                                        type="color"
                                                        className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-1 py-1 cursor-pointer"
                                                        value={editData.color || "#6366f1"}
                                                        onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                                                    />
                                                </label>
                                            ) : (
                                                <label className="block">
                                                    <span className="text-gray-400 text-sm mb-1 block">Valeur du dégradé (CSS)</span>
                                                    <input
                                                        type="text"
                                                        placeholder="linear-gradient(135deg, ...)"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-primary"
                                                        value={editData.gradient || ""}
                                                        onChange={(e) => setEditData({ ...editData, gradient: e.target.value })}
                                                    />
                                                    <span className="text-[10px] text-gray-500 mt-1 block italic text-right">Ex: linear-gradient(135deg, #6366f1 0%, #a855f7 100%)</span>
                                                </label>
                                            )}
                                        </div>
                                        <label className="block">
                                            <span className="text-gray-400 text-sm mb-1 block">Sous-titre</span>
                                            <textarea
                                                rows="3"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                                value={editData.subtitle}
                                                onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                                            ></textarea>
                                        </label>
                                    </div>
                                </>
                            )}

                            {/* Section Specific Fields */}
                            {editingSection === 'hero' && (
                                <div className="space-y-6 border-t border-white/10 pt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Texte Bouton 1</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={editData.primaryBtnText} onChange={(e) => setEditData({ ...editData, primaryBtnText: e.target.value })} />
                                        </label>
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Lien Bouton 1</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={editData.primaryBtnLink} onChange={(e) => setEditData({ ...editData, primaryBtnLink: e.target.value })} />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Texte Bouton 2</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={editData.secondaryBtnText} onChange={(e) => setEditData({ ...editData, secondaryBtnText: e.target.value })} />
                                        </label>
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Lien Bouton 2</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={editData.secondaryBtnLink} onChange={(e) => setEditData({ ...editData, secondaryBtnLink: e.target.value })} />
                                        </label>
                                    </div>
                                    <div className="space-y-3">
                                        <span className="text-gray-400 text-sm block">Statistiques (4 max)</span>
                                        {editData.stats?.map((stat, i) => (
                                            <div key={i} className="grid grid-cols-2 gap-2">
                                                <input type="text" placeholder="Valeur (ex: 22K+)" className="bg-white/5 border border-white/10 rounded px-3 py-1 text-white text-sm" value={stat.value} onChange={(e) => {
                                                    const newStats = [...editData.stats];
                                                    newStats[i].value = e.target.value;
                                                    setEditData({ ...editData, stats: newStats });
                                                }} />
                                                <input type="text" placeholder="Label (ex: Chaînes TV)" className="bg-white/5 border border-white/10 rounded px-3 py-1 text-white text-sm" value={stat.label} onChange={(e) => {
                                                    const newStats = [...editData.stats];
                                                    newStats[i].label = e.target.value;
                                                    setEditData({ ...editData, stats: newStats });
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {editingSection === 'pricing' && (
                                <div className="space-y-4 border-t border-white/10 pt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Label Toggle 1</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm" value={editData.toggleLabel1} onChange={(e) => setEditData({ ...editData, toggleLabel1: e.target.value })} />
                                        </label>
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Label Toggle 2</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm" value={editData.toggleLabel2} onChange={(e) => setEditData({ ...editData, toggleLabel2: e.target.value })} />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {editingSection === 'cta' && (
                                <div className="space-y-4 border-t border-white/10 pt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Texte Bouton 1</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm" value={editData.primaryBtnText} onChange={(e) => setEditData({ ...editData, primaryBtnText: e.target.value })} />
                                        </label>
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Lien Bouton 1</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm" value={editData.primaryBtnLink} onChange={(e) => setEditData({ ...editData, primaryBtnLink: e.target.value })} />
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Texte Bouton 2</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm" value={editData.secondaryBtnText} onChange={(e) => setEditData({ ...editData, secondaryBtnText: e.target.value })} />
                                        </label>
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Lien Bouton 2</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm" value={editData.secondaryBtnLink} onChange={(e) => setEditData({ ...editData, secondaryBtnLink: e.target.value })} />
                                        </label>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-gray-400 text-sm mb-1 block">Points Clés (séparés par des virgules)</span>
                                        <textarea
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm h-20"
                                            value={editData.features?.join(', ')}
                                            onChange={(e) => setEditData({ ...editData, features: e.target.value.split(',').map(f => f.trim()) })}
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {editingSection === 'library' && (
                                <div className="space-y-4 border-t border-white/10 pt-6">
                                    <div className="space-y-1">
                                        <span className="text-gray-400 text-sm mb-1 block">Étiquettes de pays/tags (séparés par des virgules)</span>
                                        <textarea
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm h-20"
                                            value={editData.tags?.join(', ')}
                                            onChange={(e) => setEditData({ ...editData, tags: e.target.value.split(',').map(t => t.trim()) })}
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {editingSection === 'panel' && (
                                <div className="space-y-4 border-t border-white/10 pt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Texte Bouton Démo</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm" value={editData.primaryBtnText} onChange={(e) => setEditData({ ...editData, primaryBtnText: e.target.value })} />
                                        </label>
                                        <label>
                                            <span className="text-gray-400 text-sm mb-1 block">Lien Bouton Démo</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm" value={editData.primaryBtnLink} onChange={(e) => setEditData({ ...editData, primaryBtnLink: e.target.value })} />
                                        </label>
                                    </div>
                                </div>
                            )}

                            {(editingSection === 'channels' || editingSection === 'sports' || editingSection === 'devices' || editingSection === 'countries' || editingSection === 'features' || editingSection === 'pricing' || editingSection === 'panel' || editingSection === 'library' || editingSection === 'testimonials' || editingSection === 'faq' || editingSection === 'memberships' || editingSection === 'giftCards') && (
                                <div className="space-y-4 border-t border-white/10 pt-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400 text-sm block">Eléments de la liste</span>
                                        <button
                                            onClick={() => {
                                                const newItemMap = {
                                                    devices: { name: "", icon: "fas fa-tv" },
                                                    countries: { name: "", image: "" },
                                                    features: { title: "", description: "", icon: "fas fa-star", iconBg: "bg-primary/20", iconColor: "text-primary" },
                                                    channels: { name: "", image: "", link: "#" },
                                                    sports: { name: "", image: "", link: "#" },
                                                    pricing: { badge: "New", title: "Plan", subtitle: "", price: "0€", unit: "/crédit", features: ["Feature 1"], isPopular: false, buttonText: "Choisir" },
                                                    panel: { title: "", description: "", icon: "fas fa-check", iconBg: "bg-primary/20", iconColor: "text-primary" },
                                                    library: { title: "", description: "", icon: "fas fa-play", iconColor: "text-primary" },
                                                    testimonials: { name: "", role: "", text: "", initials: "", stars: 5, color: "from-primary to-secondary" },
                                                    faq: { q: "", a: "" },
                                                    memberships: { title: "", image: "", link: "#" },
                                                    giftCards: { title: "", subtitle: "", link: "#", color: "#0070d1" }
                                                };
                                                setEditData({ ...editData, items: [...(editData.items || []), newItemMap[editingSection] || { name: "", image: "" }] });
                                            }}
                                            className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full hover:bg-primary/30"
                                        >
                                            + Ajouter
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {editData.items?.map((item, i) => (
                                            <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2 relative">
                                                <button
                                                    onClick={() => setEditData({ ...editData, items: editData.items.filter((_, idx) => idx !== i) })}
                                                    className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>

                                                {editingSection === 'features' || editingSection === 'panel' ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Titre"
                                                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs"
                                                            value={item.title}
                                                            onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].title = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }}
                                                        />
                                                        <textarea
                                                            placeholder="Description"
                                                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs h-16"
                                                            value={item.description}
                                                            onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].description = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }}
                                                        ></textarea>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Icon (fas fa-...)"
                                                                className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs"
                                                                value={item.icon}
                                                                onChange={(e) => {
                                                                    const newItems = [...editData.items];
                                                                    newItems[i].icon = e.target.value;
                                                                    setEditData({ ...editData, items: newItems });
                                                                }}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Couleur (text-primary)"
                                                                className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs"
                                                                value={item.iconColor}
                                                                onChange={(e) => {
                                                                    const newItems = [...editData.items];
                                                                    newItems[i].iconColor = e.target.value;
                                                                    setEditData({ ...editData, items: newItems });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : editingSection === 'library' ? (
                                                    <div className="space-y-2">
                                                        <input type="text" placeholder="Titre" className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.title} onChange={(e) => {
                                                            const newItems = [...editData.items];
                                                            newItems[i].title = e.target.value;
                                                            setEditData({ ...editData, items: newItems });
                                                        }} />
                                                        <input type="text" placeholder="Description courte" className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.description} onChange={(e) => {
                                                            const newItems = [...editData.items];
                                                            newItems[i].description = e.target.value;
                                                            setEditData({ ...editData, items: newItems });
                                                        }} />
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input type="text" placeholder="Icon" className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.icon} onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].icon = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }} />
                                                            <input type="text" placeholder="Couleur Icon" className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.iconColor} onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].iconColor = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }} />
                                                        </div>
                                                    </div>
                                                ) : editingSection === 'memberships' ? (
                                                    <div className="space-y-3">
                                                        <div className="flex gap-3">
                                                            <div className="flex-1 space-y-2">
                                                                <input type="text" placeholder="Texte à afficher (ex: Xbox Game Pass)" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.title} onChange={(e) => {
                                                                    const newItems = [...editData.items];
                                                                    newItems[i].title = e.target.value;
                                                                    setEditData({ ...editData, items: newItems });
                                                                }} />
                                                                <input type="text" placeholder="Lien de l'image (URL Unsplash ou direct)" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.image} onChange={(e) => {
                                                                    const newItems = [...editData.items];
                                                                    newItems[i].image = e.target.value;
                                                                    setEditData({ ...editData, items: newItems });
                                                                }} />
                                                            </div>
                                                            {item.image && (
                                                                <div className="w-16 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                                                    <img src={item.image} className="w-full h-full object-cover" alt="preview" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <input type="text" placeholder="Lien de redirection (ex: /category/xbox)" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.link} onChange={(e) => {
                                                            const newItems = [...editData.items];
                                                            newItems[i].link = e.target.value;
                                                            setEditData({ ...editData, items: newItems });
                                                        }} />
                                                    </div>
                                                ) : editingSection === 'giftCards' ? (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] text-gray-500 uppercase font-bold">Petit Titre (ex: XBOX)</span>
                                                                <input type="text" placeholder="Titre" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.title} onChange={(e) => {
                                                                    const newItems = [...editData.items];
                                                                    newItems[i].title = e.target.value;
                                                                    setEditData({ ...editData, items: newItems });
                                                                }} />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[10px] text-gray-500 uppercase font-bold">Grand Titre (ex: Gift Cards)</span>
                                                                <input type="text" placeholder="Sous-titre" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.subtitle} onChange={(e) => {
                                                                    const newItems = [...editData.items];
                                                                    newItems[i].subtitle = e.target.value;
                                                                    setEditData({ ...editData, items: newItems });
                                                                }} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] text-gray-500 uppercase font-bold">Lien de redirection</span>
                                                            <input type="text" placeholder="Lien" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-primary/50 outline-none" value={item.link} onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].link = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }} />
                                                        </div>
                                                        <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl border border-white/5">
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Couleur de fond :</span>
                                                            <input type="color" className="bg-transparent border-none cursor-pointer h-8 w-16" value={item.color || "#0070d1"} onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].color = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }} />
                                                        </div>
                                                    </div>
                                                ) : editingSection === 'testimonials' ? (
                                                    <div className="space-y-2">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input type="text" placeholder="Nom" className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.name} onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].name = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }} />
                                                            <input type="text" placeholder="Initiales" className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.initials} onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].initials = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }} />
                                                        </div>
                                                        <input type="text" placeholder="Rôle/Date" className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.role} onChange={(e) => {
                                                            const newItems = [...editData.items];
                                                            newItems[i].role = e.target.value;
                                                            setEditData({ ...editData, items: newItems });
                                                        }} />
                                                        <textarea placeholder="Témoignage" className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs h-16" value={item.text} onChange={(e) => {
                                                            const newItems = [...editData.items];
                                                            newItems[i].text = e.target.value;
                                                            setEditData({ ...editData, items: newItems });
                                                        }}></textarea>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input type="number" placeholder="Étoiles (1-5)" className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.stars} onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].stars = parseInt(e.target.value);
                                                                setEditData({ ...editData, items: newItems });
                                                            }} />
                                                            <input type="text" placeholder="Dégradé (from-X to-Y)" className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.color} onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].color = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }} />
                                                        </div>
                                                    </div>
                                                ) : editingSection === 'faq' ? (
                                                    <div className="space-y-2">
                                                        <input type="text" placeholder="Question" className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.q} onChange={(e) => {
                                                            const newItems = [...editData.items];
                                                            newItems[i].q = e.target.value;
                                                            setEditData({ ...editData, items: newItems });
                                                        }} />
                                                        <textarea placeholder="Réponse" className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs h-20" value={item.a} onChange={(e) => {
                                                            const newItems = [...editData.items];
                                                            newItems[i].a = e.target.value;
                                                            setEditData({ ...editData, items: newItems });
                                                        }}></textarea>
                                                    </div>
                                                ) : editingSection === 'pricing' ? (
                                                    <div className="space-y-2">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input type="text" placeholder="Badge" className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.badge} onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].badge = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }} />
                                                            <input type="text" placeholder="Titre" className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.title} onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].title = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }} />
                                                        </div>
                                                        <input type="text" placeholder="Sous-titre" className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.subtitle} onChange={(e) => {
                                                            const newItems = [...editData.items];
                                                            newItems[i].subtitle = e.target.value;
                                                            setEditData({ ...editData, items: newItems });
                                                        }} />
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input type="text" placeholder="Prix (ex: 1.20€)" className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs" value={item.price} onChange={(e) => {
                                                                const newItems = [...editData.items];
                                                                newItems[i].price = e.target.value;
                                                                setEditData({ ...editData, items: newItems });
                                                            }} />
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-black/20 border border-white/10 rounded">
                                                                <span className="text-[10px] text-gray-500">Mis en avant?</span>
                                                                <input type="checkbox" checked={item.isPopular} onChange={(e) => {
                                                                    const newItems = [...editData.items];
                                                                    newItems[i].isPopular = e.target.checked;
                                                                    setEditData({ ...editData, items: newItems });
                                                                }} />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] text-gray-500 block">Avantages (séparés par des virgules)</span>
                                                            <textarea
                                                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs h-12"
                                                                value={item.features?.join(', ')}
                                                                onChange={(e) => {
                                                                    const newItems = [...editData.items];
                                                                    newItems[i].features = e.target.value.split(',').map(f => f.trim());
                                                                    setEditData({ ...editData, items: newItems });
                                                                }}
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Nom"
                                                                className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs"
                                                                value={item.name}
                                                                onChange={(e) => {
                                                                    const newItems = [...editData.items];
                                                                    newItems[i].name = e.target.value;
                                                                    setEditData({ ...editData, items: newItems });
                                                                }}
                                                            />
                                                            {editingSection === 'devices' ? (
                                                                <input
                                                                    type="text"
                                                                    placeholder="Icon Class (ex: fab fa-apple)"
                                                                    className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs"
                                                                    value={item.icon}
                                                                    onChange={(e) => {
                                                                        const newItems = [...editData.items];
                                                                        newItems[i].icon = e.target.value;
                                                                        setEditData({ ...editData, items: newItems });
                                                                    }}
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    placeholder="URL Image / Drapeau"
                                                                    className="bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs"
                                                                    value={item.image}
                                                                    onChange={(e) => {
                                                                        const newItems = [...editData.items];
                                                                        newItems[i].image = e.target.value;
                                                                        setEditData({ ...editData, items: newItems });
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        {(editingSection === 'channels' || editingSection === 'sports') && (
                                                            <input
                                                                type="text"
                                                                placeholder="Lien de redirection"
                                                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-1 text-white text-xs"
                                                                value={item.link}
                                                                onChange={(e) => {
                                                                    const newItems = [...editData.items];
                                                                    newItems[i].link = e.target.value;
                                                                    setEditData({ ...editData, items: newItems });
                                                                }}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-4 pt-6 border-t border-white/10">
                                <button
                                    onClick={handleSaveSettings}
                                    className="flex-1 py-3 bg-primary rounded-xl font-bold text-white hover:bg-primary/80 transition-all"
                                >
                                    Enregistrer les modifications
                                </button>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 py-3 bg-white/10 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default Home;
