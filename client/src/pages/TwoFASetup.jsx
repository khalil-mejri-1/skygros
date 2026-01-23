import { useState, useEffect, useContext } from "react";

import API_BASE_URL from "../config/api";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaShieldAlt, FaKey, FaQrcode, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TwoFASetup = () => {
    const { user, dispatch } = useContext(AuthContext);
    const [qrCode, setQrCode] = useState("");
    const [secret, setSecret] = useState("");
    const [token, setToken] = useState("");
    const [step, setStep] = useState(1); // 1: Info, 2: scan, 3: verify
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [disableToken, setDisableToken] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);


    const startSetup = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/users/2fa/setup`, {
                userId: user._id
            });
            setQrCode(res.data.qrCode);
            setSecret(res.data.secret);
            setStep(2);
        } catch (err) {
            setError("Erreur lors de l'initialisation du 2FA.");
        } finally {
            setLoading(false);
        }
    };

    const confirmSetup = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(`${API_BASE_URL}/api/users/2fa/confirm`, {
                userId: user._id,
                token
            });
            // Update user in context
            dispatch({ type: "LOGIN_SUCCESS", payload: { ...user, is2FAEnabled: true } });
            setStep(4); // Success
        } catch (err) {
            setError("Code invalide. Vérifiez votre application.");
        } finally {
            setLoading(false);
        }
    };

    const disable2FA = () => {
        setShowDisableModal(true);
        setError("");
    };

    const handleDisableConfirm = async () => {
        if (!disableToken) return;
        setLoading(true);
        setError("");
        try {
            await axios.post(`${API_BASE_URL}/api/users/2fa/disable`, {
                userId: user._id,
                token: disableToken
            });
            dispatch({ type: "LOGIN_SUCCESS", payload: { ...user, is2FAEnabled: false } });
            setShowDisableModal(false);
            setDisableToken("");
            navigate("/");
        } catch (err) {
            setError("Code invalide. Désactivation échouée.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            padding: '120px 20px 60px',
            background: '#0a0b14',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '600px',
                padding: '50px',
                borderRadius: '32px',
                border: '1px solid rgba(255,153,0,0.1)',
                height: 'fit-content'
            }}>
                <div className="flex items-center gap-4 mb-10">
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '18px',
                        background: 'rgba(255, 153, 0, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--accent-color)'
                    }}>
                        <FaShieldAlt size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>Sécurité Compte</h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Double Authentification (2FA)</p>
                    </div>
                </div>

                {user?.is2FAEnabled ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            padding: '30px', background: 'rgba(46, 213, 115, 0.05)',
                            borderRadius: '24px', border: '1px solid rgba(46, 213, 115, 0.2)',
                            marginBottom: '30px'
                        }}>
                            <FaCheckCircle size={50} color="var(--success)" style={{ marginBottom: '15px' }} />
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>2FA Activé</h3>
                            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '10px' }}>
                                Votre compte est protégé par la double authentification.
                            </p>
                        </div>
                        <button
                            onClick={disable2FA}
                            className="btn"
                            style={{ background: 'rgba(255, 71, 87, 0.1)', color: '#ff4757', border: '1px solid rgba(255, 71, 87, 0.2)', borderRadius: '14px', width: '100%', padding: '16px', fontWeight: '800' }}
                        >
                            DÉSACTIVER LE 2FA
                        </button>
                    </div>
                ) : (
                    <>
                        {step === 1 && (
                            <div>
                                <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '30px' }}>
                                    L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
                                    En plus de votre mot de passe, vous devrez fournir un code généré par une application comme
                                    <strong> Google Authenticator</strong> ou <strong>Authy</strong>.
                                </p>
                                <button onClick={startSetup} disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '18px', borderRadius: '16px', fontWeight: '900' }}>
                                    {loading ? "INITIALISATION..." : "CONFIGURER LE 2FA MAINTENANT"}
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <FaQrcode /> Scannez le QR Code
                                </h3>
                                <div style={{
                                    background: '#fff', padding: '15px', borderRadius: '20px',
                                    display: 'inline-block', marginBottom: '25px',
                                    boxShadow: '0 0 40px rgba(255,255,255,0.1)'
                                }}>
                                    <img src={qrCode} alt="QR Code 2FA" style={{ width: '220px', height: '220px' }} />
                                </div>
                                <div className="glass" style={{ padding: '20px', borderRadius: '16px', marginBottom: '30px', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', fontWeight: '800' }}>OU ENTREZ LE CODE MANUELLEMENT :</p>
                                    <p style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--accent-color)', fontWeight: '900', letterSpacing: '2px' }}>{secret}</p>
                                </div>
                                <button onClick={() => setStep(3)} className="btn btn-primary" style={{ width: '100%', padding: '18px', borderRadius: '16px', fontWeight: '900' }}>
                                    CONTINUER VERS LA VÉRIFICATION
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '25px', textAlign: 'center' }}>
                                    Vérifiez la configuration
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: '30px' }}>
                                    Entrez le code de 6 chiffres affiché sur votre application mobile pour confirmer.
                                </p>
                                <input
                                    type="text"
                                    placeholder="000 000"
                                    style={{
                                        width: '100%', background: 'rgba(255,255,255,0.05)',
                                        border: '2px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                                        padding: '18px', color: '#fff', fontSize: '1.5rem', fontWeight: '900',
                                        textAlign: 'center', letterSpacing: '8px', marginBottom: '20px', outline: 'none'
                                    }}
                                    value={token}
                                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                    maxLength="6"
                                />
                                {error && <p style={{ color: '#ff4757', textAlign: 'center', fontWeight: '700', marginBottom: '15px' }}>{error}</p>}
                                <button onClick={confirmSetup} disabled={loading || token.length < 6} className="btn btn-primary" style={{ width: '100%', padding: '18px', borderRadius: '16px', fontWeight: '900' }}>
                                    {loading ? "VÉRIFICATION..." : "ACTIVER LE 2FA"}
                                </button>
                                <button onClick={() => setStep(2)} style={{ width: '100%', marginTop: '15px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>
                                    RETOUR AU QR CODE
                                </button>
                            </div>
                        )}

                        {step === 4 && (
                            <div style={{ textAlign: 'center' }}>
                                <FaCheckCircle size={60} color="var(--success)" style={{ marginBottom: '20px' }} />
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '15px' }}>Félicitations !</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '35px' }}>
                                    Votre compte est désormais sécurisé avec la double authentification.
                                    Vous devrez utiliser votre téléphone à chaque connexion.
                                </p>
                                <button onClick={() => navigate("/")} className="btn btn-primary" style={{ width: '100%', padding: '18px', borderRadius: '16px', fontWeight: '900' }}>
                                    RETOUR À L'ACCUEIL
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Custom Disable Modal */}
            {showDisableModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(5,6,12,0.95)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(15px)'
                }}>
                    <div className="glass" style={{
                        width: '95%', maxWidth: '450px', padding: '40px', borderRadius: '32px',
                        border: '1px solid rgba(255,153,0,0.1)', textAlign: 'center'
                    }}>
                        <div style={{
                            width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255, 71, 87, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4757',
                            margin: '0 auto 20px'
                        }}>
                            <FaExclamationTriangle size={30} />
                        </div>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '10px' }}>Désactiver le 2FA ?</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600', marginBottom: '30px', fontSize: '0.9rem' }}>
                            Pour confirmer la désactivation, veuillez entrer le code de 6 chiffres actuel.
                        </p>

                        <input
                            type="text"
                            placeholder="000 000"
                            maxLength="6"
                            autoFocus
                            style={{
                                width: '100%', background: 'rgba(255,255,255,0.05)',
                                border: '2px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                                padding: '15px', color: '#fff', fontSize: '1.4rem', fontWeight: '900',
                                textAlign: 'center', letterSpacing: '4px', marginBottom: '15px', outline: 'none'
                            }}
                            value={disableToken}
                            onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, ''))}
                        />

                        {error && <p style={{ color: '#ff4757', fontWeight: '700', marginBottom: '20px', fontSize: '0.85rem' }}>{error}</p>}

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={handleDisableConfirm}
                                disabled={loading || disableToken.length < 6}
                                className="btn"
                                style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#ff4757', color: '#fff', fontWeight: '800', opacity: (loading || disableToken.length < 6) ? 0.6 : 1 }}
                            >
                                {loading ? "CHARGEMENT..." : "CONFIRMER"}
                            </button>
                            <button
                                onClick={() => { setShowDisableModal(false); setDisableToken(""); setError(""); }}
                                className="btn"
                                style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: '800' }}
                            >
                                ANNULER
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TwoFASetup;
