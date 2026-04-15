import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { 
    FaUser, FaLock, FaBox, FaChevronRight, 
    FaCheckCircle, FaExclamationTriangle, FaDownload, FaCopy, 
    FaCalendarAlt, FaShieldAlt, FaRocket 
} from 'react-icons/fa';

/**
 * GoldenIptvOrderForm Component
 * A clean, minimalist form for purchasing Golden IPTV M3U subscriptions.
 */
const GoldenIptvOrderForm = () => {
    // Form State
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        package_id: ''
    });

    // UI & API State
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingPackages, setIsFetchingPackages] = useState(true);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Fetch available packages on component mount
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setIsFetchingPackages(true);
                setError('');
                const res = await axios.get(`${API_BASE_URL}/v1/orders/packages`);
                
                let packagesData = [];
                // Handle the specific structure: { success: true, packages: { data: [...] } }
                if (res.data && res.data.packages && Array.isArray(res.data.packages.data)) {
                    packagesData = res.data.packages.data;
                } 
                // Fallbacks for other structures
                else if (Array.isArray(res.data)) {
                    packagesData = res.data;
                } else if (res.data && Array.isArray(res.data.data)) {
                    packagesData = res.data.data;
                }

                setPackages(packagesData);
                
                if (packagesData.length > 0) {
                    setFormData(prev => ({ ...prev, package_id: packagesData[0].id }));
                } else {
                    setError("Aucun forfait disponible pour le moment.");
                }
            } catch (err) {
                console.error("Failed to fetch Golden packages:", err);
                setError("Impossible de charger les forfaits. Veuillez vérifier la connexion API.");
            } finally {
                setIsFetchingPackages(false);
            }
        };

        fetchPackages();
    }, []);

    // Basic Input Validation
    const validate = () => {
        const errors = {};
        
        // Username: No spaces
        if (!formData.username.trim()) {
            errors.username = "Le nom d'utilisateur est requis.";
        } else if (/\s/.test(formData.username)) {
            errors.username = "Le nom d'utilisateur ne doit pas contenir d'espaces.";
        }

        // Password: At least 6 chars
        if (!formData.password) {
            errors.password = "Le mot de passe est requis.";
        } else if (formData.password.length < 6) {
            errors.password = "Le mot de passe doit contenir au moins 6 caractères.";
        }

        if (!formData.package_id) {
            errors.package_id = "Veuillez sélectionner un forfait.";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for that field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validate()) return;

        setIsLoading(true);
        try {
            const endpoint = `${API_BASE_URL}/v1/orders/create-line`;
            const res = await axios.post(endpoint, formData);

            if (res.status === 201) {
                setSuccessData(res.data.data || res.data);
            }
        } catch (err) {
            console.error("Purchase error:", err);
            const msg = err.response?.data?.message || "Une erreur est survenue lors de la création de votre ligne.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    // --- SUCCESS VIEW ---
    if (successData) {
        // Handle variations in response structure
        const line = Array.isArray(successData) ? successData[0] : (successData.lines ? successData.lines[0] : successData);
        return (
            <div className="max-w-xl mx-auto p-8 rounded-3xl bg-[#0f111a] border border-emerald-500/30 shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                        <FaCheckCircle size={48} />
                    </div>
                    
                    <h2 className="text-3xl font-black text-white">Souscription Réussie !</h2>
                    <p className="text-gray-400">Vos identifiants Golden IPTV VIP sont prêts.</p>

                    <div className="w-full space-y-4 text-left mt-6">
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                            <div className="flex justify-between items-center group">
                                <span className="text-xs font-bold text-gray-500 uppercase">Serveur Host</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-400 font-mono">http://golden-dns.com:80</span>
                                    <button onClick={() => copyToClipboard('http://golden-dns.com:80')} className="hover:text-white text-gray-600 transition-colors">
                                        <FaCopy size={12} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase">Utilisateur</span>
                                <span className="text-white font-bold">{line.username}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase">Mot de passe</span>
                                <span className="text-white font-bold">{line.password}</span>
                            </div>
                            <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <FaCalendarAlt className="text-indigo-400" /> Expiration
                                </span>
                                <span className="text-indigo-400 font-bold">
                                    {line.expire_date ? new Date(line.expire_date * 1000).toLocaleDateString() : 'Non spécifié'}
                                </span>
                            </div>
                        </div>

                        <button 
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/20"
                            onClick={() => {
                                const m3uUrl = `http://golden-dns.com/get.php?username=${line.username}&password=${line.password}&type=m3u_plus&output=ts`;
                                window.open(m3uUrl, '_blank');
                            }}
                        >
                            <FaDownload /> TÉLÉCHARGER M3U
                        </button>
                        
                        <button 
                            className="w-full py-3 text-sm text-gray-500 hover:text-white transition-colors"
                            onClick={() => window.location.reload()}
                        >
                            Retour au formulaire
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- FORM VIEW ---
    return (
        <div className="max-w-xl mx-auto overflow-hidden rounded-3xl bg-[#0a0b14] border border-white/5 shadow-2xl relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 blur-[100px] -z-10" />

            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                            <span className="text-amber-500"><FaRocket /></span> Golden IPTV VIP
                        </h2>
                        <p className="text-gray-500 text-xs mt-1 font-bold">CRÉE MA LIGNE M3U INSTANTANÉMENT</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20 uppercase">
                        <FaShieldAlt /> Premium
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username Input */}
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest pl-1">Identifiant Ligne</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-500 transition-colors">
                                <FaUser />
                            </div>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="ex: mon_iptv_2024"
                                className={`w-full bg-white/5 border ${validationErrors.username ? 'border-red-500/50' : 'border-white/10'} focus:border-amber-500/50 outline-none rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 transition-all font-medium`}
                            />
                        </div>
                        {validationErrors.username && (
                            <p className="text-red-400 text-[10px] mt-2 font-bold px-1">{validationErrors.username}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest pl-1">Mot De Passe</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-amber-500 transition-colors">
                                <FaLock />
                            </div>
                            <input
                                type="text"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={`w-full bg-white/5 border ${validationErrors.password ? 'border-red-500/50' : 'border-white/10'} focus:border-amber-500/50 outline-none rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 transition-all font-medium`}
                            />
                        </div>
                        {validationErrors.password && (
                            <p className="text-red-400 text-[10px] mt-2 font-bold px-1">{validationErrors.password}</p>
                        )}
                    </div>

                    {/* Package Selection */}
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest pl-1">Sélectionnez Un Forfait</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                                <FaBox />
                            </div>
                            <select
                                name="package_id"
                                value={formData.package_id}
                                onChange={handleChange}
                                disabled={isFetchingPackages || packages.length === 0}
                                className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/50 outline-none rounded-2xl py-4 pl-12 pr-10 text-white appearance-none transition-all font-bold cursor-pointer disabled:opacity-50"
                            >
                                {isFetchingPackages ? (
                                    <option className="bg-[#0a0b14]">Chargement des forfaits...</option>
                                ) : packages.length === 0 ? (
                                    <option className="bg-[#0a0b14]">Aucun forfait trouvé</option>
                                ) : (
                                    packages.map(pkg => (
                                        <option key={pkg.id} value={pkg.id} className="bg-[#0a0b14]">
                                            {pkg.package_name} {pkg.is_official ? '(Official)' : ''}
                                        </option>
                                    ))
                                )}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500">
                                <FaChevronRight size={12} className="rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Errors */}
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm font-medium animate-pulse">
                            <FaExclamationTriangle className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || isFetchingPackages}
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-amber-600/20 mt-4 uppercase tracking-tighter"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>ACTIVER MA LIGNE MAINTENANT <FaChevronRight /></>
                        )}
                    </button>
                </form>

                <p className="text-center text-[10px] text-gray-700 mt-8 font-bold uppercase tracking-widest">
                    Activation immédiate • Support 24/7 • Serveurs Haute Performance
                </p>
            </div>
        </div>
    );
};

export default GoldenIptvOrderForm;
