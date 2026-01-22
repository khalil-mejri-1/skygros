import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaShoppingCart, FaUser, FaWallet } from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";

const StatsCards = () => {
    const { user } = useContext(AuthContext);

    const cards = [
        {
            id: 1,
            title: "Total Codes",
            value: "2,245",
            icon: <FaShoppingCart />,
            accent: "#0099ff",
            label: "ACHETÉS"
        },
        {
            id: 2,
            title: "Abos Actifs",
            value: "16",
            icon: <MdOndemandVideo />,
            accent: "#ff4757",
            label: "beIN Sports"
        },
        {
            id: 3,
            title: "Sur Demande",
            value: "51",
            icon: <FaUser />,
            accent: "#00d285",
            label: "REQUÊTES"
        },
        {
            id: 4,
            title: "Solde",
            value: user ? `${(user.balance || 0).toFixed(2)}` : "0.00",
            icon: <FaWallet />,
            accent: "#ff9900",
            label: "USD DISPONIBLE"
        }
    ];

    return (
        <section className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 100 }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px'
            }}>
                {cards.map(card => (
                    <div key={card.id} className="glass hover-lift" style={{
                        borderRadius: '20px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
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
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: `${card.accent}15`,
                                border: `1px solid ${card.accent}30`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: card.accent,
                                fontSize: '1.2rem'
                            }}>
                                {card.icon}
                            </div>
                            <div style={{
                                fontSize: '0.65rem',
                                fontWeight: '900',
                                color: card.accent,
                                background: `${card.accent}10`,
                                padding: '4px 10px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                border: `1px solid ${card.accent}20`
                            }}>
                                {card.label}
                            </div>
                        </div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h4 style={{
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: 'var(--text-muted)',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {card.title}
                            </h4>
                            <div style={{
                                fontSize: '2.2rem',
                                fontWeight: '900',
                                color: '#fff',
                                fontFamily: 'var(--font-main)',
                                letterSpacing: '-1.5px',
                                lineHeight: '1'
                            }}>
                                {card.id === 4 && <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '4px', opacity: 0.7 }}>$</span>}
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
