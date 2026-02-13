import { useContext, useState, useEffect, useRef } from 'react';

import API_BASE_URL from "../config/api";
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaSearch, FaDesktop, FaPlaystation, FaXbox, FaGamepad, FaGift, FaWallet, FaHistory, FaShieldAlt, FaChevronDown, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const Navbar = () => {
    const { user, dispatch } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 930);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 660);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMobileCategory, setActiveMobileCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const subNavRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 930);
            setIsSmallMobile(window.innerWidth <= 660);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/categories`);
                if (Array.isArray(res.data)) {
                    setCategories(res.data);
                } else {
                    console.error("Categories data is not an array:", res.data);
                    setCategories([]);
                }
            } catch (err) {
                console.error("Error fetching categories", err);
                setCategories([]);
            }
        };

        const fetchAllProducts = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/products`);
                if (Array.isArray(res.data)) {
                    setAllProducts(res.data);
                }
            } catch (err) {
                console.error("Error fetching products for search", err);
            }
        };

        fetchCategories();
        fetchAllProducts();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSmallMobile && subNavRef.current && !subNavRef.current.contains(event.target)) {
                setActiveMobileCategory(null);
            }
        };

        if (isSmallMobile && activeMobileCategory) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        const handleSearchClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleSearchClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('mousedown', handleSearchClickOutside);
        };
    }, [isSmallMobile, activeMobileCategory]);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            const queryLower = query.toLowerCase();

            // Helper for fuzzy match
            const isFuzzyMatch = (text, search) => {
                let searchIdx = 0;
                for (let char of text) {
                    if (char === search[searchIdx]) searchIdx++;
                    if (searchIdx === search.length) return true;
                }
                return false;
            };

            const filtered = allProducts.filter(product => {
                const titleLower = product.title.toLowerCase();
                const categoryLower = product.category?.toLowerCase() || '';

                // Match including category in fuzzy/contiguous check might be too broad or strict depending on intent,
                // but usually user searches title. Let's prioritize title logic as requested.
                // We keep simple category includes as a fallback or auxiliary match if needed, but user specifically asked for character logic.
                // Let's stick to Title prioritization for the specific logic requested.

                // 1. Contiguous match
                if (titleLower.includes(queryLower)) return true;

                // 2. Fuzzy match
                if (isFuzzyMatch(titleLower, queryLower)) return true;

                // 3. Keep category match as a fallback (contiguous only for category to keep it sane)
                if (categoryLower.includes(queryLower)) return true;

                return false;
            }).sort((a, b) => {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                const catA = a.category?.toLowerCase() || '';
                const catB = b.category?.toLowerCase() || '';

                const aContiguous = titleA.includes(queryLower) || catA.includes(queryLower);
                const bContiguous = titleB.includes(queryLower) || catB.includes(queryLower);

                // Priority 1: Contiguous match
                if (aContiguous && !bContiguous) return -1;
                if (!aContiguous && bContiguous) return 1;

                // Priority 2: Fuzzy match (implied if not contiguous)
                // If both are fuzzy, maybe sort by length diff or just alphabet? 
                // Let's implicit keep original order or alphabetical if needed.
                return 0;
            });

            setFilteredProducts(filtered);
            setShowSearchResults(true);
        } else {
            setFilteredProducts([]);
            setShowSearchResults(false);
        }
    };

    const renderIcon = (icon) => {
        if (!icon) return null;
        if (icon.startsWith('http') || icon.startsWith('/')) {
            return <img src={icon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />;
        }
        return <span style={{ fontSize: '1.1rem' }}>{icon}</span>;
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        dispatch({ type: "LOGOUT" });
        setShowLogoutConfirm(false);
        navigate("/login");
    };

    return (
        <div style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
            {/* Main Navbar - Glassmorphism */}
            <nav className="glass" style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 20 }}>
                <div className="container flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" style={{
                        display: 'flex',
                        marginRight: "15px",
                        alignItems: 'center'
                    }}>
                        <img src="/logo.png" alt="SKYGROS" style={{ height: '45px', width: 'auto', objectFit: 'contain' }} />
                    </Link>

                    {/* Search Bar Refined */}
                    {/* Search Bar Refined */}
                    <div style={{ position: 'relative', width: isSmallMobile ? '100.2%' : '450px' }} ref={searchRef}>
                        <input
                            className="input-search"
                            placeholder="Que recherchez-vous ?"
                            style={{ paddingLeft: '45px' }}
                            value={searchQuery}
                            onChange={handleSearch}
                            onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
                        />
                        <FaSearch style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }} />

                        {/* Search Results Dropdown */}
                        {showSearchResults && searchQuery.length > 0 && (
                            <div className="glass custom-scrollbar" style={{
                                position: 'absolute',
                                top: '110%',
                                left: 0,
                                width: '100%',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                background: 'rgba(18, 18, 26, 0.98)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                zIndex: 1000,
                                padding: '5px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                            }}>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => (
                                        <div
                                            key={product._id}
                                            onClick={() => {
                                                navigate(`/product/${product._id}`);
                                                setShowSearchResults(false);
                                                setSearchQuery("");
                                            }}
                                            style={{
                                                padding: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {product.title}
                                                </div>
                                                <div style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: '700' }}>
                                                    ${product.price}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        Aucun produit trouvé pour "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User Actions - Responsive */}
                    <div className="flex items-center" style={{ gap: '15px', display: isSmallMobile ? 'none' : 'flex' }}>
                        {user ? (
                            <>
                                {/* Wallet - Always Visible */}
                                <div className="flex items-center gap-2"
                                    style={{
                                        background: 'rgba(255, 153, 0, 0.08)',
                                        border: '1px solid rgba(255, 153, 0, 0.2)',
                                        padding: '6px 16px',
                                        borderRadius: 'var(--radius-xl)',
                                        marginLeft: "15px",
                                        boxShadow: '0 0 20px rgba(255, 153, 0, 0.05)'
                                    }}>
                                    <FaWallet style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }} />
                                    <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '800' }}>
                                        ${Number(user?.balance || 0).toFixed(2)}
                                    </span>
                                </div>
                                <Link to="/panier"
                                    className="flex items-center gap-3 hover-lift"
                                    style={{
                                        background: 'rgba(255, 253, 250, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        padding: '8px 18px',
                                        borderRadius: 'var(--radius-xl)',
                                        textDecoration: 'none',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: cartCount > 0 ? '0 0 20px rgba(255, 153, 0, 0.1)' : 'none'
                                    }}
                                >
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <FaShoppingCart size={18} style={{
                                            color: cartCount > 0 ? 'var(--accent-color)' : 'var(--text-muted)',
                                            transition: '0.3s'
                                        }} />
                                        {cartCount > 0 && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '-10px',
                                                right: '-10px',
                                                background: 'var(--accent-color)',
                                                color: '#000',
                                                fontSize: '0.65rem',
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '900',
                                                border: '2px solid #1a1b32',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                                            }}>{cartCount}</span>
                                        )}
                                    </div>
                                    {/* <span style={{
                                color: cartCount > 0 ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.8rem',
                                fontWeight: '900',
                                letterSpacing: '0.5px'
                            }}>
                                PANIER
                            </span> */}
                                </Link>
                                {isMobile ? (
                                    <>
                                        {/* Mobile Menu Button only */}
                                        <button
                                            onClick={() => setMobileMenuOpen(true)}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#fff',
                                                fontSize: '1.2rem',
                                                cursor: 'pointer',
                                                padding: '10px',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginLeft: '10px'
                                            }}
                                        >
                                            <FaBars />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center" style={{ gap: '15px' }}>
                                        <Link to="/historique"
                                            className="flex items-center gap-3 hover-lift"
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                padding: '8px 18px',
                                                borderRadius: 'var(--radius-xl)',
                                                textDecoration: 'none',
                                                transition: 'all 0.3s ease',
                                            }}
                                        >
                                            <FaHistory style={{ color: 'var(--text-muted)' }} />
                                            <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                                                HISTORIQUE
                                            </span>
                                        </Link>

                                        {user?.demoBalance > 0 && (
                                            <Link to="/demos"
                                                className="flex items-center gap-3 hover-lift"
                                                style={{
                                                    background: 'rgba(255, 153, 0, 0.1)',
                                                    border: '1px solid rgba(255, 153, 0, 0.2)',
                                                    padding: '8px 18px',
                                                    borderRadius: 'var(--radius-xl)',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                <FaGift style={{ color: 'var(--accent-color)' }} />
                                                <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                                                    DEMOS
                                                </span>
                                            </Link>
                                        )}
                                        <div style={{ position: 'relative' }} ref={(node) => {
                                            // Close menu when clicking outside (optional, but good UX)
                                            // For simplicity in this step, we rely on toggles, but adding a wrapper is safe.
                                        }}>
                                            <div
                                                onClick={() => setShowUserMenu(!showUserMenu)}
                                                className="flex items-center justify-center hover-lift"
                                                style={{
                                                    cursor: 'pointer',
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    transition: '0.3s'
                                                }}
                                                title="Mon Profil"
                                            >
                                                <FaUser size={16} style={{ color: 'var(--text-secondary)' }} />
                                            </div>

                                            {/* User Dropdown Menu */}
                                            {showUserMenu && (
                                                <div className="glass" style={{
                                                    position: 'absolute',
                                                    top: '120%',
                                                    right: '0',
                                                    minWidth: '200px',
                                                    background: 'rgba(18, 18, 26, 0.95)',
                                                    backdropFilter: 'blur(20px)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    borderRadius: '16px',
                                                    padding: '8px',
                                                    zIndex: 1000,
                                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                                    animation: 'fadeIn 0.2s ease-out',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px'
                                                }}>
                                                    {/* Little Triangle Pointer */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-6px',
                                                        right: '14px',
                                                        width: '12px',
                                                        height: '12px',
                                                        background: 'rgba(18, 18, 26, 0.95)',
                                                        borderLeft: '1px solid rgba(255,255,255,0.08)',
                                                        borderTop: '1px solid rgba(255,255,255,0.08)',
                                                        transform: 'rotate(45deg)'
                                                    }}></div>

                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="dropdown-item"
                                                        style={{
                                                            padding: '12px 16px',
                                                            color: 'rgba(255,255,255,0.8)',
                                                            textDecoration: 'none',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            borderRadius: '10px',
                                                            transition: 'all 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px'
                                                        }}
                                                    >
                                                        <FaUser size={14} style={{ color: 'var(--accent-color)' }} />
                                                        <span>Profil</span>
                                                    </Link>

                                                    <button
                                                        onClick={() => {
                                                            handleLogout();
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="dropdown-item"
                                                        style={{
                                                            padding: '12px 16px',
                                                            color: '#ff4757',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            fontSize: '0.9rem',
                                                            fontWeight: '600',
                                                            borderRadius: '10px',
                                                            transition: 'all 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            width: '100%',
                                                            cursor: 'pointer',
                                                            textAlign: 'left'
                                                        }}
                                                    >
                                                        <FaSignOutAlt size={14} />
                                                        <span>Déconnexion</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Historique Button - Premium Style */}


                                        {/* 2FA Security Button */}
                                        <Link to="/2fa-setup"
                                            className="flex items-center gap-3 hover-lift"
                                            style={{
                                                background: user?.is2FAEnabled ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                                border: user?.is2FAEnabled ? '1px solid rgba(46, 213, 115, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                                                padding: '8px 18px',
                                                borderRadius: 'var(--radius-xl)',
                                                textDecoration: 'none',
                                                transition: 'all 0.3s ease',
                                            }}
                                            title="Sécurité 2FA"
                                        >
                                            <FaShieldAlt style={{ color: user?.is2FAEnabled ? '#2ed573' : 'var(--text-muted)' }} />
                                            {/* <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                                        SÉCURITÉ
                                    </span> */}
                                        </Link>

                                        {/* Admin Button - Only for Admins */}
                                        {user?.isAdmin && (
                                            <Link to="/admin"
                                                className="flex items-center gap-2 hover-lift"
                                                style={{
                                                    background: 'rgba(255, 71, 87, 0.1)',
                                                    border: '1px solid rgba(255, 71, 87, 0.2)',
                                                    padding: '8px 18px',
                                                    borderRadius: 'var(--radius-xl)',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.3s ease',
                                                }}
                                            >
                                                <span style={{ color: '#ff4757', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                                                    ADMIN
                                                </span>
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px' }}>
                                CONNEXION
                            </Link>
                        )}


                    </div>
                </div>
            </nav>

            {/* Support/Categories Sub-navbar */}
            <div
                ref={subNavRef}
                style={{
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    padding: '8px 0',
                    position: 'relative'
                }}>
                <div
                    className="container flex flex-col"
                    onMouseLeave={() => !isSmallMobile && setHoveredCategory(null)}
                >
                    <div className="flex justify-between items-center" style={{ flexDirection: isSmallMobile ? 'column' : 'row', gap: isSmallMobile ? '8px' : '0' }}>
                        <div className="flex gap-6 custom-scrollbar" style={{
                            overflowX: 'auto',
                            whiteSpace: 'nowrap',
                            paddingBottom: '8px',
                            width: '100%',
                            flexShrink: 0
                        }}>
                            {categories.length === 0 ? (
                                // Skeleton Loading State
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} style={{
                                        width: '100px',
                                        height: '20px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '4px',
                                        animation: 'pulse 1.5s infinite'
                                    }}></div>
                                ))
                            ) : (
                                categories.map((cat) => (
                                    <div
                                        key={cat._id}
                                        style={{ position: 'relative' }}
                                        onMouseEnter={() => !isSmallMobile && setHoveredCategory(cat._id)}
                                        onClick={(e) => {
                                            if (isSmallMobile && cat.subcategories?.length > 0) {
                                                e.preventDefault();
                                                setActiveMobileCategory(activeMobileCategory === cat._id ? null : cat._id);
                                            }
                                        }}
                                    >
                                        <Link
                                            to={isSmallMobile && cat.subcategories?.length > 0 ? "#" : `/products/${cat.name}`}
                                            className="nav-item-link flex items-center gap-2"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                height: '100%',
                                                padding: isSmallMobile ? '4px 12px' : '0 0 10px 0',
                                                borderRadius: isSmallMobile ? '8px' : '0',
                                                background: (isSmallMobile && activeMobileCategory === cat._id) ? 'rgba(255, 153, 0, 0.1)' : 'transparent',
                                                borderBottom: (!isSmallMobile && hoveredCategory === cat._id) ? '2px solid var(--accent-color)' : '2px solid transparent',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {renderIcon(cat.icon)}
                                            <span style={{
                                                color: (isSmallMobile ? activeMobileCategory === cat._id : hoveredCategory === cat._id) ? 'var(--accent-color)' : 'inherit',
                                                fontWeight: (isSmallMobile ? activeMobileCategory === cat._id : hoveredCategory === cat._id) ? '800' : '600'
                                            }}>
                                                {cat.name.toUpperCase()}
                                            </span>
                                            {cat.subcategories?.length > 0 && (
                                                <FaChevronDown size={10} style={{
                                                    opacity: 0.6,
                                                    marginTop: '2px',
                                                    transition: 'transform 0.3s',
                                                    transform: (isSmallMobile ? activeMobileCategory === cat._id : hoveredCategory === cat._id) ? 'rotate(180deg)' : 'rotate(0deg)'
                                                }} />
                                            )}
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* {!isSmallMobile && (
                            <Link to="/products" style={{
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: 'var(--accent-color)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                paddingBottom: '10px'
                            }} className="hover:underline">
                                VOIR TOUS LES PRODUITS
                            </Link>
                        )} */}
                    </div>

                    {/* Unified Subcategories Window/Bar */}
                    {(isSmallMobile ? activeMobileCategory : hoveredCategory) &&
                        categories.find(c => c._id === (isSmallMobile ? activeMobileCategory : hoveredCategory))?.subcategories?.length > 0 && (
                            <div
                                className="glass custom-scrollbar"
                                style={{
                                    display: 'flex',
                                    gap: '10px',
                                    overflowX: 'auto',
                                    padding: '15px 20px',
                                    borderRadius: '16px',
                                    whiteSpace: 'nowrap',
                                    animation: 'slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    background: 'rgba(20, 21, 38, 0.7)',
                                    border: '1px solid rgba(255, 153, 0, 0.1)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                                    width: '100%',
                                    marginTop: isSmallMobile ? '5px' : '0px'
                                }}
                            >
                                {/* <span style={{
                                    color: 'var(--accent-color)',
                                    fontSize: '0.75rem',
                                    fontWeight: '900',
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginRight: '10px',
                                    borderRight: '1px solid rgba(255,255,255,0.1)',
                                    paddingRight: '15px'
                                }}>
                                    SOUS-CATÉGORIES
                                </span> */}
                                {categories.find(c => c._id === (isSmallMobile ? activeMobileCategory : hoveredCategory)).subcategories.map((sub, idx) => (
                                    <Link
                                        key={idx}
                                        onClick={() => isSmallMobile && setActiveMobileCategory(null)}
                                        to={`/products/${categories.find(c => c._id === (isSmallMobile ? activeMobileCategory : hoveredCategory)).name}?subcategory=${sub}`}
                                        style={{
                                            padding: '8px 18px',
                                            borderRadius: '10px',
                                            fontSize: '0.85rem',
                                            fontWeight: '700',
                                            background: 'rgba(255,255,255,0.03)',
                                            color: '#fff',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            flexShrink: 0,
                                            textDecoration: 'none',
                                            transition: 'all 0.2s ease'
                                        }}
                                        className="subcategory-pill"
                                    >
                                        {sub}
                                    </Link>
                                ))}
                            </div>
                        )}
                </div>
            </div>

            {/* Bottom Navigation for Small Mobile (<= 660px) */}
            {isSmallMobile && (
                <div className="glass" style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '70px',
                    background: 'rgba(13, 14, 26, 0.98)',
                    backdropFilter: 'blur(30px)',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    zIndex: 1001,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    padding: '0 20px',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.6)'
                }}>
                    {/* Wallet - Always Visible if logged in */}
                    {user && (
                        <div className="flex items-center gap-2"
                            style={{
                                background: 'rgba(255, 153, 0, 0.08)',
                                border: '1px solid rgba(255, 153, 0, 0.2)',
                                padding: '8px 14px',
                                borderRadius: 'var(--radius-xl)',
                            }}>
                            <FaWallet style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }} />
                            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '800' }}>
                                ${Number(user?.balance || 0).toFixed(2)}
                            </span>
                        </div>
                    )}

                    {/* Cart Tool (External) */}
                    <Link to="/panier"
                        className="flex items-center justify-center hover-lift"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            width: '45px',
                            height: '45px',
                            borderRadius: '12px',
                            position: 'relative',
                            textDecoration: 'none'
                        }}
                    >
                        <FaShoppingCart size={20} style={{ color: cartCount > 0 ? 'var(--accent-color)' : '#fff' }} />
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: 'var(--accent-color)',
                                color: '#000',
                                fontSize: '0.65rem',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '900',
                                border: '2px solid #0d0e1a'
                            }}>{cartCount}</span>
                        )}
                    </Link>

                    {/* Menu Button */}
                    {user ? (
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                width: '45px',
                                height: '45px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <FaBars />
                        </button>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem', borderRadius: 'var(--radius-xl)' }}>
                            CONNEXION
                        </Link>
                    )}
                </div>
            )}

            <style jsx>{`
                :global(body) {
                    padding-bottom: ${isSmallMobile ? '70px' : '0'};
                }
                .nav-item-link {
                    padding: 8px 16px;
                    border-radius: var(--radius-md);
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .nav-item-link:hover {
                    color: #fff;
                    background: rgba(255,255,255,0.04);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--accent-color);
                    border-radius: 10px;
                }
                .dropdown-item:hover {
                    background: rgba(255,255,255,0.08) !important;
                    color: #fff !important;
                    padding-left: 20px !important;
                    transform: translateX(5px);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        width: '300px',
                        maxWidth: '85vw',
                        height: '100vh',
                        background: '#0d0e1a',
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        zIndex: 10000,
                        padding: '30px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                        animation: 'slideInRight 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>MENU</h3>
                            <div onClick={() => setMobileMenuOpen(false)} style={{ cursor: 'pointer', padding: '5px' }}>
                                <FaTimes size={20} color="#fff" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="nav-item-link flex items-center gap-3" style={{ fontSize: '1rem', padding: '12px', textTransform: 'none' }}>
                                <FaUser style={{ color: 'var(--accent-color)' }} /> Mon Profil
                            </Link>

                            <Link to="/historique" onClick={() => setMobileMenuOpen(false)} className="nav-item-link flex items-center gap-3" style={{ fontSize: '1rem', padding: '12px', textTransform: 'none' }}>
                                <FaHistory style={{ color: 'var(--text-muted)' }} /> Historique
                            </Link>

                            {user?.demoBalance > 0 && (
                                <Link to="/demos" onClick={() => setMobileMenuOpen(false)} className="nav-item-link flex items-center gap-3" style={{ fontSize: '1rem', padding: '12px', textTransform: 'none' }}>
                                    <FaGift style={{ color: 'var(--accent-color)' }} /> Demos
                                </Link>
                            )}

                            <Link to="/2fa-setup" onClick={() => setMobileMenuOpen(false)} className="nav-item-link flex items-center gap-3" style={{ fontSize: '1rem', padding: '12px', textTransform: 'none' }}>
                                <FaShieldAlt style={{ color: user?.is2FAEnabled ? '#2ed573' : 'var(--text-muted)' }} /> Sécurité 2FA
                            </Link>

                            {user?.isAdmin && (
                                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="nav-item-link flex items-center gap-3" style={{ fontSize: '1rem', padding: '12px', textTransform: 'none' }}>
                                    <FaShieldAlt style={{ color: '#ff4757' }} /> Tableau de bord
                                </Link>
                            )}

                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }}></div>

                            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="nav-item-link flex items-center gap-3" style={{ background: 'none', border: 'none', fontSize: '1rem', padding: '12px', color: '#ff4757', justifyContent: 'flex-start', textTransform: 'none', width: '100%' }}>
                                <FaSignOutAlt /> Déconnexion
                            </button>
                        </div>
                    </div>
                    <div onClick={() => setMobileMenuOpen(false)} style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, backdropFilter: 'blur(3px)'
                    }}></div>
                </>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 11000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass" style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '40px',
                        borderRadius: '30px',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(255, 71, 87, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            color: '#ff4757'
                        }}>
                            <FaSignOutAlt size={24} />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '900', marginBottom: '10px' }}>Déconnexion</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: '1.6' }}>Êtes-vous sûr de vouloir vous déconnecter de votre session ?</p>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="btn"
                                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '12px' }}
                            >
                                ANNULER
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '12px', background: '#ff4757', color: '#fff', borderRadius: '12px', border: 'none' }}
                            >
                                QUITTER
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;
