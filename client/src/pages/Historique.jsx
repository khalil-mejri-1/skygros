import { useContext, useState, useEffect } from "react";

import API_BASE_URL, { formatImageUrl } from "../config/api";
import { AuthContext } from "../context/AuthContext";
import { FaHistory, FaCalendarAlt, FaTicketAlt, FaGamepad, FaLink, FaClock, FaBox } from "react-icons/fa";
import axios from "axios";

const Historique = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsSmallMobile(window.innerWidth <= 480);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/orders/user/${user._id}`);

                if (!Array.isArray(res.data)) {
                    setOrders([]);
                    return;
                }

                // Group individual items into orders by timestamp (within 2 seconds)
                const grouped = [];
                res.data.forEach(item => {
                    const itemDate = new Date(item.createdAt).getTime();
                    let order = grouped.find(o => Math.abs(new Date(o.date).getTime() - itemDate) < 2000);

                    if (order) {
                        order.items.push(item);
                        order.total += item.price;
                    } else {
                        grouped.push({
                            _id: item._id,
                            date: item.createdAt,
                            total: item.price,
                            items: [item]
                        });
                    }
                });

                setOrders(grouped);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        // Auto-refresh every 5 seconds to check for fulfilled keys
        const intervalId = setInterval(fetchOrders, 5000);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [user]);

    const totalPurchasedProducts = orders.reduce((acc, order) => {
        return acc + order.items.length;
    }, 0);

    if (!user) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Veuillez vous connecter pour voir votre historique.</p>
            </div>
        );
    }

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

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '60px 0' }}>
                <div className="container">
                    {/* Header Skeleton */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'flex-end',
                        marginBottom: '40px',
                        gap: '20px'
                    }}>
                        <div>
                            <Skeleton width={isSmallMobile ? '200px' : '250px'} height="40px" style={{ marginBottom: '10px' }} />
                            <Skeleton width={isSmallMobile ? '100%' : '350px'} height="20px" />
                        </div>
                        <Skeleton width={isSmallMobile ? '100%' : '200px'} height="70px" borderRadius="15px" />
                    </div>

                    {/* Orders Skeleton List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                {/* Order Header Skeleton */}
                                <div style={{
                                    padding: isSmallMobile ? '15px' : '20px 30px',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: isSmallMobile ? 'column' : 'row',
                                    justifyContent: 'space-between',
                                    gap: '15px'
                                }}>
                                    <div className="flex gap-6" style={{ flexDirection: isSmallMobile ? 'column' : 'row', gap: isSmallMobile ? '10px' : '24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <Skeleton width="100px" height="15px" />
                                            <Skeleton width="150px" height="20px" />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <Skeleton width="80px" height="15px" />
                                            <Skeleton width="60px" height="20px" />
                                        </div>
                                    </div>
                                    <Skeleton width="100px" height="30px" />
                                </div>
                                {/* Order Item Skeleton */}
                                <div style={{
                                    padding: isSmallMobile ? '15px' : '30px',
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr' : '80px 1fr 250px',
                                    gap: isMobile ? '20px' : '30px',
                                    alignItems: 'center'
                                }}>
                                    {!isMobile && <Skeleton width="80px" height="110px" />}
                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '15px', alignItems: 'center' }}>
                                        {isMobile && <Skeleton width="60px" height="80px" />}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <Skeleton width="80%" height="25px" />
                                            <Skeleton width="40%" height="20px" />
                                        </div>
                                    </div>
                                    <Skeleton width="100%" height="80px" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '60px 0' }}>
            <div className="container">
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'flex-end',
                    marginBottom: '10px',
                    gap: '20px',

                }}>
                    <div>
                        <h1 className="section-title" style={{ marginBottom: '10px', fontSize: isSmallMobile ? '1.8rem' : '2.5rem' }}>
                            Historique des <span style={{ color: 'var(--accent-color)' }}>Achats</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: isSmallMobile ? '0.9rem' : '1rem' }}>Consultez vos commandes passées et vos codes de licence.</p>
                    </div>
                    <div className="glass" style={{
                        padding: '15px 25px',
                        borderRadius: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        width: isSmallMobile ? '100%' : 'auto'
                    }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(255, 153, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                            <FaBox size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>Produits achetés</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>{totalPurchasedProducts}</div>
                        </div>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="glass" style={{ padding: '80px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                        <FaHistory size={50} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '20px' }} />
                        <h2 style={{ color: '#fff', marginBottom: '10px' }}>Aucun achat trouvé</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Vous n'avez pas encore effectué d'achats sur notre plateforme.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {orders.map((order, idx) => (
                            <div key={idx} className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                {/* Order Header */}
                                <div style={{
                                    padding: isSmallMobile ? '15px' : '20px 30px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: isSmallMobile ? 'column' : 'row',
                                    justifyContent: 'space-between',
                                    alignItems: isSmallMobile ? 'flex-start' : 'center',
                                    gap: isSmallMobile ? '15px' : '0'
                                }}>
                                    <div className="flex gap-6" style={{ flexDirection: isSmallMobile ? 'column' : 'row', gap: isSmallMobile ? '10px' : '24px' }}>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Date de commande</div>
                                            <div style={{ color: '#fff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', fontSize: isSmallMobile ? '0.9rem' : '1rem' }}>
                                                <FaCalendarAlt size={14} style={{ color: 'var(--accent-color)' }} />
                                                {new Date(order.date).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: isSmallMobile ? 'numeric' : 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Montant Total</div>
                                            <div style={{ color: 'var(--accent-color)', fontWeight: '900', fontSize: isSmallMobile ? '1.1rem' : '1.2rem' }}>${order.total.toFixed(2)}</div>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '6px 15px',
                                        borderRadius: 'var(--radius-sm)',
                                        background: order.items.some(item => item.licenseKey === "PENDING") ? 'rgba(255, 153, 0, 0.1)' : 'rgba(0, 210, 133, 0.1)',
                                        color: order.items.some(item => item.licenseKey === "PENDING") ? 'var(--accent-color)' : 'var(--success)',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        width: isSmallMobile ? '100.2%' : 'auto',
                                        textAlign: 'center'
                                    }}>
                                        {order.items.some(item => item.licenseKey === "PENDING") ? "EN ATTENTE" : "TERMINÉE"}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div style={{ padding: isSmallMobile ? '15px' : '30px' }}>
                                    {order.items.map((item, itemIdx) => (
                                        <div key={itemIdx} style={{
                                            display: 'grid',
                                            gridTemplateColumns: isMobile ? '1fr' : '80px 1fr 250px',
                                            gap: isMobile ? '20px' : '30px',
                                            alignItems: 'center',
                                            padding: itemIdx > 0 ? (isSmallMobile ? '15px 0 0' : '20px 0 0') : '0',
                                            borderTop: itemIdx > 0 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                                            marginTop: itemIdx > 0 ? (isSmallMobile ? '15px' : '20px') : '0'
                                        }}>
                                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                <img src={formatImageUrl(item.productImage || item.image)} alt={item.productTitle || item.title} style={{
                                                    width: isSmallMobile ? '60px' : '80px',
                                                    height: isSmallMobile ? '80px' : '110px',
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--radius-md)'
                                                }} />
                                                {isMobile && (
                                                    <div style={{ flex: 1 }}>
                                                        <h3 style={{ color: '#fff', fontWeight: '800', marginBottom: '8px', fontSize: isSmallMobile ? '1rem' : '1.1rem' }}>{item.productTitle || item.title}</h3>
                                                        <div className="flex gap-4">
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qté: <strong style={{ color: '#fff' }}>1</strong></span>
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Prix: <strong style={{ color: '#fff' }}>${item.price.toFixed(2)}</strong></span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {!isMobile && (
                                                <div>
                                                    <h3 style={{ color: '#fff', fontWeight: '800', marginBottom: '8px' }}>{item.productTitle || item.title}</h3>
                                                    <div className="flex gap-4">
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qté: <strong style={{ color: '#fff' }}>1</strong></span>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Prix: <strong style={{ color: '#fff' }}>${item.price.toFixed(2)}</strong></span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* License Key / Download Button */}
                                            <div className="glass" style={{
                                                padding: '15px',
                                                background: 'rgba(0,0,0,0.2)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                width: '100%'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.7rem',
                                                    color: item.licenseKey === "PENDING" ? 'var(--text-muted)' : 'var(--accent-color)',
                                                    fontWeight: '800',
                                                    marginBottom: '8px',
                                                    textTransform: 'uppercase',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    {item.licenseKey === "PENDING" ? <FaClock size={12} /> : <FaTicketAlt size={12} />}
                                                    {item.licenseKey === "PENDING" ? "Statut de livraison" : "Code de licence"}
                                                </div>
                                                <div style={{
                                                    fontFamily: item.licenseKey === "PENDING" ? 'inherit' : 'monospace',
                                                    color: item.licenseKey === "PENDING" ? 'rgba(255,255,255,0.4)' : 'var(--accent-color)',
                                                    fontSize: isSmallMobile ? '0.85rem' : '0.95rem',
                                                    fontWeight: '900',
                                                    background: item.licenseKey === "PENDING" ? 'transparent' : 'rgba(255,153,0,0.05)',
                                                    padding: item.licenseKey === "PENDING" ? '5px 0' : '10px',
                                                    borderRadius: '6px',
                                                    textAlign: 'center',
                                                    border: item.licenseKey === "PENDING" ? 'none' : '1px dashed rgba(255,153,0,0.3)',
                                                    letterSpacing: item.licenseKey === "PENDING" ? '0' : '1px',
                                                    fontStyle: item.licenseKey === "PENDING" ? 'italic' : 'normal',
                                                    wordBreak: 'break-all'
                                                }}>
                                                    {item.licenseKey === "PENDING" ? "En attente de réapprovisionnement..." : item.licenseKey}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Historique;
