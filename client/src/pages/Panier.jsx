import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaChevronLeft, FaCreditCard, FaCheckCircle, FaClock, FaRegCopy, FaCheck } from "react-icons/fa";
import axios from "axios";

const Panier = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useContext(CartContext);
    const { user, updateBalance } = useContext(AuthContext);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isPendingOrder, setIsPendingOrder] = useState(false);
    const [purchasedItems, setPurchasedItems] = useState([]);
    const navigate = useNavigate();
    const [copiedKey, setCopiedKey] = useState(null);

    const handleCheckout = async () => {
        if (!user) {
            alert("Veuillez vous connecter pour valider la commande.");
            return;
        }
        if (user.balance < cartTotal) {
            alert("Solde insuffisant !");
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

            const res = await axios.post("/api/products/purchase-cart", {
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
            alert(err.response?.data?.message || "Erreur lors de la validation");
        }
    };

    if (cartItems.length === 0 && !showSuccessModal) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div className="glass" style={{ padding: '60px', borderRadius: 'var(--radius-lg)', textAlign: 'center', maxWidth: '500px' }}>
                    <FaShoppingCart size={60} style={{ color: 'var(--accent-color)', marginBottom: '20px', opacity: 0.5 }} />
                    <h2 style={{ color: '#fff', marginBottom: '10px' }}>Votre panier est vide</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>On dirait أنك n'avez pas encore ajouté de produits.</p>
                    <Link to="/products" className="btn btn-primary" style={{ display: 'inline-block' }}>
                        PARCOURIR LE CATALOGUE
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '60px 0' }}>
            <div className="container">
                <h1 className="section-title" style={{ marginBottom: '40px' }}>
                    Votre <span style={{ color: 'var(--accent-color)' }}>Panier</span>
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
                    {/* Items List */}
                    <div className="flex flex-col gap-4">
                        {cartItems.map((item) => (
                            <div key={item._id} className="glass" style={{
                                display: 'grid',
                                gridTemplateColumns: 'min-content 1fr min-content min-content',
                                alignItems: 'center',
                                gap: '30px',
                                padding: '20px 30px',
                                borderRadius: 'var(--radius-xl)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                background: 'rgba(255,255,255,0.02)'
                            }}>
                                {/* Product Image */}
                                <div style={{ width: '80px', height: '110px', flexShrink: 0 }}>
                                    <img src={item.image} alt={item.title} style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.4)'
                                    }} />
                                </div>

                                {/* Information */}
                                <div>
                                    <h3 style={{
                                        color: '#fff',
                                        fontSize: '1.1rem',
                                        fontWeight: '800',
                                        marginBottom: '8px',
                                        marginRight: '20px'
                                    }}>{item.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                        <span style={{ color: 'var(--accent-color)', fontWeight: '900', fontSize: '1.25rem' }}>
                                            ${item.price.toFixed(2)}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'line-through' }}>
                                            ${(item.price * 1.5).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Quantity Control */}
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
                                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', color: '#020202ff', cursor: 'pointer' }}
                                    >
                                        <FaMinus size={10} />
                                    </button>
                                    <span style={{ color: '#f3f3f3ff', fontWeight: '900', width: '40px', textAlign: 'center', fontSize: '1.1rem' }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        className="flex items-center justify-center transition-all hover:bg-white/10"
                                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', color: '#020202ff', cursor: 'pointer' }}
                                    >
                                        <FaPlus size={10} />
                                    </button>
                                </div>

                                {/* Delete Button */}
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
                            </div>
                        ))}
                    </div>

                    {/* Summary Sidebar */}
                    <aside>
                        <div className="glass" style={{ padding: '30px', borderRadius: 'var(--radius-lg)', position: 'sticky', top: '120px' }}>
                            <h3 style={{ color: '#fff', marginBottom: '25px', fontSize: '1.3rem', fontWeight: '800' }}>Résumé de la commande</h3>

                            <div className="flex justify-between mb-4" style={{ color: 'var(--text-muted)' }}>
                                <span>Sous-total</span>
                                <span style={{ color: '#fff', fontWeight: '700' }}>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-6" style={{ color: 'var(--text-muted)' }}>
                                <span>Frais de service</span>
                                <span style={{ color: 'var(--success)', fontWeight: '700' }}>GRATUIT</span>
                            </div>

                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '20px' }}></div>

                            <div className="flex justify-between mb-8">
                                <span style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem' }}>Total</span>
                                <span style={{ color: 'var(--accent-color)', fontWeight: '900', fontSize: '1.5rem' }}>${cartTotal.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="btn btn-primary w-full"
                                style={{ padding: '18px', fontSize: '1.1rem', fontWeight: '900' }}
                            >
                                <FaCreditCard style={{ marginRight: '10px' }} /> COMMANDER
                            </button>

                            <Link to="/products" className="flex items-center justify-center gap-2 mt-6" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>
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
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass" style={{
                        width: '100%',
                        maxWidth: '700px',
                        maxHeight: '90vh',
                        padding: '40px',
                        borderRadius: '30px',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                        animation: 'modalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ overflowY: 'auto', paddingRight: '10px' }}>
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                background: isPendingOrder ? 'rgba(255, 153, 0, 0.1)' : 'rgba(46, 213, 115, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: isPendingOrder ? 'var(--accent-color)' : 'var(--success)'
                            }}>
                                {isPendingOrder ? <FaClock size={35} /> : <FaCheckCircle size={35} />}
                            </div>

                            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', marginBottom: '10px' }}>
                                {isPendingOrder ? "Commande Reçue !" : "Félicitations !"}
                            </h2>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '30px' }}>
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
                                        gap: '20px',
                                        padding: '15px',
                                        borderRadius: '20px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        alignItems: 'center'
                                    }}>
                                        <img src={item.productImage} alt="" style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '10px' }} />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '800', marginBottom: '5px' }}>{item.productTitle}</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CODE:</span>
                                                {item.licenseKey === "PENDING" ? (
                                                    <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '1px' }}>EN ATTENTE</span>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <code style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 'bold' }}>{item.licenseKey}</code>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(item.licenseKey);
                                                                setCopiedKey(idx);
                                                                setTimeout(() => setCopiedKey(null), 2000);
                                                            }}
                                                            style={{ background: 'none', border: 'none', color: copiedKey === idx ? 'var(--success)' : 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                        >
                                                            {copiedKey === idx ? (
                                                                <>
                                                                    <span style={{ fontSize: '0.7rem' }}>Copié !</span>
                                                                    <FaCheck size={12} />
                                                                </>
                                                            ) : (
                                                                <FaRegCopy size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button
                                onClick={() => navigate('/historique')}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '16px', borderRadius: '15px' }}
                            >
                                HISTORIQUE
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    navigate('/');
                                }}
                                className="btn"
                                style={{ flex: 1, padding: '16px', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', color: "white" }}
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
        </div>
    );
};

export default Panier;
