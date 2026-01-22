import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaSearch, FaDesktop, FaPlaystation, FaXbox, FaGamepad, FaGift, FaWallet, FaHistory, FaShieldAlt, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

const Navbar = () => {
    const { user, dispatch } = useContext(AuthContext);
    const { cartCount } = useContext(CartContext);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("/api/categories");
                setCategories(res.data);
            } catch (err) {
                console.error("Error fetching categories", err);
            }
        };
        fetchCategories();
    }, []);

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
            <nav className="glass" style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" style={{
                        fontSize: '2rem',
                        fontWeight: '900',
                        letterSpacing: '-1.5px',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        SKYGROS<span style={{ color: 'var(--accent-color)' }}>.</span>
                    </Link>

                    {/* Search Bar Refined */}
                    <div style={{ position: 'relative', width: '450px' }}>
                        <input
                            className="input-search"
                            placeholder="Que recherchez-vous ?"
                            style={{ paddingLeft: '45px' }}
                        />
                        <FaSearch style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.9rem' }} />
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center" style={{ gap: '25px' }}>
                        {user ? (
                            <div className="flex items-center" style={{ gap: '15px' }}>
                                {/* Wallet Pill - Premium Style */}
                                <div className="flex items-center gap-2"
                                    style={{
                                        background: 'rgba(255, 153, 0, 0.08)',
                                        border: '1px solid rgba(255, 153, 0, 0.2)',
                                        padding: '6px 16px',
                                        borderRadius: 'var(--radius-xl)',
                                        boxShadow: '0 0 20px rgba(255, 153, 0, 0.05)'
                                    }}>
                                    <FaWallet style={{ color: 'var(--accent-color)', fontSize: '0.9rem' }} />
                                    <span style={{ color: '#fff', fontSize: '1rem', fontWeight: '800' }}>
                                        ${Number(user?.balance || 0).toFixed(2)}
                                    </span>
                                </div>

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
                                {/* Logout Icon */}
                                <div
                                    onClick={handleLogout}
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
                                    title="Déconnexion"
                                >
                                    <FaSignOutAlt size={16} style={{ color: 'var(--text-secondary)' }} />
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
                        ) : (
                            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px' }}>
                                CONNEXION
                            </Link>
                        )}

                        {/* Cart Pill - Premium Design */}
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
                    </div>
                </div>
            </nav>

            {/* Support/Categories Sub-navbar */}
            <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '8px 0' }}>
                <div className="container flex justify-between items-center">
                    <div className="flex gap-6">
                        {categories.map((cat) => (
                            <div
                                key={cat._id}
                                style={{ position: 'relative' }}
                                onMouseEnter={() => setHoveredCategory(cat._id)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                <Link
                                    to={`/products/${cat.name}`}
                                    className="nav-item-link flex items-center gap-2"
                                    style={{ display: 'flex', alignItems: 'center', height: '100%' }}
                                >
                                    {renderIcon(cat.icon)}
                                    <span>{cat.name.toUpperCase()}</span>
                                    {cat.subcategories?.length > 0 && (
                                        <FaChevronDown size={10} style={{ opacity: 0.6, marginTop: '2px', transition: 'transform 0.3s', transform: hoveredCategory === cat._id ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                                    )}
                                </Link>

                                {/* Dropdown Menu */}
                                {hoveredCategory === cat._id && cat.subcategories?.length > 0 && (
                                    <div className="dropdown-menu glass" style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '0',
                                        minWidth: '240px',
                                        background: 'rgba(18, 18, 26, 0.95)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '16px',
                                        padding: '12px',
                                        zIndex: 1000,
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                        animation: 'fadeIn 0.2s ease-out',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginTop: '10px'
                                    }}>
                                        {/* Little Triangle Pointer */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-6px',
                                            left: '20px',
                                            width: '12px',
                                            height: '12px',
                                            background: 'rgba(18, 18, 26, 0.95)',
                                            borderLeft: '1px solid rgba(255,255,255,0.08)',
                                            borderTop: '1px solid rgba(255,255,255,0.08)',
                                            transform: 'rotate(45deg)'
                                        }}></div>

                                        {cat.subcategories.map((sub, idx) => (
                                            <Link
                                                key={idx}
                                                to={`/products/${cat.name}`}
                                                className="dropdown-item"
                                                style={{
                                                    padding: '12px 16px',
                                                    color: 'rgba(255,255,255,0.7)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    borderRadius: '10px',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                {sub}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Link to="/products" style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: 'var(--accent-color)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }} className="hover:underline">
                        VOIR TOUS LES PRODUITS
                    </Link>
                </div>
            </div>

            <style jsx>{`
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
            `}</style>
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 2000,
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
