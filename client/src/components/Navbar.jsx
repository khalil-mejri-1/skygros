import { useContext, useState, useEffect, useRef } from 'react';
import API_BASE_URL from "../config/api";
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaSearch, FaWallet, FaHistory, FaShieldAlt, FaChevronDown, FaSignOutAlt, FaBars, FaTimes, FaGift, FaHome, FaMedal, FaTrophy, FaStar } from 'react-icons/fa';
import axios from 'axios';
import ResetCodeModal from './ResetCodeModal';

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
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [settings, setSettings] = useState(null);
    const subNavRef = useRef(null);
    const searchRef = useRef(null);
    const userMenuRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState(null);

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
                const res = await axios.get(`${API_BASE_URL}/categories`);
                if (Array.isArray(res.data)) {
                    setCategories(res.data);
                }
            } catch (err) {
                console.error("Error fetching categories", err);
            }
        };

        const fetchAllProducts = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/products`);
                if (Array.isArray(res.data)) {
                    setAllProducts(res.data);
                }
            } catch (err) {
                console.error("Error fetching products", err);
            }
        };

        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/settings`);
                if (res.data) setSettings(res.data);
            } catch (err) {
                console.error("Error fetching settings", err);
            }
        };

        fetchCategories();
        fetchAllProducts();
        fetchSettings();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (showSearchResults && searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
            if (subNavRef.current && !subNavRef.current.contains(event.target)) {
                setActiveMobileCategory(null);
                setHoveredCategory(null);
            }
        };

        const handleScroll = () => {
            setActiveMobileCategory(null);
            setHoveredCategory(null);
        };

        const scroller = scrollContainerRef.current;
        if (scroller) scroller.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (scroller) scroller.removeEventListener('scroll', handleScroll);
        };
    }, [showUserMenu, showSearchResults, activeMobileCategory, hoveredCategory]);

    useEffect(() => {
        const activeId = isMobile ? activeMobileCategory : hoveredCategory;
        if (activeId) {
            const el = document.getElementById(`cat-item-${activeId}`);
            const parent = subNavRef.current;
            if (el && parent) {
                const elRect = el.getBoundingClientRect();
                const parentRect = parent.getBoundingClientRect();
                setDropdownPosition({
                    left: elRect.left - parentRect.left + (elRect.width / 2),
                    width: elRect.width
                });
            }
        } else {
            setDropdownPosition(null);
        }
    }, [hoveredCategory, activeMobileCategory, isMobile]);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            const queryLower = query.toLowerCase();
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
                return titleLower.includes(queryLower) || isFuzzyMatch(titleLower, queryLower) || categoryLower.includes(queryLower);
            });
            setFilteredProducts(filtered);
            setShowSearchResults(true);
        } else {
            setFilteredProducts([]);
            setShowSearchResults(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const getRankDetail = (count, ranks = []) => {
        if (!ranks || ranks.length === 0) return null;
        const sorted = [...ranks].sort((a, b) => b.minPurchases - a.minPurchases);
        return sorted.find(r => count >= r.minPurchases) || (ranks[0] || null);
    };

    const renderRankIcon = (iconName, size = 18) => {
        const icons = {
            FaMedal: FaMedal,
            FaTrophy: FaTrophy,
            FaStar: FaStar
        };
        const Icon = icons[iconName] || FaMedal;
        return <Icon size={size} />;
    };

    const confirmLogout = () => {
        dispatch({ type: "LOGOUT" });
        setShowLogoutConfirm(false);
        navigate("/login");
    };

    const renderIcon = (icon) => {
        if (!icon) return null;
        if (icon.startsWith('http') || icon.startsWith('/')) {
            return <img src={icon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />;
        }
        return <span style={{ fontSize: '1.1rem' }}>{icon}</span>;
    };

    return (
        <div style={{ position: 'sticky', top: 0, zIndex: 99999 }}>
            <nav className="glass" style={{ padding: isSmallMobile ? '8px 0' : '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 99999 }}>
                <div className="container flex items-center justify-between" style={{ gap: isSmallMobile ? '12px' : '20px' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <img src="/logo.png" alt="SKYGROS" style={{ height: isSmallMobile ? '38px' : '45px', width: 'auto' }} />
                    </Link>

                    <div style={{ position: 'relative', flexGrow: 1, maxWidth: '600px' }} ref={searchRef}>
                        <input
                            className="input-search"
                            placeholder={isSmallMobile ? "Rechercher..." : "Que recherchez-vous ?"}
                            style={{
                                paddingLeft: '44px',
                                height: isSmallMobile ? '46px' : '48px',
                                fontSize: isSmallMobile ? '0.9rem' : '0.95rem',
                                borderRadius: 'var(--radius-lg)',
                                background: 'rgba(255,255,255,0.03)'
                            }}
                            value={searchQuery}
                            onChange={handleSearch}
                            onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
                        />
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: isSmallMobile ? '0.9rem' : '0.9rem' }} />

                        {showSearchResults && searchQuery.length > 0 && (
                            <div className="glass custom-scrollbar" style={{ position: 'absolute', top: '110%', left: 0, width: '100%', maxHeight: '350px', overflowY: 'auto', background: 'rgba(18, 18, 26, 0.99)', border: '1px solid rgba(255,153,0,0.2)', borderRadius: '16px', zIndex: 99999, padding: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.7)', animation: 'fadeIn 0.2s ease-out' }}>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(product => (
                                        <div key={product._id} onClick={() => { navigate(`/product/${product._id}`); setShowSearchResults(false); setSearchQuery(""); }} style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderRadius: '12px', marginBottom: '4px' }}>
                                            <img src={product.image} alt={product.title} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{product.category}</span>
                                                    <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: '900' }}>${product.price?.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun produit trouvé</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center" style={{ gap: isMobile ? '8px' : '12px', order: 2, display: 'flex' }}>
                        {user ? (
                            <>
                                {/* Hide balance on top for small mobile as it's in bottom bar */}
                                {!isSmallMobile && (
                                    <div className="flex items-center gap-2" style={{ background: 'rgba(255, 153, 0, 0.08)', border: '1px solid rgba(255, 153, 0, 0.2)', padding: isMobile ? '6px 10px' : '6px 16px', borderRadius: 'var(--radius-xl)', boxShadow: '0 0 20px rgba(255, 153, 0, 0.05)' }}>
                                        <FaWallet style={{ color: 'var(--accent-color)', fontSize: '0.8rem' }} />
                                        <span style={{ color: '#fff', fontSize: isMobile ? '0.75rem' : '0.9rem', fontWeight: '800' }}>${Number(user?.balance || 0).toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Hide cart on top for small mobile as it's in bottom bar */}
                                {!isSmallMobile && (
                                    <Link to="/panier" className="flex items-center justify-center hover-lift" style={{ background: 'rgba(255, 253, 250, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', width: isMobile ? '36px' : '42px', height: isMobile ? '36px' : '42px', borderRadius: '50%', position: 'relative' }}>
                                        <FaShoppingCart size={isMobile ? 14 : 18} style={{ color: cartCount > 0 ? 'var(--accent-color)' : 'var(--text-muted)' }} />
                                        {cartCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent-color)', color: '#000', fontSize: '0.55rem', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>{cartCount}</span>}
                                    </Link>
                                )}

                                {isMobile ? (
                                    !isSmallMobile && (
                                        <button
                                            onClick={() => setMobileMenuOpen(true)}
                                            className="hover-lift"
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#fff',
                                                padding: '10px',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaBars size={20} />
                                        </button>
                                    )
                                ) : (
                                    <button
                                        onClick={() => setMobileMenuOpen(true)}
                                        className="hover-lift flex items-center gap-3"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            padding: '8px 16px',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            transition: '0.3s'
                                        }}
                                    >
                                        <FaBars size={16} />
                                        <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>MENU</span>
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                {isMobile ? (
                                    !isSmallMobile && (
                                        <button
                                            onClick={() => setMobileMenuOpen(true)}
                                            className="hover-lift"
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#fff',
                                                padding: '10px',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaBars size={20} />
                                        </button>
                                    )
                                ) : (
                                    <>
                                        <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '12px', fontWeight: '800' }}>CONNEXION</Link>
                                        <button
                                            onClick={() => setMobileMenuOpen(true)}
                                            className="hover-lift flex items-center gap-3"
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#fff',
                                                padding: '8px 16px',
                                                borderRadius: '12px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FaBars size={16} />
                                            <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>MENU</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Sub-navbar with categories */}
            <div ref={subNavRef} style={{ background: 'var(--bg-secondary)', padding: '6px 0', position: 'relative', zIndex: 9990 }}>
                <div className="container" style={{ overflow: 'visible' }} onMouseLeave={() => !isMobile && setHoveredCategory(null)}>
                    <div ref={scrollContainerRef} className="flex gap-2 md:gap-4 custom-scrollbar" style={{
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        paddingBottom: '8px',
                        paddingLeft: isMobile ? '15px' : '0',
                        paddingRight: isMobile ? '15px' : '0',
                        display: 'flex',
                        flexWrap: 'nowrap',
                        zIndex: 100,
                        justifyContent: isMobile ? 'flex-start' : (categories.length > 5 ? 'flex-start' : 'center')
                    }}>
                        {categories.map((cat) => {
                            const hasSub = cat.subcategories?.length > 0;
                            const isActive = isMobile ? activeMobileCategory === cat._id : hoveredCategory === cat._id;

                            return (
                                <div key={cat._id} id={`cat-item-${cat._id}`} style={{ position: 'relative', flexShrink: 0 }}
                                    onMouseEnter={() => !isMobile && setHoveredCategory(cat._id)}
                                    onClick={(e) => {
                                        if (isMobile && hasSub) {
                                            e.preventDefault();
                                            setActiveMobileCategory(activeMobileCategory === cat._id ? null : cat._id);
                                        }
                                    }}>
                                    <Link
                                        to={hasSub ? "#" : `/products/${cat.name}`}
                                        className="nav-item-link flex items-center gap-2"
                                        style={{
                                            color: isActive ? 'var(--accent-color)' : 'rgba(255,255,255,0.6)',
                                            padding: '8px 14px',
                                            borderRadius: '12px',
                                            background: isActive ? 'rgba(255,153,0,0.05)' : 'transparent',
                                            border: isActive ? '1px solid rgba(255,153,0,0.2)' : '1px solid transparent',
                                            transition: '0.3s',
                                            fontSize: isSmallMobile ? '0.7rem' : '0.8rem',
                                            display: 'flex'
                                        }}
                                    >
                                        {renderIcon(cat.icon)}
                                        <span style={{ fontWeight: 800, letterSpacing: '0.5px' }}>{cat.name.toUpperCase()}</span>
                                        {hasSub && <FaChevronDown size={10} style={{ transform: isActive ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {/* Subcategories Dropdown RENDERED OUTSIDE the scroll container */}
                    {(() => {
                        const activeId = isMobile ? activeMobileCategory : hoveredCategory;
                        const activeCat = categories.find(c => c._id === activeId);
                        const hasSub = activeCat?.subcategories?.length > 0;

                        if (hasSub && dropdownPosition) {
                            return (
                                <div className="glass custom-scrollbar" style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 2px)',
                                    left: `${dropdownPosition.left}px`,
                                    transform: 'translateX(-50%)',
                                    minWidth: '200px',
                                    maxHeight: '320px',
                                    overflowY: 'auto',
                                    background: 'rgba(13, 14, 26, 0.98)',
                                    border: '1px solid rgba(255,153,0,0.2)',
                                    padding: '8px',
                                    zIndex: 9999,
                                    animation: 'fadeIn 0.2s ease-out',
                                    boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                                    borderRadius: '16px'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {activeCat.subcategories.map((sub, idx) => (
                                            <Link
                                                key={idx}
                                                to={`/products/${activeCat.name}?subcategory=${sub}`}
                                                onClick={() => { setHoveredCategory(null); setActiveMobileCategory(null); }}
                                                className="dropdown-item"
                                                style={{
                                                    padding: '10px 14px',
                                                    color: '#fff',
                                                    textDecoration: 'none',
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    transition: '0.2s'
                                                }}
                                            >
                                                <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{sub}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <>
                    <div style={{ position: 'fixed', top: 0, right: 0, width: '320px', maxWidth: '85vw', height: '100vh', background: '#0d0e1a', zIndex: 10000, display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 50px rgba(0,0,0,0.7)', animation: 'slideInRight 0.3s ease-out', borderLeft: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto' }}>
                        <div style={{ padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '25px', paddingBottom: '110px' }}>
                            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
                                <div className="flex items-center gap-3">
                                    {user ? (
                                        (() => {
                                            const userRank = getRankDetail(user.purchaseCount || 0, settings?.ranks);
                                            return (
                                                <>
                                                    <div style={{
                                                        width: '45px',
                                                        height: '45px',
                                                        borderRadius: '50%',
                                                        background: userRank?.color ? `${userRank.color}15` : 'rgba(255, 153, 0, 0.15)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: userRank?.color || 'var(--accent-color)',
                                                        border: `1px solid ${userRank?.color || 'var(--accent-color)'}33`
                                                    }}>
                                                        {renderRankIcon(userRank?.icon || 'FaMedal', 22)}
                                                    </div>
                                                    <div>
                                                        <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '0.9rem', margin: 0, textTransform: 'uppercase' }}>
                                                            {userRank?.name || 'Membre'}
                                                        </h3>
                                                        <span style={{ fontSize: '0.8rem', color: userRank?.color || 'var(--accent-color)', fontWeight: '800' }}>{user.username}</span>
                                                    </div>
                                                </>
                                            );
                                        })()
                                    ) : (
                                        <>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,153,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                                                <FaUser size={20} />
                                            </div>
                                            <div>
                                                <h3 style={{ color: '#fff', fontWeight: 900, fontSize: '1rem', margin: 0 }}>MENU</h3>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Visiteur</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <FaTimes onClick={() => setMobileMenuOpen(false)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }} size={24} />
                            </div>

                            <div className="flex flex-col gap-2">
                                {user ? (
                                    <>
                                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="nav-item-link flex items-center gap-4" style={{
                                            padding: '14px',
                                            borderRadius: '14px',
                                            background: window.location.pathname === '/profile' ? 'rgba(255,153,0,0.1)' : 'transparent',
                                            border: window.location.pathname === '/profile' ? '1px solid rgba(255,153,0,0.2)' : '1px solid transparent',
                                            color: window.location.pathname === '/profile' ? 'var(--accent-color)' : '#fff'
                                        }}>
                                            <FaUser color={window.location.pathname === '/profile' ? 'var(--accent-color)' : 'inherit'} size={18} />
                                            <span style={{ fontWeight: '700' }}>Mon Profil</span>
                                        </Link>
                                        <Link to="/historique" onClick={() => setMobileMenuOpen(false)} className="nav-item-link flex items-center gap-4" style={{
                                            padding: '14px',
                                            borderRadius: '14px',
                                            background: window.location.pathname === '/historique' ? 'rgba(255,153,0,0.1)' : 'transparent',
                                            border: window.location.pathname === '/historique' ? '1px solid rgba(255,153,0,0.2)' : '1px solid transparent',
                                            color: window.location.pathname === '/historique' ? 'var(--accent-color)' : '#fff'
                                        }}>
                                            <FaHistory size={18} style={{ color: window.location.pathname === '/historique' ? 'var(--accent-color)' : 'inherit' }} />
                                            <span style={{ fontWeight: '600' }}>Historique</span>
                                        </Link>
                                        {user?.demoBalance > 0 && (
                                            <Link to="/demos" onClick={() => setMobileMenuOpen(false)} className="nav-item-link flex items-center gap-4" style={{
                                                padding: '14px',
                                                borderRadius: '14px',
                                                background: window.location.pathname === '/demos' ? 'rgba(255,153,0,0.1)' : 'transparent',
                                                border: window.location.pathname === '/demos' ? '1px solid rgba(255,153,0,0.2)' : '1px solid transparent',
                                                color: window.location.pathname === '/demos' ? 'var(--accent-color)' : '#fff'
                                            }}>
                                                <FaGift size={18} color={window.location.pathname === '/demos' ? 'var(--accent-color)' : 'inherit'} />
                                                <span style={{ fontWeight: '600' }}>Demos</span>
                                            </Link>
                                        )}
                                        <Link to="/2fa-setup" onClick={() => setMobileMenuOpen(false)} className="nav-item-link flex items-center gap-4" style={{
                                            padding: '14px',
                                            borderRadius: '14px',
                                            background: window.location.pathname === '/2fa-setup' ? 'rgba(255,153,0,0.1)' : 'transparent',
                                            border: window.location.pathname === '/2fa-setup' ? '1px solid rgba(255,153,0,0.2)' : '1px solid transparent',
                                            color: window.location.pathname === '/2fa-setup' ? 'var(--accent-color)' : '#fff'
                                        }}>
                                            <FaShieldAlt size={18} style={{ color: window.location.pathname === '/2fa-setup' ? 'var(--accent-color)' : 'inherit' }} />
                                            <span style={{ fontWeight: '600' }}>Sécurité 2FA</span>
                                        </Link>

                                        <button
                                            onClick={() => { setMobileMenuOpen(false); setIsResetModalOpen(true); }}
                                            className="nav-item-link flex items-center gap-4"
                                            style={{ background: 'none', border: 'none', color: '#ff4757', textAlign: 'left', padding: '14px', cursor: 'pointer', width: '100%' }}
                                        >
                                            <i className="fas fa-undo-alt" style={{ fontSize: '18px' }}></i>
                                            <span style={{ fontWeight: '600' }}>Reset Code</span>
                                        </button>

                                        {user?.isAdmin && (
                                            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="nav-item-link flex items-center gap-4" style={{
                                                padding: '14px',
                                                borderRadius: '14px',
                                                color: '#ff4757',
                                                background: window.location.pathname === '/admin' ? 'rgba(255,71,87,0.1)' : 'rgba(255,71,87,0.05)',
                                                border: window.location.pathname === '/admin' ? '1px solid rgba(255,71,87,0.2)' : '1px solid transparent',
                                                marginTop: '10px'
                                            }}>
                                                <FaShieldAlt size={18} />
                                                <span style={{ fontWeight: '800' }}>Admin Panel</span>
                                            </Link>
                                        )}
                                        <div style={{ margin: '15px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}></div>
                                        <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="nav-item-link flex items-center gap-4" style={{ background: 'none', border: 'none', color: '#ff4757', textAlign: 'left', padding: '14px', cursor: 'pointer', width: '100%' }}>
                                            <FaSignOutAlt size={18} />
                                            <span style={{ fontWeight: '700' }}>Déconnexion</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ padding: '16px', textAlign: 'center', marginBottom: '10px', borderRadius: '14px' }}>CONNEXION</Link>
                                        <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn" style={{ padding: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '14px' }}>S'INSCRIRE</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, backdropFilter: 'blur(8px)' }}></div>
                </>
            )}

            {showLogoutConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass" style={{ width: '400px', padding: '40px', borderRadius: '30px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ background: 'rgba(255,71,87,0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <FaSignOutAlt size={30} color="#ff4757" />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900 }}>Déconnexion</h2>
                        <p style={{ color: 'var(--text-muted)', margin: '20px 0', lineHeight: 1.6 }}>Voulez-vous vraiment vous déconnecter de votre compte ?</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowLogoutConfirm(false)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }}>ANNULER</button>
                            <button onClick={confirmLogout} className="btn" style={{ flex: 1, background: '#ff4757', color: '#fff', border: 'none' }}>QUITTER</button>
                        </div>
                    </div>
                </div>
            )}

            <ResetCodeModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} />

            {/* Mobile Bottom Navigation Bar (Fixed for Small Mobile) */}
            {isSmallMobile && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '70px',
                    background: 'rgba(13, 14, 26, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(255,153,0,0.2)',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    padding: '0 5px',
                    zIndex: 10000,
                    boxShadow: '0 -10px 30px rgba(0,0,0,0.5)'
                }}>
                    <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#fff', textDecoration: 'none', minWidth: '60px' }}>
                        <FaHome size={20} style={{ color: window.location.pathname === '/' ? 'var(--accent-color)' : 'var(--text-muted)' }} />
                        <span style={{ fontSize: '0.6rem', fontWeight: '800' }}>ACCUEIL</span>
                    </Link>
                    {user && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', minWidth: '60px' }}>
                            <FaWallet size={20} />
                            <span style={{ fontSize: '0.65rem', fontWeight: '900' }}>${Number(user?.balance || 0).toFixed(0)}</span>
                        </div>
                    )}
                    <Link to="/panier" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#fff', textDecoration: 'none', position: 'relative', minWidth: '60px' }}>
                        <div style={{ position: 'relative' }}>
                            <FaShoppingCart size={20} style={{ color: window.location.pathname === '/panier' ? 'var(--accent-color)' : 'var(--text-muted)' }} />
                            {cartCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent-color)', color: '#000', fontSize: '0.55rem', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>{cartCount}</span>}
                        </div>
                        <span style={{ fontSize: '0.6rem', fontWeight: '800', color: window.location.pathname === '/panier' ? 'var(--accent-color)' : 'inherit' }}>PANIER</span>
                    </Link>
                    <div onClick={() => setMobileMenuOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#fff', cursor: 'pointer', minWidth: '60px' }}>
                        <FaBars size={20} style={{ color: mobileMenuOpen ? 'var(--accent-color)' : 'var(--text-muted)' }} />
                        <span style={{ fontSize: '0.6rem', fontWeight: '800' }}>MENU</span>
                    </div>
                </div>
            )}

            <style>{`
                .dropdown-item:hover { background: rgba(255,255,255,0.05) !important; color: var(--accent-color) !important; transform: translateX(5px); transition: 0.2s; }
                .nav-item-link { text-decoration: none; color: #fff; transition: 0.2s; }
                .nav-item-link:hover { color: var(--accent-color); background: rgba(255,255,255,0.03); }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--accent-color); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .hover-lift:active { transform: scale(0.95); }
            `}</style>
        </div>
    );
};

export default Navbar;
