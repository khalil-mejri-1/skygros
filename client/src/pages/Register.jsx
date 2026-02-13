import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import bg from "../assets/bg.mp4";
import API_BASE_URL from "../config/api";
import SEO from "../components/SEO";

const Register = () => {

    const [credentials, setCredentials] = useState({ username: "", email: "" });
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleChange = (e) => {
        setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleClick = async (e) => {
        e.preventDefault();
        setError(false);
        setErrorMessage("");
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/register`, credentials);
            if (res.status === 200) {
                navigate("/login");
            }
        } catch (err) {
            setError(true);
            const msg = err.response?.data?.message || err.response?.data || "Une erreur est survenue !";
            setErrorMessage(msg);
            console.error("Registration Error:", msg);
        }
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: isMobile ? 'flex-start' : 'center',
            paddingTop: isMobile ? '60px' : '0'
        }}>
            <SEO title="Inscription | Skygros" description="Créez votre compte Skygros dès aujourd'hui." />

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

            {/* Register Card */}
            <div style={{
                background: 'rgba(26, 27, 50, 0.85)',
                backdropFilter: 'blur(10px)',
                padding: isMobile ? '30px 20px' : '40px',
                borderRadius: '24px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                width: '92%',
                maxWidth: '420px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                margin: '20px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                    skygros<span style={{ color: 'var(--accent-color)' }}>.</span>
                </h2>

                <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#c3c5d5', fontSize: '1rem', fontWeight: 'normal' }}>
                    Créer un nouveau compte
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
                        type="email"
                        placeholder="Email"
                        id="email"
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

                    <button
                        onClick={handleClick}
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
                        S'INSCRIRE
                    </button>
                    {error && <span style={{ color: 'var(--danger)', textAlign: 'center', marginTop: '10px', fontSize: '0.8rem' }}>{errorMessage}</span>}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Déjà un compte ? <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Se connecter</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
