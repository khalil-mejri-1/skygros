import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { FaTimes, FaUndo, FaSearch, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ResetCodeModal = ({ isOpen, onClose }) => {
    const { user } = useContext(AuthContext);
    const [types, setTypes] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [selectedType, setSelectedType] = useState('');
    const [code, setCode] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [password, setPassword] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    // UI State
    const [successMessage, setSuccessMessage] = useState(null);
    const [error, setError] = useState(null);

    const [whatsapp, setWhatsapp] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            fetchOptions();
            fetchProducts();
            fetchSettings();
            // Reset form
            setSelectedType('');
            setCode('');
            setSelectedProduct('');
            setPassword('');
            setSearchTerm('');
            setSuccessMessage(null);
            setError(null);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/settings`);
            if (res.data && res.data.whatsappNumber) {
                setWhatsapp(res.data.whatsappNumber);
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
        }
    };

    const fetchOptions = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/reset-codes/options`);
            setTypes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/products`);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await axios.post(`${API_BASE_URL}/reset-codes`, {
                userId: user?._id,
                type: selectedType,
                code,
                productId: selectedProduct?._id,
                password: selectedType === 'm3u' ? password : null
            });

            const contactMsg = whatsapp ? ` ou via WhatsApp: ${whatsapp}` : "";
            setSuccessMessage(`Votre nouveau code sera envoyé dans un délai maximum de 2 heures. Si le délai est dépassé, veuillez contacter l'admin${contactMsg}.`);
            setTimeout(() => {
                onClose();
            }, 8000);
        } catch (err) {
            setError("Une erreur est survenue lors de l'envoi de la demande.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        if (!searchTerm) return true;
        const queryLower = searchTerm.toLowerCase();
        const titleLower = product.title.toLowerCase();

        // Helper for fuzzy match
        const isFuzzyMatch = (text, search) => {
            let searchIdx = 0;
            for (let char of text) {
                if (char === search[searchIdx]) searchIdx++;
                if (searchIdx === search.length) return true;
            }
            return false;
        };

        return titleLower.includes(queryLower) || isFuzzyMatch(titleLower, queryLower);
    });

    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 6, 12, 0.6)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            animation: 'fadeIn 0.3s ease-out forwards'
        }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="glass custom-scrollbar" style={{
                width: '100%',
                maxWidth: '480px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '35px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'linear-gradient(145deg, rgba(20,22,40,0.95), rgba(10,11,25,0.98))',
                boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
                animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                position: 'relative'
            }}>

                {/* Close Button */}
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: '12px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s'
                }}
                    className="hover:bg-white/10 hover:text-white"
                >
                    <FaTimes />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '20px',
                        background: 'rgba(255, 71, 87, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px',
                        color: '#ff4757',
                        border: '1px solid rgba(255, 71, 87, 0.2)'
                    }}>
                        <FaUndo size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginBottom: '5px' }}>Reset Code</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Demandez la réinitialisation de votre code</p>
                </div>

                {successMessage ? (
                    <div className="bg-green-500/10 border border-green-500/20 text-center p-6 rounded-2xl animate-fade-in-up">
                        <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
                        <p className="text-green-400 font-bold leading-relaxed">{successMessage}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
                                <FaExclamationCircle className="text-xl flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Type Select */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Type de Code</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:bg-white/10 outline-none transition-all font-medium appearance-none"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                required
                            >
                                <option value="" disabled className="bg-slate-900">Choisir un type</option>
                                <option value="m3u" className="bg-slate-900">m3u</option>
                                {types.map(t => (
                                    <option key={t._id} value={t.value} className="bg-slate-900">{t.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Code Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Votre Code Actuel</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:bg-white/10 outline-none transition-all font-medium placeholder-gray-600"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                required
                                placeholder="Entrez le code à réinitialiser"
                            />
                        </div>

                        {/* Product Select with Search */}
                        <div className="flex flex-col gap-2 relative">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Produit Concerné</label>
                            <div
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white cursor-pointer flex items-center justify-between hover:bg-white/10 transition-all border-b-2 border-b-transparent hover:border-b-primary/50"
                                onClick={() => setShowProductDropdown(!showProductDropdown)}
                            >
                                {selectedProduct ? (
                                    <div className="flex items-center gap-3">
                                        <img src={selectedProduct.image} alt="" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
                                        <span className="font-semibold">{selectedProduct.title}</span>
                                    </div>
                                ) : (
                                    <span className="text-gray-500 font-medium">Sélectionner un produit</span>
                                )}
                                <FaSearch className={`text-gray-500 text-sm transition-transform ${showProductDropdown ? 'text-primary' : ''}`} />
                            </div>

                            {/* Dropdown */}
                            {showProductDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1b1e32] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-hidden flex flex-col animate-fade-in-up">
                                    <div className="p-3 bg-[#151725] border-b border-white/5 sticky top-0">
                                        <input
                                            type="text"
                                            placeholder="Rechercher un produit..."
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="overflow-y-auto custom-scrollbar flex-1">
                                        {filteredProducts.map(p => (
                                            <div
                                                key={p._id}
                                                className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                                                onClick={() => {
                                                    setSelectedProduct(p);
                                                    setShowProductDropdown(false);
                                                }}
                                            >
                                                <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-black/50" />
                                                <span className="text-sm font-bold text-gray-200">{p.title}</span>
                                            </div>
                                        ))}
                                        {filteredProducts.length === 0 && (
                                            <div className="p-6 text-center text-gray-500 text-sm font-medium">Aucun produit trouvé</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Password Input (Conditional) */}
                        {selectedType === 'm3u' && (
                            <div className="flex flex-col gap-2 animate-fade-in-up">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mot de passe (Obligatoire pour m3u)</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:bg-white/10 outline-none transition-all font-medium placeholder-gray-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Entrez le mot de passe associé"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !selectedType || !code || !selectedProduct}
                            className={`w-full py-4 rounded-xl font-black text-white transition-all shadow-xl mt-4 text-sm tracking-wide uppercase
                                ${loading || !selectedType || !code || !selectedProduct
                                    ? 'bg-gray-700/50 cursor-not-allowed opacity-50 text-gray-500'
                                    : 'bg-gradient-to-r from-[#ff4757] to-[#ff6b81] hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-1'
                                }`}
                        >
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : "ENVOYER LA DEMANDE"}
                        </button>
                    </form>
                )}

                <style jsx>{`
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    .animate-fade-in-up { animation: slideUp 0.3s ease-out forwards; }
                `}</style>
            </div>
        </div>,
        document.body
    );
};

export default ResetCodeModal;
