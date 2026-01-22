import { useContext, useState, useEffect, useRef } from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import bg from "../assets/bg.mp4";
const Login = () => {
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [captchaToken, setCaptchaToken] = useState(null);
    const [showCaptchaError, setShowCaptchaError] = useState(false);
    const { dispatch, isFetching, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleClick = async (e) => {
        e.preventDefault();

        if (!captchaToken) {
            setShowCaptchaError(true);
            setTimeout(() => setShowCaptchaError(false), 5000);
            return;
        }

        dispatch({ type: "LOGIN_START" });
        try {
            const res = await axios.post("/api/auth/login", { ...credentials, captchaToken });

            // Handle 2FA requirement
            if (res.data.twoFARequired) {
                dispatch({ type: "LOGIN_FAILURE" }); // Prevent immediate login
                navigate("/2fa-verify", {
                    state: {
                        userId: res.data.userId,
                        isAdmin: res.data.isAdmin
                    }
                });
                return;
            }

            dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
            navigate("/");
        } catch (err) {
            dispatch({ type: "LOGIN_FAILURE" });
        }
    };

    const turnstileRef = useRef(null);

    useEffect(() => {
        // Ensure the Turnstile script is loaded and render the widget explicitly
        const renderTurnstile = () => {
            if (window.turnstile && turnstileRef.current) {
                // Clear any existing widget in this container to prevent duplicates or errors
                turnstileRef.current.innerHTML = '';

                window.turnstile.render(turnstileRef.current, {
                    sitekey: '0x4AAAAAACN949fckJNumjpg',
                    callback: (token) => {
                        setCaptchaToken(token);
                    },
                });
            }
        };

        // If turnstile is already defined, render immediately.
        // Otherwise, we might need to wait for the script (though it's in index.html with defer)
        // A simple timeout or interval can check, or we can rely on the script loading order if we weren't in an SPA.
        // Since we are in an SPA, the script might have loaded before this component mounted.

        if (window.turnstile) {
            renderTurnstile();
        } else {
            // Fallback: Simplistic check (in production often better to use a react-turnstile library or script loader)
            const interval = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(interval);
                    renderTurnstile();
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

            {/* Custom Error Notification */}
            {showCaptchaError && (
                <div className="glass" style={{
                    position: 'absolute',
                    top: '30px',
                    right: '30px',
                    width: '380px',
                    zIndex: 1000,
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 71, 87, 0.3)',
                    background: 'rgba(20, 20, 35, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    animation: 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(255, 71, 87, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ff4757',
                        flexShrink: 0
                    }}>
                        <FaExclamationTriangle size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: '700' }}>Action Requise</h4>
                        <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                            Veuillez valider la vérification de sécurité (Captcha).
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCaptchaError(false)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            display: 'flex',
                            padding: '4px'
                        }}
                    >
                        <FaTimes />
                    </button>
                    <style>{`
                        @keyframes slideIn {
                            from { transform: translateX(100px); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: -1,
                    filter: 'brightness(0.6)'
                }}
            >
                <source src={bg} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Login Card */}
            <div style={{
                background: 'rgba(26, 27, 50, 0.85)',
                backdropFilter: 'blur(10px)',
                padding: '40px',
                borderRadius: '15px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                    skygros<span style={{ color: 'var(--accent-color)' }}>.</span>
                </h2>

                <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#c3c5d5', fontSize: '1rem', fontWeight: 'normal' }}>
                    Connectez-vous à votre compte
                </h3>

                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        id="username"
                        onChange={handleChange}
                        style={{
                            padding: '12px 15px',
                            borderRadius: '8px',
                            border: '1px solid #242542',
                            background: '#121326',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        id="password"
                        onChange={handleChange}
                        style={{
                            padding: '12px 15px',
                            borderRadius: '8px',
                            border: '1px solid #242542',
                            background: '#121326',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                    />


                    {/* Cloudflare Turnstile Widget */}
                    <div className="flex justify-center my-2" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', marginBottom: '10px' }}>
                        <div ref={turnstileRef}></div>
                    </div>

                    <button
                        onClick={handleClick}
                        disabled={isFetching}
                        className="btn btn-primary"
                        style={{
                            marginTop: '10px',
                            width: '100%',
                            padding: '12px',
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        {isFetching ? "Chargement..." : "SE CONNECTER"}
                    </button>
                    {error && <span style={{ color: 'var(--danger)', textAlign: 'center', marginTop: '10px' }}>Identifiants invalides !</span>}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Vous n'avez pas de compte ? <Link to="/register" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>S'inscrire</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
