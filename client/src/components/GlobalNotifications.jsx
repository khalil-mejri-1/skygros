import { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API_BASE_URL from "../config/api";
import { FaCheckCircle, FaTimes, FaBell } from "react-icons/fa";
import axios from "axios";

const GlobalNotifications = () => {
    const { user, updateBalance } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const lastKnownKeysRef = useRef({});

    useEffect(() => {
        if (!user) return;

        lastKnownKeysRef.current = JSON.parse(localStorage.getItem(`known_keys_${user._id}`)) || {};

        const syncData = async () => {
            try {
                // Fetch latest user data and orders in parallel
                const [ordersRes, userRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/orders/user/${user._id}`),
                    axios.get(`${API_BASE_URL}/api/users/${user._id}`)
                ]);

                // Sync Balance
                if (userRes.data && typeof userRes.data.balance !== 'undefined') {
                    if (userRes.data.balance !== user.balance) {
                        updateBalance(userRes.data.balance);
                    }
                }

                if (!Array.isArray(ordersRes.data)) return;

                const currentKeys = {};
                const newFulfillmentFound = [];

                ordersRes.data.forEach(item => {
                    const statusInStorage = lastKnownKeysRef.current[item._id];

                    if (statusInStorage === "PENDING" && item.licenseKey !== "PENDING") {
                        newFulfillmentFound.push({
                            id: item._id + Date.now(),
                            title: item.productTitle,
                            key: item.licenseKey
                        });
                    }
                    currentKeys[item._id] = item.licenseKey;
                });

                lastKnownKeysRef.current = currentKeys;
                localStorage.setItem(`known_keys_${user._id}`, JSON.stringify(currentKeys));

                if (newFulfillmentFound.length > 0) {
                    newFulfillmentFound.forEach(notif => {
                        setNotifications(prev => [...prev, notif]);
                        setTimeout(() => {
                            setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        }, 10000);
                    });
                }
            } catch (err) {
                console.error("Sync data error:", err);
            }
        };

        syncData();
        const intervalId = setInterval(syncData, 5000);
        return () => clearInterval(intervalId);
    }, [user, user?.balance]);

    if (notifications.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '30px',
            right: '30px',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        }}>
            {notifications.map(notif => (
                <div key={notif.id} className="glass" style={{
                    width: '380px',
                    padding: '24px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(46, 213, 115, 0.2) 0%, rgba(13, 14, 26, 0.98) 100%)',
                    border: '1px solid rgba(46, 213, 115, 0.4)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(46, 213, 115, 0.1)',
                    display: 'flex',
                    gap: '18px',
                    alignItems: 'center',
                    animation: 'toastSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                    <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        background: 'rgba(46, 213, 115, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2ed573',
                        flexShrink: 0,
                        boxShadow: '0 0 15px rgba(46, 213, 115, 0.2)'
                    }}>
                        <FaBell size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#fff', marginBottom: '4px', letterSpacing: '0.5px' }}>OFFRE PRÊTE !</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                            Bonne nouvelle ! Votre code pour <strong style={{ color: '#fff' }}>{notif.title}</strong> est maintenant disponible.
                        </div>
                    </div>
                    <button
                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: '0.3s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                    >
                        <FaTimes size={14} />
                    </button>
                </div>
            ))}

            <style>{`
                @keyframes toastSlideIn {
                    from { transform: translateX(120%) scale(0.8); opacity: 0; }
                    to { transform: translateX(0) scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default GlobalNotifications;
