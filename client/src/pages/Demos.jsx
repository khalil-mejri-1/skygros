import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import API_BASE_URL from "../config/api";
import axios from "axios";
import { FaGift, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";

const Demos = () => {
    const { user, dispatch } = useContext(AuthContext);
    const [availableTypes, setAvailableTypes] = useState([]);
    const [myDemos, setMyDemos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClaiming, setIsClaiming] = useState(false);

    // Modal States
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null, type: "warning" });
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "", type: "success" });

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [typesRes, myDemosRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/demos/available-types`),
                axios.get(`${API_BASE_URL}/demos/user/${user._id}`)
            ]);
            setAvailableTypes(typesRes.data);
            setMyDemos(myDemosRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (serviceName) => {
        setConfirmModal({
            isOpen: true,
            title: "Générer un compte démo ?",
            message: `Voulez-vous générer un compte démo pour ${serviceName} ? Cela consommera 1 crédit de votre solde.`,
            type: "info",
            confirmColor: "#ff9900",
            confirmText: "GÉNÉRER",
            onConfirm: async () => {
                setIsClaiming(true);
                setConfirmModal({ ...confirmModal, isOpen: false });
                try {
                    const res = await axios.post(`${API_BASE_URL}/demos/claim`, {
                        userId: user._id,
                        serviceName
                    });
                    dispatch({ type: "UPDATE_USER", payload: { ...user, demoBalance: res.data.newBalance } });
                    fetchData();
                    setAlertModal({
                        isOpen: true,
                        title: "Compte démo généré !",
                        message: `Votre compte démo pour ${serviceName} a été généré avec succès.`,
                        type: "success"
                    });
                } catch (err) {
                    console.error(err);
                    setAlertModal({
                        isOpen: true,
                        title: "Erreur",
                        message: err.response?.data?.message || "Erreur lors de la génération du compte démo.",
                        type: "error"
                    });
                } finally {
                    setIsClaiming(false);
                }
            }
        });
    };

    if (loading) return <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Chargement...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '60px 0' }}>
            <div className="container">
                <h1 className="section-title" style={{ marginBottom: '40px' }}>
                    Gestion des <span style={{ color: 'var(--accent-color)' }}>Démos</span>
                </h1>

                <div className="glass" style={{ padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '900', marginBottom: '5px' }}>Votre Solde Démos</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Utilisez vos crédits pour générer des comptes d'essai.</p>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaGift /> {user?.demoBalance || 0}
                    </div>
                </div>

                {/* Available Types Grid */}
                {user?.demoBalance > 0 && availableTypes.length > 0 && (
                    <div style={{ marginBottom: '60px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                            <div style={{ width: '4px', height: '24px', background: 'var(--accent-color)', borderRadius: '2px' }}></div>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Démos Disponibles</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                            {availableTypes.map((type) => (
                                <div key={type._id} className="glass hover-lift" style={{
                                    padding: '0',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: 'rgba(19, 20, 39, 0.4)'
                                }}>
                                    {/* Image Section */}
                                    <div style={{ position: 'relative', height: '200px', width: '100%', overflow: 'hidden' }}>
                                        <img
                                            src={type.image || "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1000&auto=format&fit=crop"}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            alt={type._id}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '15px',
                                            right: '15px',
                                            background: 'rgba(0,0,0,0.6)',
                                            backdropFilter: 'blur(5px)',
                                            padding: '5px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            color: 'var(--success)',
                                            fontWeight: '800',
                                            border: '1px solid rgba(0,210,133,0.3)'
                                        }}>
                                            {type.count} EN STOCK
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                                        <div>
                                            <h4 style={{ color: '#fff', fontWeight: '900', fontSize: '1.2rem', marginBottom: '8px' }}>{type._id}</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', minHeight: '40px' }}>
                                                {type.description || "Compte d'essai premium haute performance."}
                                            </p>
                                        </div>

                                        <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                            <button
                                                onClick={() => handleClaim(type._id)}
                                                disabled={isClaiming}
                                                className="btn btn-primary w-full"
                                                style={{ padding: '12px', borderRadius: '14px', fontSize: '0.85rem' }}
                                            >
                                                {isClaiming ? "GÉNÉRATION..." : "RÉCUPÉRER MA DÉMO"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* My Demos History */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                        <div style={{ width: '4px', height: '24px', background: 'var(--info)', borderRadius: '2px' }}></div>
                        <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Mes Démos Générées</h3>
                    </div>

                    {myDemos.length === 0 ? (
                        <div className="glass" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <FaExclamationTriangle size={30} style={{ marginBottom: '15px', opacity: 0.3 }} />
                            <p>Vous n'avez pas encore généré de compte démo.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                            {myDemos.map(demo => (
                                <div key={demo._id} className="glass" style={{
                                    padding: '20px',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    background: 'rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '15px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={demo.image || "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=100"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#fff', fontWeight: '900', fontSize: '1.1rem' }}>{demo.serviceName}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Utilisé le {new Date(demo.claimedAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{
                                        fontFamily: 'monospace',
                                        background: 'rgba(var(--accent-color-rgb), 0.1)',
                                        padding: '10px 15px',
                                        borderRadius: '12px',
                                        color: 'var(--accent-color)',
                                        fontWeight: '900',
                                        fontSize: '0.9rem',
                                        border: '1px solid rgba(var(--accent-color-rgb), 0.2)'
                                    }}>
                                        {demo.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
                confirmColor={confirmModal.confirmColor}
            />

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
};

export default Demos;
