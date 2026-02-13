import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import SEO from '../components/SEO';
import API_BASE_URL from '../config/api';

const Home = () => {
    // ... existing state ...
    const [isYearly, setIsYearly] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [movies, setMovies] = useState([]);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        // ... existing useEffect ...
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

        fetchMovies();

        const fetchSettings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/settings`);
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const togglePricing = () => {
        setIsYearly(!isYearly);
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const channels = [
        "ABC News", "beIN", "CNN", "Disney", "ESPN", "FOX", "HBO", "NBC", "AMC", "NBA",
        "Eleven", "Canal+", "BT Sport", "Play", "DAZN", "Nova", "Super", "SN"
    ];

    const sports = [
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
            `}</style>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center hero-gradient pt-20 overflow-hidden">
                <div className="absolute inset-0 grid-pattern opacity-50"></div>

                {/* Animated Background Elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-float">
                        <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                        <span className="text-sm text-gray-300">Plus de 15,000 revendeurs actifs worldwide</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                        La Solution <span className="gradient-text">Wholesale IPTV</span><br />
                        Pour Les Professionnels
                    </h1>

                    <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Boostez votre business avec notre infrastructure IPTV professionnelle. Panel de gestion complet, API REST, livraison instantanée et marges compétitives jusqu'à 300%.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-full font-semibold text-white text-lg hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                            <span>Commencer Gratuitement</span>
                            <i className="fas fa-arrow-right"></i>
                        </Link>
                        <Link to="/demos" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/20 rounded-full font-semibold text-white text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            <i className="fas fa-play-circle"></i>
                            <span>Voir la Démo</span>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">22K+</div>
                            <div className="text-sm text-gray-400">Chaînes TV</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">99.9%</div>
                            <div className="text-sm text-gray-400">Uptime SLA</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">&lt;24h</div>
                            <div className="text-sm text-gray-400">Support 24/7</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">API</div>
                            <div className="text-sm text-gray-400">Intégration complète</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Movies Section */}
            <section className="py-12 bg-white/5 relative overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-4xl font-bold mb-4">Derniers <span className="gradient-text">Films Ajoutés</span></h2>
                        <p className="text-gray-400">Découvrez les nouveautés disponibles sur notre plateforme VOD</p>
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

            {/* Channels Section */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Watch All Channels with <span className="gradient-text">IPTV</span> No Cable TV Required</h2>
                        <p className="text-gray-400 text-lg max-w-4xl mx-auto">
                            We offer thousands of TV channels covering Canada, United States, United Kingdom, Portugal, Albania, Germany, Italy, France, Brazil, Romania, Greece, Spain, Sweden, Finland, Ireland, Norway, Denmark, Latin American countries, Arab countries, and almost all countries worldwide.
                        </p>
                    </div>

                    <div className="glass-effect rounded-3xl p-8 border border-white/10">
                        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4">
                            {channels.map((channel, idx) => (
                                <div key={idx} className="bg-white/5 rounded-lg h-16 flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-white font-bold opacity-70">{channel}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center mt-20 mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">The Best IPTV 2025 To Watch All International <span style={{ color: '#ef4444' }}>Sports</span> <span style={{ color: '#a855f7' }}>Events</span>, including ppv iptv</h2>
                        <p className="text-gray-400 text-lg max-w-4xl mx-auto">
                            At our IPTV subscription service, we are proud to offer an extensive range of sports channels that cater to every sports enthusiast's needs. Our sports channels cover a vast variety of sports including football, basketball, baseball, tennis, golf, rugby, and more.
                        </p>
                    </div>

                    <div className="glass-effect rounded-3xl p-8 border border-white/10">
                        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-6">
                            {(settings?.home?.sports && settings.home.sports.length > 0 ? settings.home.sports : sports).map((sport, idx) => (
                                <div key={idx} className="bg-white/5 rounded-lg h-24 flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors group p-4">
                                    {typeof sport === 'string' ? (
                                        <span className="text-white font-bold opacity-70 group-hover:opacity-100">{sport}</span>
                                    ) : (
                                        sport.image ? (
                                            <img
                                                src={sport.image}
                                                alt={sport.name}
                                                className="max-h-full max-w-full object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"
                                            />
                                        ) : (
                                            <span className="text-white font-bold opacity-70 group-hover:opacity-100 text-center">{sport.name}</span>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Supported Devices Section */}
            <section className="py-20 bg-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">All Devices Are <span className="gradient-text">Supported</span></h2>
                    <p className="text-gray-400 text-lg mb-12">Experience seamless streaming across all your favorite devices</p>

                    <div className="flex flex-wrap justify-center gap-6">
                        {devices.map((device, idx) => (
                            <div key={idx} className="bg-white/5 px-6 py-4 rounded-xl border border-white/10 flex items-center gap-3 min-w-[140px] justify-center hover:border-primary/50 transition-colors">
                                <i className={`${device.icon} text-2xl text-gray-400`}></i>
                                <span className="font-semibold text-gray-300">{device.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Countries Grid Section */}
            <section className="py-20 bg-black/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {countries.map((country, idx) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-3 flex items-center space-x-3 border border-white/5 hover:border-white/20 transition-all cursor-default">
                                <span className="text-2xl">{country.flag}</span>
                                <span className="text-gray-300 font-medium text-sm">{country.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Pourquoi Choisir <span className="gradient-text">StreamWholesale</span> ?</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Une infrastructure robuste conçue pour les revendeurs sérieux qui veulent scaler leur business.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-effect p-8 rounded-2xl card-hover border border-white/10">
                            <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-6">
                                <i className="fas fa-server text-2xl text-primary"></i>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Panel Admin Pro</h3>
                            <p className="text-gray-400 leading-relaxed">Gérez vos clients, créez des lignes IPTV, surveillez l'utilisation en temps réel depuis une interface intuitive et moderne.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-effect p-8 rounded-2xl card-hover border border-white/10">
                            <div className="w-14 h-14 bg-secondary/20 rounded-xl flex items-center justify-center mb-6">
                                <i className="fas fa-code text-2xl text-secondary"></i>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">API REST Complète</h3>
                            <p className="text-gray-400 leading-relaxed">Automatisez la création et le renouvellement des abonnements. Documentation complète avec exemples en PHP, Node.js et Python.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-effect p-8 rounded-2xl card-hover border border-white/10">
                            <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6">
                                <i className="fas fa-bolt text-2xl text-accent"></i>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Livraison Instantanée</h3>
                            <p className="text-gray-400 leading-relaxed">Crédits ajoutés instantanément. Création de lignes en moins de 2 secondes. Zéro délai d'attente pour vos clients.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="glass-effect p-8 rounded-2xl card-hover border border-white/10">
                            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                                <i className="fas fa-shield-alt text-2xl text-green-400"></i>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Anti-Freeze™</h3>
                            <p className="text-gray-400 leading-relaxed">Technologie propriétaire de buffering réduite. Serveurs CDN répartis sur 12 pays pour une latence minimale.</p>
                        </div>

                        {/* Feature 5 */}
                        <div className="glass-effect p-8 rounded-2xl card-hover border border-white/10">
                            <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6">
                                <i className="fas fa-headset text-2xl text-orange-400"></i>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Support Prioritaire</h3>
                            <p className="text-gray-400 leading-relaxed">Assistance technique dédiée pour les revendeurs via Telegram, WhatsApp et ticket system. Réponse garantie sous 1h.</p>
                        </div>

                        {/* Feature 6 */}
                        <div className="glass-effect p-8 rounded-2xl card-hover border border-white/10">
                            <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6">
                                <i className="fas fa-chart-line text-2xl text-pink-400"></i>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Analyses Détaillées</h3>
                            <p className="text-gray-400 leading-relaxed">Statistiques de vente, taux de renouvellement, chaînes les plus regardées. Export CSV et rapports automatisés.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Tarifs <span className="gradient-text">Wholesale</span></h2>
                        <p className="text-gray-400 text-lg mb-8">Plus vous achetez de crédits, plus le prix unitaire est bas.</p>

                        {/* Toggle */}
                        <div className="flex justify-center items-center gap-4 mb-8">
                            <span className="text-gray-300">Paiement Unique</span>
                            <button className="w-14 h-7 bg-primary rounded-full relative transition-colors" onClick={togglePricing}>
                                <div id="toggle-circle" className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full transition-transform" style={{ transform: isYearly ? 'translateX(-28px)' : 'translateX(0)' }}></div>
                            </button>
                            <span className="text-gray-300">Abonnement Mensuel <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full ml-1">-20%</span></span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Starter */}
                        <div className="glass-effect rounded-2xl p-8 border border-white/10 relative">
                            <div className="absolute top-0 right-0 bg-white/5 px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm text-gray-400">Starter</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Pack Démarrage</h3>
                            <p className="text-gray-400 mb-6">Parfait pour tester le service</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">2.50€</span>
                                <span className="text-gray-400">/crédit</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>Minimum 20 crédits</li>
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>Panel de base</li>
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>Support par email</li>
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>Mise à jour auto</li>
                            </ul>
                            <button className="w-full py-3 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/5 transition-colors">Choisir ce pack</button>
                        </div>

                        {/* Pro */}
                        <div className="glass-effect rounded-2xl p-8 border-2 border-primary relative transform scale-105 shadow-2xl shadow-primary/20">
                            <div className="absolute top-0 right-0 bg-primary px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm text-white font-semibold">Populaire</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Pack Pro</h3>
                            <p className="text-gray-400 mb-6">Pour les revendeurs actifs</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">1.80€</span>
                                <span className="text-gray-400">/crédit</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>Minimum 100 crédits</li>
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>Panel Pro + Statistiques</li>
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>API Access</li>
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>Support WhatsApp 24/7</li>
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>White Label possible</li>
                            </ul>
                            <button className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:shadow-lg transition-all">Choisir ce pack</button>
                        </div>

                        {/* Enterprise */}
                        <div className="glass-effect rounded-2xl p-8 border border-white/10 relative">
                            <div className="absolute top-0 right-0 bg-white/5 px-4 py-1 rounded-bl-xl rounded-tr-xl text-sm text-gray-400">Enterprise</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Pack Platinum</h3>
                            <p className="text-gray-400 mb-6">Pour les gros volumes</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">1.20€</span>
                                <span className="text-gray-400">/crédit</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>Minimum 500 crédits</li>
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>Panel Entreprise</li>
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>API + Webhooks</li>
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>Account Manager dédié</li>
                                <li className="flex items-center text-gray-300"><i className="fas fa-check text-primary mr-3"></i>Custom DNS</li>
                            </ul>
                            <button className="w-full py-3 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/5 transition-colors">Contacter les ventes</button>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-gray-400 text-sm">1 Crédit = 1 Mois d'abonnement | Paiement sécurisé par Crypto, PayPal ou virement bancaire</p>
                    </div>
                </div>
            </section>

            {/* Panel Preview Section */}
            <section id="panel" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Panel <span className="gradient-text">Reseller</span> Ultra-Moderne</h2>
                            <p className="text-gray-400 text-lg mb-8">Gérez votre business IPTV comme un pro avec notre dashboard intuitif. Créez, modifiez, supprimez des lignes en quelques clics.</p>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mr-4">
                                        <i className="fas fa-users text-primary text-xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-lg mb-1">Gestion Multi-Utilisateurs</h4>
                                        <p className="text-gray-400">Créez des sous-revendeurs avec des limites de crédits personnalisables.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 mr-4">
                                        <i className="fas fa-mobile-alt text-secondary text-xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-lg mb-1">100% Responsive</h4>
                                        <p className="text-gray-400">Gérez vos clients depuis votre smartphone, tablette ou ordinateur.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 mr-4">
                                        <i className="fas fa-history text-accent text-xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-lg mb-1">Historique Complet</h4>
                                        <p className="text-gray-400">Suivi de toutes les actions, renouvellements et connexions en temps réel.</p>
                                    </div>
                                </div>
                            </div>

                            <Link to="/demos" className="mt-8 inline-block px-8 py-3 bg-white/5 border border-white/20 rounded-full text-white font-semibold hover:bg-white/10 transition-all">
                                Voir la Démo Live <i className="fas fa-external-link-alt ml-2"></i>
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
            <section className="py-24 bg-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Contenu <span className="gradient-text">Premium</span></h2>
                        <p className="text-gray-400 text-lg">Plus de 22,000 chaînes et 80,000 VOD dans toutes les langues</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="glass-effect p-6 rounded-xl text-center border border-white/10 hover:border-primary/50 transition-colors">
                            <i className="fas fa-futbol text-4xl text-primary mb-4"></i>
                            <h3 className="font-bold text-white mb-1">Sports</h3>
                            <p className="text-sm text-gray-400">Tous les matchs en 4K/FHD</p>
                        </div>
                        <div className="glass-effect p-6 rounded-xl text-center border border-white/10 hover:border-primary/50 transition-colors">
                            <i className="fas fa-film text-4xl text-secondary mb-4"></i>
                            <h3 className="font-bold text-white mb-1">Cinéma</h3>
                            <p className="text-sm text-gray-400">Derniers films et classiques</p>
                        </div>
                        <div className="glass-effect p-6 rounded-xl text-center border border-white/10 hover:border-primary/50 transition-colors">
                            <i className="fas fa-child text-4xl text-accent mb-4"></i>
                            <h3 className="font-bold text-white mb-1">Jeunesse</h3>
                            <p className="text-sm text-gray-400">Dessins animés et éducatif</p>
                        </div>
                        <div className="glass-effect p-6 rounded-xl text-center border border-white/10 hover:border-primary/50 transition-colors">
                            <i className="fas fa-globe text-4xl text-pink-400 mb-4"></i>
                            <h3 className="font-bold text-white mb-1">International</h3>
                            <p className="text-sm text-gray-400">50+ pays disponibles</p>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">France</span>
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">Belgique</span>
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">Suisse</span>
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">UK</span>
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">USA</span>
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">Canada</span>
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">Espagne</span>
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">Portugal</span>
                        <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">+42 autres</span>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Ils Nous Font <span className="gradient-text">Confiance</span></h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass-effect p-8 rounded-2xl border border-white/10 relative">
                            <div className="text-primary text-4xl absolute top-4 right-4 opacity-30">"</div>
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg mr-4">AK</div>
                                <div>
                                    <div className="text-white font-semibold">Alex K.</div>
                                    <div className="text-gray-400 text-sm">Revendeur depuis 2021</div>
                                </div>
                            </div>
                            <p className="text-gray-300">"Le meilleur fournisseur avec lequel j'ai travaillé. L'API est stable, le support réactif et mes clients sont satisfaits. J'ai multiplié mon CA par 3 en 6 mois."</p>
                            <div className="mt-4 flex text-yellow-400 text-sm">
                                <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                            </div>
                        </div>

                        <div className="glass-effect p-8 rounded-2xl border border-white/10 relative">
                            <div className="text-primary text-4xl absolute top-4 right-4 opacity-30">"</div>
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-bold text-lg mr-4">SM</div>
                                <div>
                                    <div className="text-white font-semibold">Sarah M.</div>
                                    <div className="text-gray-400 text-sm">Agence Digital</div>
                                </div>
                            </div>
                            <p className="text-gray-300">"L'intégration API a été un jeu changer pour mon business. Je peux maintenant vendre des abonnements automatiquement sur mon site sans intervention manuelle."</p>
                            <div className="mt-4 flex text-yellow-400 text-sm">
                                <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                            </div>
                        </div>

                        <div className="glass-effect p-8 rounded-2xl border border-white/10 relative">
                            <div className="text-primary text-4xl absolute top-4 right-4 opacity-30">"</div>
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold text-lg mr-4">JD</div>
                                <div>
                                    <div className="text-white font-semibold">Jean D.</div>
                                    <div className="text-gray-400 text-sm">Revendeur Pro</div>
                                </div>
                            </div>
                            <p className="text-gray-300">"Le panel est intuitif et professionnel. La qualité des streams est excellente avec très peu de buffering. Je recommande à 100% pour les sérieux."</p>
                            <div className="mt-4 flex text-yellow-400 text-sm">
                                <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 bg-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Questions <span className="gradient-text">Fréquentes</span></h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Comment fonctionne le système de crédits ?",
                                a: "1 crédit équivaut à 1 mois d'abonnement pour 1 appareil. Vous achetez des crédits en gros à prix réduit et vous les utilisez pour créer des lignes IPTV pour vos clients. Plus vous achetez de crédits, plus le prix unitaire est bas."
                            },
                            {
                                q: "Puis-je tester le service avant d'acheter ?",
                                a: "Oui, nous offrons un compte démo avec 5 crédits pour tester le panel et la qualité des streams. Contactez-nous via Telegram ou le chat pour obtenir votre accès test."
                            },
                            {
                                q: "Quels sont les délais de livraison ?",
                                a: "Les crédits sont ajoutés instantanément après confirmation du paiement (souvent moins de 2 minutes). Pour les virements bancaires, cela peut prendre 24-48h."
                            },
                            {
                                q: "Proposez-vous du support technique ?",
                                a: "Absolument. Nous offrons un support 24/7 via Telegram, WhatsApp et ticket system. Les revendeurs Pro et Platinum ont accès à un support prioritaire avec temps de réponse garanti sous 1 heure."
                            }
                        ].map((item, index) => (
                            <div key={index} className="glass-effect rounded-xl border border-white/10 overflow-hidden">
                                <button
                                    className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span className="font-semibold text-white">{item.q}</span>
                                    <i
                                        className={`fas fa-chevron-down text-gray-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                                    ></i>
                                </button>
                                <div className={`px-6 pb-4 text-gray-400 ${openFaq === index ? 'block' : 'hidden'}`}>
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

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">Prêt à Développer Votre Business ?</h2>
                    <p className="text-xl text-gray-300 mb-10">Rejoignez plus de 15,000 revendeurs qui nous font confiance. Commencez avec seulement 20 crédits.</p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="px-8 py-4 bg-white text-dark rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-2xl">
                            Créer un Compte Gratuit
                        </Link>
                        <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
                            Discuter sur Telegram
                        </button>
                    </div>

                    <div className="mt-8 flex justify-center items-center space-x-6 text-gray-400">
                        <div className="flex items-center"><i className="fas fa-check-circle text-green-400 mr-2"></i> Sans engagement</div>
                        <div className="flex items-center"><i className="fas fa-check-circle text-green-400 mr-2"></i> Support inclus</div>
                        <div className="flex items-center"><i className="fas fa-check-circle text-green-400 mr-2"></i> Mise à jour auto</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-darker border-t border-white/10 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                    <i className="fas fa-play text-white text-sm"></i>
                                </div>
                                <span className="text-xl font-bold text-white">Stream<span className="text-primary">Wholesale</span></span>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-sm">La solution wholesale IPTV la plus fiable pour les revendeurs professionnels. Infrastructure stable, API puissante et support 24/7.</p>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all"><i className="fab fa-telegram"></i></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all"><i className="fab fa-whatsapp"></i></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all"><i className="fab fa-discord"></i></a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary transition-all"><i className="fab fa-skype"></i></a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Produit</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Tarifs</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Panel Demo</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4">Légal</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">CGV</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">DMCA</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2024 StreamWholesale. Tous droits réservés.</p>
                        <div className="flex items-center space-x-4 text-gray-500 text-sm">
                            <span className="flex items-center"><i className="fas fa-lock mr-2"></i> Paiement sécurisé SSL</span>
                            <span className="flex items-center"><i className="fas fa-server mr-2"></i> Uptime 99.9%</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
