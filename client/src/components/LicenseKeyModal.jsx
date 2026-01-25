import { FaTimes, FaKey, FaCopy, FaCheckCircle, FaClock, FaBoxOpen } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import ReactDOM from "react-dom";

const LicenseKeyModal = ({ isOpen, onClose, productTitle, licenseKey }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const isPending = licenseKey === "PENDING";

    const handleCopy = () => {
        if (isPending) return;
        navigator.clipboard.writeText(licenseKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const modalContent = (
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(10, 11, 20, 0.95)',
                zIndex: 999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
            }}
        >
            <div className="glass" style={{
                width: '90%',
                maxWidth: '500px',
                padding: '50px 40px',
                borderRadius: '30px',
                border: isPending ? '1px solid rgba(255, 153, 0, 0.2)' : '1px solid rgba(46, 213, 115, 0.2)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                position: 'relative',
                textAlign: 'center',
                animation: 'modalAppear 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <FaTimes
                    onClick={onClose}
                    style={{ position: 'absolute', top: '25px', right: '25px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '1.2rem', transition: '0.3s' }}
                    className="hover:text-white"
                />

                <div style={{
                    width: '85px',
                    height: '85px',
                    background: isPending ? 'rgba(255, 153, 0, 0.1)' : 'rgba(46, 213, 115, 0.1)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 30px',
                    color: isPending ? 'var(--accent-color)' : 'var(--success)',
                    transform: 'rotate(-5deg)'
                }}>
                    {isPending ? <FaClock size={40} /> : <FaKey size={40} />}
                </div>

                <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: '900', marginBottom: '15px', letterSpacing: '-0.5px' }}>
                    {isPending ? "Commande Reçue !" : "Achat Réussi !"}
                </h2>

                <p style={{ color: 'var(--text-muted)', marginBottom: '35px', lineHeight: '1.6', fontSize: '1.05rem' }}>
                    {isPending ? (
                        <>
                            Votre demande pour <strong style={{ color: '#fff' }}>{productTitle}</strong> a bien été enregistrée. <br />
                            Nous vous enverrons votre code dès que possible.
                        </>
                    ) : (
                        <>
                            Voici votre code de licence pour <br />
                            <strong style={{ color: 'var(--accent-color)' }}>{productTitle}</strong>
                        </>
                    )}
                </p>

                <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '30px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    marginBottom: '10px'
                }}>
                    <div style={{
                        fontFamily: isPending ? 'inherit' : "'JetBrains Mono', monospace",
                        color: isPending ? 'rgba(255,255,255,0.15)' : '#fff',
                        fontSize: isPending ? '1.1rem' : '1.6rem',
                        fontWeight: 'bold',
                        letterSpacing: isPending ? '0' : '3px',
                        fontStyle: isPending ? 'italic' : 'normal'
                    }}>
                        {isPending ? "Traitement en cours..." : licenseKey}
                    </div>

                    {!isPending && (
                        <button
                            onClick={handleCopy}
                            style={{
                                background: copied ? 'var(--success)' : 'var(--accent-color)',
                                border: 'none',
                                color: '#000',
                                padding: '16px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontWeight: '900',
                                fontSize: '1rem',
                                transition: 'all 0.3s',
                            }}
                        >
                            {copied ? <><FaCheckCircle size={18} /> COPIÉ !</> : <><FaCopy size={18} /> COPIER LE CODE</>}
                        </button>
                    )}
                </div>

                <div style={{ marginTop: '25px', fontSize: '0.9rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px' }}>
                    💡 Conseil : {isPending ? "Vérifiez votre page" : "Consultable dans votre"} <Link to="/historique" onClick={onClose} style={{ color: 'var(--accent-color)', fontWeight: 'bold', textDecoration: 'none' }}>Historique</Link> {isPending ? "à tout moment." : "."}
                </div>

                <style>{`
                    @keyframes modalAppear {
                        from { opacity: 0; transform: scale(0.9) translateY(40px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                `}</style>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default LicenseKeyModal;
