import { useState, useEffect } from 'react';
import { FaTimes, FaWallet, FaWhatsapp, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import { formatImageUrl } from '../config/api';
import API_BASE_URL from '../config/api';
import axios from 'axios';

const RechargeModal = ({ isOpen, onClose, settings, user }) => {
    const [amount, setAmount] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) {
            setAmount("");
            setWhatsappNumber("");
            setSelectedMethod(null);
            setSuccess(false);
            setError("");
            setLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isValid = amount && Number(amount) > 0 && selectedMethod && whatsappNumber.trim();

    const handleSendRechargeRequest = async () => {
        if (!isValid) return;
        setLoading(true);
        setError("");
        try {
            await axios.post(`${API_BASE_URL}/recharge-requests`, {
                userId: user._id,
                amount: Number(amount),
                paymentMethod: {
                    name: selectedMethod.name,
                    details: selectedMethod.details
                },
                whatsappNumber: whatsappNumber.trim()
            });
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 300000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="glass" style={{ width: '100%', maxWidth: '520px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', animation: 'fadeIn 0.3s ease-out', position: 'relative', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="flex items-center gap-3">
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,153,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)' }}>
                            <FaWallet size={18} />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '900', margin: 0 }}>Recharger le solde</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><FaTimes size={20} /></button>
                </div>

                {/* Success State */}
                {success ? (
                    <div style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <FaCheckCircle size={60} color="var(--success)" style={{ animation: 'popIn 0.4s ease-out' }} />
                        <h3 style={{ color: '#fff', fontWeight: '900', fontSize: '1.4rem', margin: 0 }}>Demande envoyée !</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                            Votre demande de recharge de <strong style={{ color: 'var(--accent-color)' }}>${amount}</strong> via <strong style={{ color: '#fff' }}>{selectedMethod?.name}</strong> a été soumise avec succès.<br/>
                            L'administrateur traitera votre demande dans les plus brefs délais.
                        </p>
                        <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '10px', padding: '14px 35px', borderRadius: '14px', fontWeight: '800' }}>
                            FERMER
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="custom-scrollbar" style={{ padding: '25px', maxHeight: '65vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Amount */}
                            <div>
                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'block' }}>
                                    Montant à recharger ($)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="admin-input"
                                        type="number"
                                        min="1"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Ex: 50"
                                        style={{ paddingLeft: '42px', fontSize: '1.2rem', fontWeight: '800' }}
                                    />
                                    <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-color)', fontWeight: '900', fontSize: '1.1rem' }}>$</span>
                                </div>
                            </div>

                            {/* WhatsApp Number */}
                            <div>
                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', display: 'block' }}>
                                    Votre numéro WhatsApp
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="admin-input"
                                        type="tel"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        placeholder="Ex: +216 22 123 456"
                                        style={{ paddingLeft: '42px' }}
                                    />
                                    <FaWhatsapp style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#25D366', fontSize: '1.1rem' }} />
                                </div>
                                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '6px' }}>Pour que l'admin puisse vous contacter et confirmer le paiement.</p>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'block' }}>
                                    Méthode de paiement
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {settings?.rechargeMethods && settings.rechargeMethods.length > 0 ? (
                                        settings.rechargeMethods.map((method, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedMethod(method)}
                                                style={{
                                                    padding: '15px',
                                                    borderRadius: '16px',
                                                    background: selectedMethod === method ? 'rgba(255,153,0,0.08)' : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${selectedMethod === method ? 'var(--accent-color)' : 'rgba(255,255,255,0.06)'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '15px',
                                                    cursor: 'pointer',
                                                    transition: '0.2s',
                                                    transform: selectedMethod === method ? 'scale(1.01)' : 'scale(1)'
                                                }}
                                            >
                                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', flexShrink: 0 }}>
                                                    {method.logo ? (
                                                        <img src={formatImageUrl(method.logo)} alt={method.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                    ) : (
                                                        <FaMoneyBillWave size={24} color="#000" />
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ color: '#fff', fontWeight: '800', fontSize: '0.95rem' }}>{method.name}</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '2px' }}>
                                                        <FaWhatsapp style={{ marginRight: '4px', color: '#25D366', verticalAlign: 'middle' }} />
                                                        {method.details}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    width: '22px', height: '22px', borderRadius: '50%',
                                                    border: `2px solid ${selectedMethod === method ? 'var(--accent-color)' : 'rgba(255,255,255,0.15)'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    transition: '0.2s', flexShrink: 0
                                                }}>
                                                    {selectedMethod === method && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-color)' }}></div>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '15px', fontSize: '0.85rem' }}>
                                            Aucune méthode de paiement configurée. Contactez l'administrateur.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div style={{ padding: '12px 16px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: '12px', color: '#ff4757', fontSize: '0.85rem', fontWeight: '600' }}>
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '20px 25px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <button
                                disabled={!isValid || loading}
                                onClick={handleSendRechargeRequest}
                                className="btn btn-primary"
                                style={{
                                    width: '100%', padding: '15px', borderRadius: '15px', fontWeight: '900',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                    opacity: (!isValid || loading) ? 0.5 : 1,
                                    transition: '0.2s',
                                    fontSize: '0.95rem'
                                }}
                            >
                                <FaWallet size={18} />
                                {loading ? 'Envoi en cours...' : 'RECHARGER LE SOLDE'}
                            </button>
                            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', marginTop: '12px' }}>
                                Votre demande sera examinée et traitée par l'administrateur.
                            </p>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.5); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default RechargeModal;
