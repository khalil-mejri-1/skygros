import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import { HiLightningBolt } from "react-icons/hi";

const StatsCards = ({ statsCards = [] }) => {
    const { user } = useContext(AuthContext);
    const [isSmall, setIsSmall] = useState(typeof window !== 'undefined' ? window.innerWidth <= 660 : false);

    useEffect(() => {
        const handleResize = () => {
            setIsSmall(window.innerWidth <= 660);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Dynamic Icon Helpers
    const getIcon = (iconName) => {
        if (!iconName) return <FaIcons.FaShoppingCart />;
        if (FaIcons[iconName]) {
            const Icon = FaIcons[iconName];
            return <Icon />;
        }
        if (MdIcons[iconName]) {
            const Icon = MdIcons[iconName];
            return <Icon />;
        }
        return <FaIcons.FaShoppingCart />;
    };

    // Balance Card (Always present if user is logged in, or configured?)
    // Custom cards from DB
    const displayCards = statsCards.map((c, idx) => ({
        id: c._id || `custom-${idx}`,
        title: c.title,
        value: c.value,
        icon: getIcon(c.icon),
        accent: c.accent || "#0099ff",
        label: c.label
    }));

    // Add Balance Card
    if (user) {
        displayCards.push({
            id: 'balance-card',
            title: "Solde",
            value: `${(user.balance || 0).toFixed(2)}`,
            icon: <FaIcons.FaWallet />,
            accent: "#ff9900",
            label: "USD DISPONIBLE"
        });
    }

    return (
        <section className="container" style={{
            marginTop: isSmall ? '10px' : '-40px',
            position: 'relative',
            zIndex: 100
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: isSmall ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: isSmall ? '12px' : '20px'
            }}>
                {displayCards.map(card => (
                    <div key={card.id} className="glass hover-lift" style={{
                        borderRadius: isSmall ? '16px' : '20px',
                        padding: isSmall ? '16px' : '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isSmall ? '12px' : '20px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {/* Background subtle glow */}
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '100px',
                            height: '100px',
                            background: `${card.accent}10`,
                            filter: 'blur(40px)',
                            borderRadius: '50%',
                            zIndex: 0
                        }}></div>

                        <div className="flex justify-between items-center" style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: isSmall ? '32px' : '42px',
                                height: isSmall ? '32px' : '42px',
                                borderRadius: isSmall ? '8px' : '12px',
                                background: `${card.accent}15`,
                                border: `1px solid ${card.accent}30`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: card.accent,
                                fontSize: isSmall ? '1rem' : '1.2rem'
                            }}>
                                {card.icon}
                            </div>
                            <div style={{
                                fontSize: isSmall ? '0.55rem' : '0.65rem',
                                fontWeight: '900',
                                color: card.accent,
                                background: `${card.accent}10`,
                                padding: isSmall ? '2px 8px' : '4px 10px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                border: `1px solid ${card.accent}20`
                            }}>
                                {card.label}
                            </div>
                        </div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h4 style={{
                                fontSize: isSmall ? '0.6rem' : '0.75rem',
                                fontWeight: '700',
                                color: 'var(--text-muted)',
                                marginBottom: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {card.title}
                            </h4>
                            <div style={{
                                fontSize: isSmall ? '1.4rem' : '2.2rem',
                                fontWeight: '900',
                                color: '#fff',
                                fontFamily: 'var(--font-main)',
                                letterSpacing: isSmall ? '-0.5px' : '-1.5px',
                                lineHeight: '1'
                            }}>
                                {card.id === 4 && <span style={{ fontSize: isSmall ? '0.9rem' : '1.2rem', verticalAlign: 'middle', marginRight: '4px', opacity: 0.7 }}>$</span>}
                                {card.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StatsCards;
