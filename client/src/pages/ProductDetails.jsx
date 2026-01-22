import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { FaShoppingCart, FaCheck, FaShieldAlt, FaBolt, FaGlobe, FaChevronLeft, FaStar, FaPlus } from "react-icons/fa";
import ProductCard from "../components/ProductCard";
import LicenseKeyModal from "../components/LicenseKeyModal";
import axios from "axios";

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/products");
                const currentProduct = res.data.find(p => p._id === id);
                if (currentProduct) {
                    setProduct(currentProduct);
                    // Get similar products from the same category
                    setSimilarProducts(res.data.filter(p => p.category === currentProduct.category && p._id !== id).slice(0, 4));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const handleBuy = async () => {
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
            const res = await axios.post("http://localhost:5000/api/products/purchase", {
                userId: user._id,
                productId: product._id
            });

            if (res.status === 200) {
                updateBalance(res.data.newBalance);
                setLastPurchasedKey(res.data.licenseKey);

                setIsPurchased(true);
                setShowKeyModal(true);
                setTimeout(() => setIsPurchased(false), 5000);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Erreur lors de l'achat");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = () => {
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    if (!product) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>;

    const discountPercentage = product.oldPrice > 0
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0;

    return (
        <div style={{ background: 'var(--bg-primary)', padding: '40px 0', minHeight: '100vh' }}>
            <LicenseKeyModal
                isOpen={showKeyModal}
                onClose={() => setShowKeyModal(false)}
                productTitle={product.title}
                licenseKey={lastPurchasedKey}
            />

            <div className="container">
                <Link to="/products" className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '30px', fontWeight: '600' }}>
                    <FaChevronLeft size={12} /> RETOUR AU MAGASIN
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '60px', alignItems: 'start' }}>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <div className="card-premium" style={{ aspectRatio: '3/4', position: 'relative', background: '#000' }}>
                            <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {discountPercentage > 0 && (
                                <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'var(--accent-color)', color: '#000', padding: '6px 15px', borderRadius: '4px', fontWeight: '900', fontSize: '0.8rem' }}>
                                    OFFRE -{discountPercentage}%
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 mt-6">
                            <div className="flex-1 glass flex items-center gap-3 p-4" style={{ borderRadius: 'var(--radius-md)' }}>
                                <FaShieldAlt style={{ color: 'var(--success)', fontSize: '1.5rem' }} />
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff' }}>SÉCURISÉ</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>100% Garanti</div>
                                </div>
                            </div>
                            <div className="flex-1 glass flex items-center gap-3 p-4" style={{ borderRadius: 'var(--radius-md)' }}>
                                <FaBolt style={{ color: 'var(--accent-color)', fontSize: '1.5rem' }} />
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff' }}>INSTANTANÉ</div>
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
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#fff', marginBottom: '15px', lineHeight: '1.1', fontFamily: 'var(--font-main)' }}>
                            {product.title}
                        </h1>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center gap-1" style={{ color: '#f1c40f' }}>
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                <span style={{ color: '#fff', marginLeft: '5px', fontWeight: '700' }}>4.9</span>
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>(12.5k avis)</span>
                        </div>

                        <div className="glass" style={{ padding: '30px', borderRadius: 'var(--radius-lg)', marginBottom: '30px', border: '1px solid rgba(255, 153, 0, 0.2)' }}>
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    {product.oldPrice > 0 && (
                                        <div style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '1rem', marginBottom: '2px' }}>
                                            ${product.oldPrice.toFixed(2)}
                                        </div>
                                    )}
                                    <div style={{ color: 'var(--accent-color)', fontSize: '2.5rem', fontWeight: '900' }}>
                                        ${product.price.toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', color: product.keys?.filter(k => !k.isSold).length > 0 ? 'var(--success)' : '#ff4757', fontWeight: '800', marginBottom: '5px' }}>
                                        {product.keys?.filter(k => !k.isSold).length > 0 ? "✓ DISPONIBLE IMMÉDIATEMENT" : "✗ DÉSOLÉ, EN RUPTURE DE STOCK"}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {product.keys?.filter(k => !k.isSold).length > 0 ? "Livraison par code secret" : "Bientôt de retour"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleBuy}
                                    className="btn flex-1"
                                    disabled={isPurchased}
                                    style={{
                                        background: isPurchased ? 'var(--success)' : 'var(--accent-color)',
                                        color: '#000',
                                        padding: '18px',
                                        fontSize: '1.1rem',
                                        fontWeight: '900',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: '0 10px 20px rgba(255, 153, 0, 0.2)'
                                    }}
                                >
                                    {isLoading ? "Chargement..." :
                                        (isPurchased ? <FaCheck /> :
                                            (product.keys?.filter(k => !k.isSold).length > 0 ? "ACHETER MAINTENANT" : "COMMANDER"))}
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    className="btn"
                                    style={{
                                        background: isAdded ? 'var(--success)' : 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: isAdded ? '#000' : '#fff',
                                        padding: '0 25px',
                                        fontSize: '1.3rem',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                    title="Ajouter au panier"
                                >
                                    {isAdded ? <FaCheck /> : <FaPlus />}
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
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
                            <h2 className="section-title" style={{ marginBottom: 0 }}>PRODUITS <span style={{ color: 'var(--accent-color)' }}>SIMILAIRES</span></h2>
                            <Link to="/products" style={{ color: 'var(--accent-color)', fontWeight: '700', fontSize: '0.9rem' }}>VOIR TOUT</Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px' }}>
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
