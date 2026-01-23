import { useState, useContext } from "react";

import API_BASE_URL from "../config/api";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";

const TwoFAVerify = () => {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Get userId and isAdmin from location state passed from Login page
    const { userId, isAdmin } = location.state || {};

    if (!userId) {
        navigate("/login");
        return null;
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/2fa/verify`, {
                userId,
                token
            });

            // Success! Token is valid, we get same response as login
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
            navigate("/");

        } catch (err) {
            setError(err.response?.data || "Code invalide. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f101a 0%, #05060c 100%)',
            padding: '20px'
        }}>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                borderRadius: '32px',
                textAlign: 'center',
                border: '1px solid rgba(255,153,0,0.1)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'rgba(255, 153, 0, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent-color)', margin: '0 auto 24px',
                    boxShadow: '0 0 30px rgba(255, 153, 0, 0.1)'
                }}>
                    <FaShieldAlt size={35} />
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '10px' }}>Verification 2FA</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '32px', lineHeight: '1.6' }}>
                    Entrez le code de 6 chiffres généré par votre application Authenticator.
                </p>

                <form onSubmit={handleVerify}>
                    <input
                        type="text"
                        placeholder="000 000"
                        maxLength="6"
                        autoFocus
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '2px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '18px',
                            color: '#fff',
                            fontSize: '1.5rem',
                            fontWeight: '900',
                            textAlign: 'center',
                            letterSpacing: '8px',
                            marginBottom: '20px',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                        className="verify-input"
                        value={token}
                        onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                        required
                    />

                    {error && (
                        <div style={{
                            background: 'rgba(255, 71, 87, 0.1)',
                            color: '#ff4757',
                            padding: '12px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            marginBottom: '20px'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || token.length < 6}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '18px',
                            borderRadius: '16px',
                            fontWeight: '900',
                            fontSize: '1rem',
                            background: 'linear-gradient(135deg, var(--accent-color) 0%, #ff5722 100%)',
                            boxShadow: '0 10px 25px rgba(255, 153, 0, 0.3)',
                            opacity: (loading || token.length < 6) ? 0.6 : 1,
                            cursor: (loading || token.length < 6) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? "VERIFICATION..." : "VALIDER LE CODE"}
                    </button>
                </form>

                <button
                    onClick={() => navigate("/login")}
                    style={{
                        marginTop: '24px',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.3)',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%'
                    }}
                >
                    <FaArrowLeft size={12} /> Retour à la connexion
                </button>
            </div>

            <style>{`
                .verify-input:focus {
                    border-color: var(--accent-color) !important;
                    background: rgba(255,153,0,0.05) !important;
                    box-shadow: 0 0 20px rgba(255, 153, 0, 0.1) !important;
                }
            `}</style>
        </div>
    );
};

export default TwoFAVerify;
