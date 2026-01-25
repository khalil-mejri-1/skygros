import { useContext, useState, useEffect } from "react";

import API_BASE_URL from "../config/api";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaChevronLeft, FaCreditCard, FaCheckCircle, FaClock, FaRegCopy, FaCheck } from "react-icons/fa";
import AlertModal from "../components/AlertModal";
import axios from "axios";

const Panier = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useContext(CartContext);
    const { user, updateBalance } = useContext(AuthContext);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isPendingOrder, setIsPendingOrder] = useState(false);
    const [purchasedItems, setPurchasedItems] = useState([]);
    const navigate = useNavigate();
    const [copiedKey, setCopiedKey] = useState(null);
    const [isSmall, setIsSmall] = useState(window.innerWidth <= 1000);
    const [isUltraSmall, setIsUltraSmall] = useState(window.innerWidth <= 660);
    const [isMobileMini, setIsMobileMini] = useState(window.innerWidth <= 425);
    const [isMobileMicro, setIsMobileMicro] = useState(window.innerWidth <= 355);

    const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

    useEffect(() => {
        const handleResize = () => {
            setIsSmall(window.innerWidth <= 1000);
            setIsUltraSmall(window.innerWidth <= 660);
            setIsMobileMini(window.innerWidth <= 425);
            setIsMobileMicro(window.innerWidth <= 355);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleCheckout = async () => {
        if (!user) {
            setAlertModal({
                isOpen: true,
                title: "Connexion Requise",
                message: "Veuillez vous connecter pour valider la commande.",
                type: "info"
            });
            return;
        }
        if (user.balance < cartTotal) {
            setAlertModal({
                isOpen: true,
                title: "Solde Insuffisant",
                message: "Votre solde est insuffisant pour effectuer cette commande.",
                type: "error"
            });
            return;
        }

        try {
            // Expand IDs based on quantity
            const expandedIds = [];
            cartItems.forEach(item => {
                for (let i = 0; i < item.quantity; i++) {
                    expandedIds.push(item._id);
                }
            });

            const res = await axios.post(`${API_BASE_URL}/api/products/purchase-cart`, {
                userId: user._id,
                productIds: expandedIds
            });

            if (res.status === 200) {
                updateBalance(res.data.newBalance);
                setIsPendingOrder(res.data.hasPendingItems);
                setPurchasedItems(res.data.purchasedItems);
                setShowSuccessModal(true);
                clearCart();
            }
        } catch (err) {
            setAlertModal({
                isOpen: true,
                title: "Erreur de Validation",
                message: err.response?.data?.message || "Erreur lors de la validation de la commande.",
                type: "error"
            });
        }
    };

    if (cartItems.length === 0 && !showSuccessModal) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div className="glass" style={{ padding: isUltraSmall ? '40px 20px' : '60px', borderRadius: 'var(--radius-lg)', textAlign: 'center', maxWidth: '500px' }}>
                    <FaShoppingCart size={isUltraSmall ? 40 : 60} style={{ color: 'var(--accent-color)', marginBottom: '20px', opacity: 0.5 }} />
                    <h2 style={{ color: '#fff', marginBottom: '10px', fontSize: isUltraSmall ? '1.5rem' : '2rem' }}>Votre panier est vide</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: isUltraSmall ? '0.9rem' : '1rem' }}>On dirait que vous n'avez pas encore ajouté de produits.</p>
                    <Link to="/products" className="btn btn-primary" style={{ display: 'inline-block' }}>
                        PARCOURIR LE CATALOGUE
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: isUltraSmall ? '40px 0 100px 0' : '60px 0' }}>
            <div className="container">
                <h1 className="section-title" style={{
                    marginBottom: '40px',
                    fontSize: isUltraSmall ? '1.8rem' : '2.5rem',
                    textAlign: isSmall ? 'center' : 'left'
                }}>
                    Votre <span style={{ color: 'var(--accent-color)' }}>Panier</span>
                </h1>

                <div style={{
                    display: 'flex',
                    flexDirection: isSmall ? 'column' : 'row',
                    gap: isSmall ? '30px' : '40px',
                    alignItems: 'start'
                }}>
                    {/* Items List */}
                    <div className="flex flex-col gap-4" style={{ width: '100%' }}>
                        {cartItems.map((item) => (
                            <div key={item._id} className="glass" style={{
                                display: 'grid',
                                gridTemplateColumns: isUltraSmall ? '80px 1fr' : 'min-content 1fr min-content min-content',
                                alignItems: 'center',
                                gap: isUltraSmall ? '15px' : '30px',
                                padding: isUltraSmall ? '15px' : '20px 30px',
                                borderRadius: 'var(--radius-xl)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                background: 'rgba(255,255,255,0.02)',
                                position: 'relative'
                            }}>
                                {/* Product Image */}
                                <div style={{ width: isUltraSmall ? '80px' : '80px', height: isUltraSmall ? '110px' : '110px', flexShrink: 0 }}>
                                    <img src={item.image} alt={item.title} style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.4)'
                                    }} />
                                </div>

                                {/* Information */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <h3 style={{
                                        color: '#fff',
                                        fontSize: isUltraSmall ? '0.95rem' : '1.1rem',
                                        fontWeight: '800',
                                        marginBottom: isUltraSmall ? '2px' : '8px',
                                        marginRight: '20px'
                                    }}>{item.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                        <span style={{ color: 'var(--accent-color)', fontWeight: '900', fontSize: isUltraSmall ? '1.1rem' : '1.25rem' }}>
                                            ${item.price.toFixed(2)}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'line-through' }}>
                                            ${(item.price * 1.5).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Mobile Only: Controls in the info area to save space */}
                                    {isUltraSmall && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                            <div className="flex items-center" style={{
                                                background: 'rgba(0,0,0,0.4)',
                                                padding: '3px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                            }}>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <FaMinus size={10} />
                                                </button>
                                                <span style={{ color: '#fff', fontWeight: '900', width: '30px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <FaPlus size={10} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                style={{
                                                    background: 'rgba(255,71,87,0.1)',
                                                    border: 'none',
                                                    color: '#ff4757',
                                                    width: '35px',
                                                    height: '35px',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Desktop: Quantity Control */}
                                {!isUltraSmall && (
                                    <div className="flex items-center" style={{
                                        background: 'rgba(0,0,0,0.4)',
                                        padding: '5px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        height: 'fit-content'
                                    }}>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            className="flex items-center justify-center transition-all hover:bg-white/10"
                                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', color: '#fff', cursor: 'pointer', background: 'transparent' }}
                                        >
                                            <FaMinus size={10} />
                                        </button>
                                        <span style={{ color: '#fff', fontWeight: '900', width: '40px', textAlign: 'center', fontSize: '1.1rem' }}>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            className="flex items-center justify-center transition-all hover:bg-white/10"
                                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', color: '#fff', cursor: 'pointer', background: 'transparent' }}
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </div>
                                )}

                                {/* Desktop: Delete Button */}
                                {!isUltraSmall && (
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="flex items-center justify-center hover-lift"
                                        style={{
                                            background: 'rgba(255,71,87,0.1)',
                                            border: '1px solid rgba(255,71,87,0.2)',
                                            color: '#ff4757',
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Summary Sidebar */}
                    <aside style={{ width: isSmall ? '100%' : '380px', position: isSmall ? 'relative' : 'sticky', top: isSmall ? '0' : '125px' }}>
                        <div className="glass" style={{
                            padding: isUltraSmall ? '25px' : '30px',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid rgba(255, 153, 0, 0.15)'
                        }}>
                            <h3 style={{ color: '#fff', marginBottom: '25px', fontSize: '1.3rem', fontWeight: '800' }}>Résumé de la commande</h3>

                            <div className="flex justify-between mb-4" style={{ color: 'var(--text-muted)', fontSize: isUltraSmall ? '0.9rem' : '1rem' }}>
                                <span>Sous-total</span>
                                <span style={{ color: '#fff', fontWeight: '700' }}>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-6" style={{ color: 'var(--text-muted)', fontSize: isUltraSmall ? '0.9rem' : '1rem' }}>
                                <span>Frais de service</span>
                                <span style={{ color: 'var(--success)', fontWeight: '700' }}>GRATUIT</span>
                            </div>

                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '20px' }}></div>

                            <div className="flex justify-between mb-8">
                                <span style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem' }}>Total</span>
                                <span style={{ color: 'var(--accent-color)', fontWeight: '900', fontSize: isUltraSmall ? '1.5rem' : '1.8rem' }}>${cartTotal.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="btn btn-primary w-full"
                                style={{
                                    padding: '18px',
                                    fontSize: isMobileMicro ? '0.75rem' : (isMobileMini ? '0.9rem' : '1.1rem'),
                                    fontWeight: '900',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}
                            >
                                <FaCreditCard /> COMMANDER MAINTENANT
                            </button>

                            <Link to="/products" className="flex items-center justify-center gap-2 mt-6" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}>
                                <FaChevronLeft size={12} /> Continuer vos achats
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
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
                        maxWidth: '700px',
                        maxHeight: '90vh',
                        padding: isUltraSmall ? '30px 20px' : '40px',
                        borderRadius: '30px',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                        animation: 'modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ overflowY: 'auto', paddingRight: '10px' }}>
                            <div style={{
                                width: isUltraSmall ? '50px' : '70px',
                                height: isUltraSmall ? '50px' : '70px',
                                borderRadius: '50%',
                                background: isPendingOrder ? 'rgba(255, 153, 0, 0.1)' : 'rgba(46, 213, 115, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: isPendingOrder ? 'var(--accent-color)' : 'var(--success)'
                            }}>
                                {isPendingOrder ? <FaClock size={isUltraSmall ? 25 : 35} /> : <FaCheckCircle size={isUltraSmall ? 25 : 35} />}
                            </div>

                            <h2 style={{ fontSize: isUltraSmall ? '1.3rem' : '1.6rem', fontWeight: '900', color: '#fff', marginBottom: '10px' }}>
                                {isPendingOrder ? "Commande Reçue !" : "Félicitations !"}
                            </h2>

                            <p style={{ color: 'var(--text-muted)', fontSize: isUltraSmall ? '0.85rem' : '0.95rem', marginBottom: '30px' }}>
                                {isPendingOrder
                                    ? "Certains produits sont en attente de stock. Voici le détail de vos articles :"
                                    : "Votre commande est validée. Voici vos codes de licence :"
                                }
                            </p>

                            {/* Detailed Items List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '35px', textAlign: 'left' }}>
                                {purchasedItems.map((item, idx) => (
                                    <div key={idx} className="glass" style={{
                                        display: 'flex',
                                        gap: isUltraSmall ? '12px' : '20px',
                                        padding: isUltraSmall ? '12px' : '15px',
                                        borderRadius: '20px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        alignItems: 'center'
                                    }}>
                                        <img src={item.productImage} alt="" style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '8px' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ color: '#fff', fontSize: isUltraSmall ? '0.85rem' : '0.95rem', fontWeight: '800', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productTitle}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CODE:</span>
                                                {item.licenseKey === "PENDING" ? (
                                                    <span style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px' }}>EN ATTENTE</span>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '100%' }}>
                                                        <code style={{ color: 'var(--success)', fontSize: isUltraSmall ? '0.75rem' : '0.9rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.licenseKey}</code>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(item.licenseKey);
                                                                setCopiedKey(idx);
                                                                setTimeout(() => setCopiedKey(null), 2000);
                                                            }}
                                                            style={{ background: 'none', border: 'none', color: copiedKey === idx ? 'var(--success)' : 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}
                                                        >
                                                            {copiedKey === idx ? <FaCheck size={12} /> : <FaRegCopy size={12} />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button
                                onClick={() => navigate('/historique')}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: isUltraSmall ? '14px' : '16px', borderRadius: '15px', fontSize: isUltraSmall ? '0.85rem' : '0.95rem' }}
                            >
                                HISTORIQUE
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    navigate('/');
                                }}
                                className="btn"
                                style={{ flex: 1, padding: isUltraSmall ? '14px' : '16px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', color: "white", fontSize: isUltraSmall ? '0.85rem' : '0.95rem' }}
                            >
                                FERMER
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
};

export default Panier;
