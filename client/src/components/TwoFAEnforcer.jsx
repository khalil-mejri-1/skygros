import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaShieldAlt, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const TwoFAEnforcer = () => {
    const { user, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Paths that are EXCLUDED from enforcement
    const excludedPaths = ["/login", "/register", "/2fa-setup", "/2fa-verify"];

    // If user is not logged in, or already has 2FA enabled, don't do anything
    if (!user || user.is2FAEnabled) return null;

    // If user is currently on an excluded path, don't show the modal (to allow them to set it up)
    if (excludedPaths.includes(location.pathname)) return null;

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        navigate("/login");
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 6, 12, 0.98)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(20px)',
            padding: '20px'
        }}>
            <div className="glass enforcer-card" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '50px',
                borderRadius: '35px',
                border: '1px solid rgba(255, 153, 0, 0.2)',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                animation: 'pulseGlow 3s infinite alternate'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '24px',
                    background: 'rgba(255, 153, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-color)',
                    margin: '0 auto 30px',
                    position: 'relative'
                }}>
                    <FaShieldAlt size={40} />
                    <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#ff4757',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid #0a0b14'
                    }}>
                        <FaExclamationTriangle size={12} color="#fff" />
                    </div>
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '15px' }}>
                    Sécurité Requise
                </h2>

                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', marginBottom: '35px', fontWeight: '500' }}>
                    Cher <span style={{ color: '#fff', fontWeight: '800' }}>{user.username}</span>, pour garantir la sécurité de vos achats et de votre solde, l'activation de la
                    <span style={{ color: 'var(--accent-color)', fontWeight: '800' }}> Double Authentification (2FA)</span> est désormais obligatoire pour accéder à skygros.
                </p>

                <div className="glass" style={{
                    padding: '20px',
                    borderRadius: '20px',
                    background: 'rgba(255, 153, 0, 0.03)',
                    border: '1px solid rgba(255, 153, 0, 0.1)',
                    marginBottom: '35px',
                    textAlign: 'left'
                }}>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>
                        🛡️ Cette mesure protège votre compte contre les accès non autorisés.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/2fa-setup")}
                    className="btn btn-primary enforcer-btn"
                    style={{
                        width: '100%',
                        padding: '18px',
                        borderRadius: '16px',
                        fontWeight: '900',
                        fontSize: '1rem',
                        letterSpacing: '0.5px',
                        whiteSpace: 'normal',
                        lineHeight: '1.2'
                    }}
                >
                    ACTIVER MON 2FA MAINTENANT
                </button>

                <button
                    onClick={handleLogout}
                    style={{
                        marginTop: '25px',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    SE DÉCONNECTER ET REVENIR PLUS TARD
                </button>

                <style>{`
                    @keyframes pulseGlow {
                        from { box-shadow: 0 0 20px rgba(0,0,0,0.5), 0 0 0 rgba(255, 153, 0, 0); }
                        to { box-shadow: 0 0 40px rgba(0,0,0,0.7), 0 0 20px rgba(255, 153, 0, 0.1); }
                    }
                    @media (max-width: 480px) {
                        .enforcer-card {
                            padding: 30px 20px !important;
                        }
                        .enforcer-btn {
                            font-size: 0.85rem !important;
                            padding: 15px 10px !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default TwoFAEnforcer;
