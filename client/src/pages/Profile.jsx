import { useContext, useState, useEffect, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import API_BASE_URL from "../config/api";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { FaUser, FaEnvelope, FaWallet, FaCalendarAlt, FaChartBar, FaFilter, FaClock, FaMedal, FaTrophy, FaStar, FaGift } from 'react-icons/fa';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass" style={{
                padding: '10px 15px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                background: 'rgba(18, 18, 26, 0.95)'
            }}>
                <p style={{ color: '#fff', fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
                <p style={{ color: 'var(--accent-color)', margin: 0 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Dépenses: </span>
                    ${payload[0].value.toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

const Profile = () => {
    const { user, dispatch } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rankSettings, setRankSettings] = useState([]);
    const [timeFilter, setTimeFilter] = useState('month'); // 'month', 'day', 'hour'
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1000);
            setIsSmallMobile(window.innerWidth <= 480);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?._id) return;
            try {
                // Check rewards first
                await axios.post(`${API_BASE_URL}/api/users/check-rank-rewards`, { userId: user._id });
                // Then fetch updated user data
                const res = await axios.get(`${API_BASE_URL}/api/users/${user._id}`);
                dispatch({ type: "UPDATE_USER", payload: res.data });
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        };

        const fetchOrders = async () => {
            if (!user?._id) return;
            try {
                const res = await axios.get(`${API_BASE_URL}/api/orders/user/${user._id}`);
                if (Array.isArray(res.data)) {
                    setOrders(res.data);
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/settings`);
                setRankSettings(res.data.ranks || []);
            } catch (err) {
                console.error("Error fetching rank settings:", err);
            }
        };

        fetchUserData();
        fetchOrders();
        fetchSettings();
    }, [user?._id, dispatch]);

    const currentRank = useMemo(() => {
        if (!rankSettings || rankSettings.length === 0) return null;

        const count = user?.purchaseCount || 0;
        // Sort ranks by minPurchases descending to find the highest applicable rank
        const sortedRanks = [...rankSettings].sort((a, b) => b.minPurchases - a.minPurchases);
        const rank = sortedRanks.find(r => count >= r.minPurchases);

        console.log("Rank Debug:", { count, rankSettings, rank });
        return rank || rankSettings[0];
    }, [rankSettings, user?.purchaseCount]);

    const nextRank = useMemo(() => {
        if (!rankSettings || !rankSettings.length || !currentRank) return null;
        const count = user?.purchaseCount || 0;
        const sortedRanks = [...rankSettings].sort((a, b) => a.minPurchases - b.minPurchases);
        return sortedRanks.find(r => r.minPurchases > count);
    }, [rankSettings, currentRank, user?.purchaseCount]);

    const rankIcon = (iconName) => {
        switch (iconName) {
            case 'FaTrophy': return <FaTrophy />;
            case 'FaStar': return <FaStar />;
            case 'FaMedal': return <FaMedal />;
            default: return <FaMedal />;
        }
    };

    // Aggregate Data Logic
    const chartData = useMemo(() => {
        if (!orders.length) return [];

        const groupedData = {};

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            let key;
            let sortKey; // detailed key for sorting functionality if needed

            if (timeFilter === 'month') {
                // Format: "Jan", "Feb"
                key = date.toLocaleDateString('fr-FR', { month: 'short' });
                // We might want to sort properly, but for simple aggregation:
                // Let's use numeric month 0-11 for sorting
            } else if (timeFilter === 'day') {
                // Format: "Lun", "Mar" or specific date "22/01"
                key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            } else if (timeFilter === 'hour') {
                // Format: "13:00", "14:00"
                const hour = date.getHours();
                key = `${hour.toString().padStart(2, '0')}:00`;
            }

            if (!groupedData[key]) {
                groupedData[key] = 0;
            }
            groupedData[key] += order.price;
        });

        // Convert to array and sort (basic sorting suitable for typical usage)
        // Note: Better sorting might be needed for "months" to ensure order Jan->Dec
        // For now, let's keep it simple or implement custom sorting if needed.

        let processedData = Object.keys(groupedData).map(key => ({
            name: key,
            amount: groupedData[key]
        }));

        // Basic sort if needed (e.g. for hours)
        if (timeFilter === 'hour') {
            processedData.sort((a, b) => parseInt(a.name) - parseInt(b.name));
        }

        return processedData;

    }, [orders, timeFilter]);

    const Skeleton = ({ height, width, style, borderRadius = '20px' }) => (
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
                    {/* Title Skeleton */}
                    <div style={{ marginBottom: '40px', display: 'flex', gap: '10px' }}>
                        <Skeleton width="150px" height="40px" />
                        <Skeleton width="100px" height="40px" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '30px' }}>

                        {/* User Card Skeleton */}
                        <div className="glass" style={{ padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '25px', height: '600px' }}>
                            {/* Avatar */}
                            <div style={{ margin: '0 auto' }}>
                                <Skeleton width="100px" height="100px" borderRadius="50%" />
                            </div>

                            {/* Name & Email */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <Skeleton width="180px" height="30px" />
                                <Skeleton width="120px" height="20px" borderRadius="10px" />
                            </div>

                            {/* Balance */}
                            <Skeleton height="100px" width="100%" />

                            {/* Rank */}
                            <Skeleton height="200px" width="100%" style={{ marginTop: 'auto' }} />
                        </div>

                        {/* Chart Card Skeleton */}
                        <div className="glass" style={{ padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '30px', height: '500px' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Skeleton width="200px" height="30px" />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Skeleton width="60px" height="30px" borderRadius="8px" />
                                    <Skeleton width="60px" height="30px" borderRadius="8px" />
                                    <Skeleton width="60px" height="30px" borderRadius="8px" />
                                </div>
                            </div>

                            {/* Chart Area */}
                            <Skeleton height="100%" width="100%" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const COLORS = ['#ff9f43', '#00d2d3', '#5f27cd', '#ff6b6b', '#2e86de'];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '60px 0' }}>
            <div className="container">
                <h1 className="section-title" style={{ marginBottom: '40px' }}>
                    Mon <span style={{ color: 'var(--accent-color)' }}>Profil</span>
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '30px' }}>

                    {/* User Info Card */}
                    <div className="glass" style={{ padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-color) 0%, #ff6b6b 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            boxShadow: '0 10px 30px rgba(255, 71, 87, 0.3)'
                        }}>
                            <FaUser size={40} color="#fff" />
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ color: '#fff', fontWeight: '900', fontSize: isSmallMobile ? '1.5rem' : '1.8rem', marginBottom: '5px' }}>{user?.username || 'Utilisateur'}</h2>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '20px' }}>
                                <FaEnvelope size={12} style={{ color: 'var(--text-muted)' }} />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</span>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Solde Actuel</span>
                                    <FaWallet style={{ color: 'var(--accent-color)' }} />
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
                                    ${Number(user?.balance || 0).toFixed(2)}
                                </div>
                            </div>
                            <div style={{ paddingLeft: '15px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                                <div className="flex justify-between items-center mb-1">
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Solde Demo</span>
                                    <FaGift style={{ color: 'var(--warning)' }} />
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff' }}>
                                    {user?.demoBalance || 0}
                                </div>
                            </div>
                        </div>

                        {/* Improved Rank System (Gamified Design) */}
                        {rankSettings.length === 0 ? (
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                Chargement des informations de progression...
                            </div>
                        ) : currentRank ? (
                            <div style={{
                                background: 'rgba(18, 18, 30, 0.6)',
                                padding: '25px',
                                borderRadius: '24px',
                                border: `1px solid ${currentRank.color}22`,
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px'
                            }}>
                                {/* Background Glow Effect */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-50px',
                                    right: '-50px',
                                    width: '150px',
                                    height: '150px',
                                    background: currentRank.color,
                                    filter: 'blur(80px)',
                                    opacity: 0.15,
                                    zIndex: 0
                                }}></div>

                                <div style={{ zIndex: 1 }}>
                                    <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '5px' }}>
                                        Votre niveau actuel est
                                    </h4>
                                    <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {currentRank.name} <span style={{ color: currentRank.color, fontSize: '1rem' }}>✦</span>
                                    </h3>
                                </div>

                                {nextRank ? (
                                    <div style={{ zIndex: 1 }}>
                                        <div style={{
                                            height: '35px',
                                            background: 'rgba(0,0,0,0.3)',
                                            borderRadius: '12px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            marginBottom: '10px'
                                        }}>
                                            <div style={{
                                                width: `${Math.min(100, ((user?.purchaseCount || 0) / nextRank.minPurchases) * 100)}%`,
                                                height: '100%',
                                                background: `linear-gradient(90deg, ${currentRank.color} 0%, ${nextRank.color} 100%)`,
                                                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: `0 0 15px ${currentRank.color}44`
                                            }}></div>
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: '800',
                                                color: '#fff',
                                                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                            }}>
                                                {Math.round(((user?.purchaseCount || 0) / nextRank.minPurchases) * 100)}% vers le rang {nextRank.name}
                                            </div>
                                        </div>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '600', textAlign: 'center' }}>
                                            Dépensez {nextRank.minPurchases - (user?.purchaseCount || 0)} achats de plus pour passer au niveau supérieur.
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(46, 213, 115, 0.1)', color: 'var(--success)', textAlign: 'center', fontWeight: '800', fontSize: '0.8rem', zIndex: 1 }}>
                                        ★ NIVEAU MAXIMUM ATTEINT ★
                                    </div>
                                )}

                                {/* Large Medal Icon Visual */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    marginTop: '10px',
                                    filter: `drop-shadow(0 0 20px ${currentRank.color}44)`,
                                    animation: 'float 3s ease-in-out infinite',
                                    zIndex: 1
                                }}>
                                    <div style={{
                                        fontSize: '5rem',
                                        color: currentRank.color,
                                        background: `linear-gradient(135deg, ${currentRank.color}ff 0%, #ffffff 50%, ${currentRank.color}ff 100%)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        filter: 'brightness(1.2)'
                                    }}>
                                        {rankIcon(currentRank.icon)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--error)', fontSize: '0.8rem', textAlign: 'center' }}>Erreur de configuration.</div>
                        )}
                    </div>

                    <style>{`
                        @keyframes float {
                            0% { transform: translateY(0px); }
                            50% { transform: translateY(-10px); }
                            100% { transform: translateY(0px); }
                        }
                    `}</style>

                    {/* Stats Chart Section */}
                    <div className="glass" style={{
                        padding: isSmallMobile ? '12px' : '30px',
                        borderRadius: '30px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div className="flex justify-between items-center mb-8" style={{ flexDirection: isSmallMobile ? 'column' : 'row', gap: isSmallMobile ? '15px' : '0', alignItems: isSmallMobile ? 'flex-start' : 'center' }}>
                            <h3 style={{ color: '#fff', fontSize: isSmallMobile ? '1.2rem' : '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaChartBar style={{ color: 'var(--accent-color)' }} />
                                Statistiques d'Achats
                            </h3>

                            {/* Filter Tabs */}
                            <div className="flex bg-black/20 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' }}>
                                {[
                                    { key: 'month', label: 'Mois' },
                                    { key: 'day', label: 'Jour' },
                                    { key: 'hour', label: 'Heure' }
                                ].map(filter => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setTimeFilter(filter.key)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: timeFilter === filter.key ? 'var(--accent-color)' : 'transparent',
                                            color: timeFilter === filter.key ? '#000' : 'var(--text-muted)',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ height: '350px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: isSmallMobile ? 5 : 30, left: isSmallMobile ? 0 : 20, bottom: 5 }}
                                >
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="var(--text-muted)"
                                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="var(--text-muted)"
                                        tick={{ fill: 'var(--text-muted)', fontSize: isSmallMobile ? 10 : 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                        width={isSmallMobile ? 40 : 60}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar
                                        dataKey="amount"
                                        fill="url(#colorAmount)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                        animationDuration={1500}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--accent-color)' : '#2e86de'} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            {chartData.length === 0 && (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    color: 'var(--text-muted)'
                                }}>
                                    <FaCalendarAlt size={30} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                    <p>Aucune donnée pour cette période</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
