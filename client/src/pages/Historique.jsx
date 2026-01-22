import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaHistory, FaCalendarAlt, FaTicketAlt, FaGamepad, FaLink, FaClock, FaBox } from "react-icons/fa";
import axios from "axios";

const Historique = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const res = await axios.get(`/api/orders/user/${user._id}`);

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

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                Chargement de votre historique...
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '60px 0' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <h1 className="section-title" style={{ marginBottom: '10px' }}>
                            Historique des <span style={{ color: 'var(--accent-color)' }}>Achats</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Consultez vos commandes passées et vos codes de licence.</p>
                    </div>
                    <div className="glass" style={{ padding: '15px 25px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                                    padding: '20px 30px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div className="flex gap-6">
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Date de commande</div>
                                            <div style={{ color: '#fff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FaCalendarAlt size={14} style={{ color: 'var(--accent-color)' }} />
                                                {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Montant Total</div>
                                            <div style={{ color: 'var(--accent-color)', fontWeight: '900' }}>${order.total.toFixed(2)}</div>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '6px 15px',
                                        borderRadius: 'var(--radius-sm)',
                                        background: order.items.some(item => item.licenseKey === "PENDING") ? 'rgba(255, 153, 0, 0.1)' : 'rgba(0, 210, 133, 0.1)',
                                        color: order.items.some(item => item.licenseKey === "PENDING") ? 'var(--accent-color)' : 'var(--success)',
                                        fontSize: '0.75rem',
                                        fontWeight: '800'
                                    }}>
                                        {order.items.some(item => item.licenseKey === "PENDING") ? "EN ATTENTE" : "TERMINÉE"}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div style={{ padding: '30px' }}>
                                    {order.items.map((item, itemIdx) => (
                                        <div key={itemIdx} style={{
                                            display: 'grid',
                                            gridTemplateColumns: '80px 1fr 250px',
                                            gap: '30px',
                                            alignItems: 'center',
                                            padding: itemIdx > 0 ? '20px 0 0' : '0',
                                            borderTop: itemIdx > 0 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                                            marginTop: itemIdx > 0 ? '20px' : '0'
                                        }}>
                                            <img src={item.productImage || item.image} alt={item.productTitle || item.title} style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                                            <div>
                                                <h3 style={{ color: '#fff', fontWeight: '800', marginBottom: '8px' }}>{item.productTitle || item.title}</h3>
                                                <div className="flex gap-4">
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qté: <strong style={{ color: '#fff' }}>1</strong></span>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Prix: <strong style={{ color: '#fff' }}>${item.price.toFixed(2)}</strong></span>
                                                </div>
                                            </div>

                                            {/* License Key / Download Button */}
                                            <div className="glass" style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                                                    fontSize: '0.95rem',
                                                    fontWeight: '900',
                                                    background: item.licenseKey === "PENDING" ? 'transparent' : 'rgba(255,153,0,0.05)',
                                                    padding: item.licenseKey === "PENDING" ? '5px 0' : '10px',
                                                    borderRadius: '6px',
                                                    textAlign: 'center',
                                                    border: item.licenseKey === "PENDING" ? 'none' : '1px dashed rgba(255,153,0,0.3)',
                                                    letterSpacing: item.licenseKey === "PENDING" ? '0' : '1px',
                                                    fontStyle: item.licenseKey === "PENDING" ? 'italic' : 'normal'
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
