import { useContext, useState } from "react";

import API_BASE_URL from "../config/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { FaShoppingCart, FaWindows, FaXbox, FaPlaystation, FaCheck, FaPlus } from "react-icons/fa";
import LicenseKeyModal from "./LicenseKeyModal";
import axios from "axios";

const ProductCard = ({ product }) => {
    const { user, updateBalance } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const [isPurchased, setIsPurchased] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [lastPurchasedKey, setLastPurchasedKey] = useState("");
    const navigate = useNavigate();

    const handleBuy = async (e) => {
        if (e) e.stopPropagation();

        if (!user) {
            alert("Veuillez vous connecter pour acheter !");
            return;
        }
        if (user.balance < product.price) {
            alert("Solde insuffisant !");
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/products/purchase`, {
                userId: user._id,
                productId: product._id
            });

            if (res.status === 200) {
                updateBalance(res.data.newBalance);
                setLastPurchasedKey(res.data.licenseKey);

                // Order saved to DB by backend




                setIsPurchased(true);
                setShowKeyModal(true);
                // Keep the button as "CHECK" for longer
                setTimeout(() => setIsPurchased(false), 5000);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de l'achat");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = (e) => {
        if (e) e.stopPropagation();
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const discountPercentage = product.oldPrice > 0
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0;

    return (
        <div
            className="card-premium hover-lift"
            onClick={() => navigate(`/product/${product._id}`)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
                background: 'var(--bg-secondary)',
                height: '100%'
            }}>

            <LicenseKeyModal
                isOpen={showKeyModal}
                onClose={() => setShowKeyModal(false)}
                productTitle={product.title}
                licenseKey={lastPurchasedKey}
            />

            {/* Image Container */}
            <div style={{
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '2/3',
                background: '#000'
            }}>
                <img
                    src={product.image}
                    alt={product.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                    }}
                    className="product-image"
                />

                {(product.hasDiscount || discountPercentage > 0) && (
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'var(--accent-color)',
                        color: '#000',
                        fontSize: '0.75rem',
                        fontWeight: '900',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        zIndex: 2,
                        boxShadow: '0 4px 10px rgba(255, 153, 0, 0.3)'
                    }}>
                        -{discountPercentage}%
                    </div>
                )}

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(10, 11, 20, 0.8) 0%, transparent 40%)',
                    zIndex: 1
                }}></div>
            </div>

            {/* Details Section */}
            <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '10px',
                    fontFamily: 'var(--font-main)',
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '2.6em'
                }}>
                    {product.title}
                </h3>

                <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                    <div className="flex flex-col">
                        {product.oldPrice > 0 && (
                            <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.7rem', marginBottom: '-2px' }}>
                                ${product.oldPrice.toFixed(2)}
                            </span>
                        )}
                        <span style={{ color: 'var(--accent-color)', fontWeight: '900', fontSize: '1.1rem' }}>
                            ${product.price ? product.price.toFixed(2) : "0.00"}
                        </span>
                    </div>

                    {/* <div className="flex gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <FaWindows />
                        <FaPlaystation />
                    </div> */}
                </div>

                {/* Action Buttons Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px', gap: '8px' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); if (!isPurchased) handleBuy(); }}
                        className="btn"
                        disabled={isPurchased}
                        style={{
                            background: isPurchased ? 'var(--success)' : 'rgba(255, 153, 0, 0.15)',
                            border: '1px solid rgba(255, 153, 0, 0.3)',
                            color: isPurchased ? '#000' : 'var(--accent-color)',
                            padding: '10px',
                            fontSize: '0.75rem',
                            fontWeight: '900',
                            borderRadius: '10px',
                            textTransform: 'uppercase'
                        }}
                    >
                        {isLoading ? "Chargement..." :
                            (isPurchased ? <FaCheck /> :
                                (product.keys?.filter(k => !k.isSold).length > 0 ? "ACHETER" : "COMMANDER"))}
                    </button>

                    <button
                        onClick={handleAddToCart}
                        className="btn"
                        style={{
                            background: isAdded ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: isAdded ? '#000' : '#fff',
                            padding: '10px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Ajouter au panier"
                    >
                        {isAdded ? <FaCheck /> : <FaPlus />}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .card-premium:hover .product-image {
                    transform: scale(1.1);
                }
                .card-premium:hover {
                    box-shadow: 0 0 30px rgba(255, 153, 0, 0.15);
                    border-color: rgba(255, 153, 0, 0.4);
                }
            `}</style>
        </div>
    );
};

export default ProductCard;
