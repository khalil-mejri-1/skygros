import { useState, useEffect } from "react";

import API_BASE_URL from "../config/api";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaTag, FaKey, FaBoxOpen, FaUsers, FaDolly, FaWallet, FaUserShield, FaUserCheck, FaChartLine, FaShoppingBag, FaUserFriends, FaExclamationTriangle, FaCog, FaMedal, FaTrophy, FaStar, FaHome, FaCheck, FaGift, FaHistory } from "react-icons/fa";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";

const Admin = () => {
    const [activeTab, setActiveTab] = useState("products");
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [demos, setDemos] = useState([]); // demos state
    const [newDemo, setNewDemo] = useState({ serviceName: "", description: "", image: "", contentListText: "" }); // new demo state

    // ... existing states ...
    const [isEditing, setIsEditing] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(null);
    const [balanceAmount, setBalanceAmount] = useState(0);
    const [fulfillmentLogs, setFulfillmentLogs] = useState([]);
    const [showLogModal, setShowLogModal] = useState(false);
    const [showFulfillModal, setShowFulfillModal] = useState(null);
    const [manualKey, setManualKey] = useState("");
    const [categories, setCategories] = useState([]);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState(null);
    const [newCategory, setNewCategory] = useState({ name: "", icon: "", subcategories: [], description: "" });
    const [tempSubcategory, setTempSubcategory] = useState("");
    const [settings, setSettings] = useState(null);
    const [col1Input, setCol1Input] = useState("");

    // Modal States
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null, type: "warning" });
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "", type: "success" });
    const [col2Input, setCol2Input] = useState("");
    const [col3Input, setCol3Input] = useState("");

    const [newProduct, setNewProduct] = useState({
        title: "",
        description: "",
        price: 0,
        oldPrice: 0,
        hasDiscount: false,
        image: "",
        category: "PC",
        keysInput: ""
    });

    const getRankDetail = (count, ranks = []) => {
        if (!ranks || ranks.length === 0) return null;
        const sorted = [...ranks].sort((a, b) => b.minPurchases - a.minPurchases);
        return sorted.find(r => count >= r.minPurchases) || (ranks[0] || null);
    };

    useEffect(() => {
        fetchProducts();
        fetchUsers();
        fetchOrders();
        fetchCategories();
        fetchSettings();
        fetchDemos(); // Fetch demos
    }, []);

    const fetchDemos = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/demos`);
            setDemos(res.data);
        } catch (err) {
            console.error("Error fetching demos:", err);
        }
    };

    const handleAddDemo = async (e) => {
        e.preventDefault();
        try {
            const contentList = newDemo.contentListText.split('\n').filter(line => line.trim() !== "");
            await axios.post(`${API_BASE_URL}/api/demos`, {
                serviceName: newDemo.serviceName,
                description: newDemo.description,
                image: newDemo.image,
                contentList
            });
            setNewDemo({ serviceName: "", description: "", image: "", contentListText: "" });
            fetchDemos();
            setAlertModal({ isOpen: true, title: "Succès !", message: "Les démos ont été ajoutées avec succès.", type: "success" });
        } catch (err) {
            console.error(err);
            setAlertModal({ isOpen: true, title: "Erreur", message: "Erreur lors de l'ajout des démos.", type: "error" });
        }
    };

    const handleDeleteDemo = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer le compte demo ?",
            message: "Cette action est irréversible. Le compte demo sera définitivement supprimé.",
            type: "danger",
            confirmColor: "#ff4757",
            onConfirm: async () => {
                try {
                    await axios.delete(`${API_BASE_URL}/api/demos/${id}`);
                    fetchDemos();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Supprimé !", message: "Le compte demo a été supprimé.", type: "success" });
                } catch (err) {
                    console.error(err);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Erreur", message: "Erreur lors de la suppression.", type: "error" });
                }
            }
        });
    };

    const handleRefund = async (orderId) => {
        setConfirmModal({
            isOpen: true,
            title: "Rembourser cet achat ?",
            message: "Le montant sera recrédité au client. Cette action ne peut pas être annulée.",
            type: "warning",
            confirmColor: "#ff9900",
            confirmText: "REMBOURSER",
            onConfirm: async () => {
                try {
                    await axios.post(`${API_BASE_URL}/api/orders/refund/${orderId}`);
                    fetchOrders();
                    fetchUsers();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Remboursement effectué !", message: "Le montant a été recrédité au client.", type: "success" });
                } catch (err) {
                    console.error("Refund error:", err);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Erreur", message: err.response?.data || "Erreur lors du remboursement.", type: "error" });
                }
            }
        });
    };

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/settings`);
            setSettings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API_BASE_URL}/api/settings`, settings);
            setSettings(res.data);
            setAlertModal({ isOpen: true, title: "Succès !", message: "Les paramètres ont été mis à jour avec succès.", type: "success" });
        } catch (err) {
            console.error(err);
            setAlertModal({ isOpen: true, title: "Erreur", message: "Erreur lors de la mise à jour des paramètres.", type: "error" });
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/orders`);
            if (Array.isArray(res.data)) {
                setOrders(res.data);
            } else {
                console.error("Orders data is not an array:", res.data);
                setOrders([]);
            }
        } catch (err) {
            console.error(err);
            setOrders([]);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products`);
            if (Array.isArray(res.data)) {
                setProducts(res.data);
            } else {
                console.error("Products data is not an array:", res.data);
                setProducts([]);
            }
        } catch (err) {
            console.error(err);
            setProducts([]);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/categories`);
            if (Array.isArray(res.data)) {
                setCategories(res.data);
            } else {
                console.error("Categories data is not an array:", res.data);
                setCategories([]);
            }
        } catch (err) {
            console.error(err);
            setCategories([]);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/categories`, newCategory);
            setNewCategory({ name: "", icon: "", subcategories: [], description: "" });
            setShowCategoryForm(false);
            fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_BASE_URL}/api/categories/${isEditingCategory._id}`, isEditingCategory);
            setIsEditingCategory(null);
            fetchCategories();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCategory = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer cette catégorie ?",
            message: "Tous les produits associés à cette catégorie seront affectés. Cette action est irréversible.",
            type: "danger",
            confirmColor: "#ff4757",
            confirmText: "SUPPRIMER",
            onConfirm: async () => {
                try {
                    await axios.delete(`${API_BASE_URL}/api/categories/${id}`);
                    fetchCategories();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Supprimé !", message: "La catégorie a été supprimée.", type: "success" });
                } catch (err) {
                    console.error(err);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Erreur", message: "Erreur lors de la suppression.", type: "error" });
                }
            }
        });
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/users`);
            if (Array.isArray(res.data)) {
                setUsers(res.data);
            } else {
                console.error("Users data is not an array:", res.data);
                setUsers([]);
            }
        } catch (err) {
            console.error(err);
            setUsers([]);
        }
    };

    const handleDelete = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer ce produit ?",
            message: "Le produit et toutes ses clés seront définitivement supprimés. Cette action est irréversible.",
            type: "danger",
            confirmColor: "#ff4757",
            confirmText: "SUPPRIMER",
            onConfirm: async () => {
                try {
                    await axios.delete(`${API_BASE_URL}/api/products/${id}`);
                    fetchProducts();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Supprimé !", message: "Le produit a été supprimé.", type: "success" });
                } catch (err) {
                    console.error(err);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Erreur", message: "Erreur lors de la suppression.", type: "error" });
                }
            }
        });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const keysArray = newProduct.keysInput.split(',').map(k => ({ key: k.trim(), isSold: false })).filter(k => k.key);

        try {
            await axios.post(`${API_BASE_URL}/api/products`, { ...newProduct, keys: keysArray });
            setNewProduct({
                title: "",
                description: "",
                price: 0,
                oldPrice: 0,
                hasDiscount: false,
                image: "",
                category: "PC",
                keysInput: ""
            });
            setShowAddForm(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        const updatedData = { ...isEditing };
        if (isEditing.keysInput) {
            const newKeys = isEditing.keysInput.split(',').map(k => ({ key: k.trim(), isSold: false })).filter(k => k.key);
            updatedData.keys = [...isEditing.keys, ...newKeys];
            delete updatedData.keysInput;
        }

        try {
            const res = await axios.put(`${API_BASE_URL}/api/products/${isEditing._id}`, updatedData);
            setIsEditing(null);
            fetchProducts();

            // Check if any orders were automatically fulfilled
            if (res.data.fulfillmentLogs && res.data.fulfillmentLogs.length > 0) {
                setFulfillmentLogs(res.data.fulfillmentLogs);
                setShowLogModal(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddBalance = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/users/add-balance`, {
                userId: showBalanceModal._id,
                amount: balanceAmount
            });
            setShowBalanceModal(null);
            setBalanceAmount(0);
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleFulfillOrder = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/orders/fulfill/${showFulfillModal._id}`, {
                licenseKey: manualKey
            });
            setShowFulfillModal(null);
            setManualKey("");
            fetchOrders();
        } catch (err) {
            console.error(err);
        }
    };

    const handleApproveUser = async (user) => {
        setConfirmModal({
            isOpen: true,
            title: "Approuver ce compte ?",
            message: `Un nouveau mot de passe sera généré et envoyé à ${user.email}.`,
            type: "success",
            confirmColor: "#2ed573",
            confirmText: "APPROUVER & ENVOYER EMAIL",
            onConfirm: async () => {
                try {
                    await axios.post(`${API_BASE_URL}/api/auth/approve-user/${user._id}`);
                    fetchUsers();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Succès", message: "Utilisateur approuvé et email envoyé.", type: "success" });
                } catch (err) {
                    console.error("Approval error:", err);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({
                        isOpen: true,
                        title: "Erreur",
                        message: err.response?.data?.message || err.response?.data || "Erreur lors de l'approbation.",
                        type: "error"
                    });
                }
            }
        });
    };

    // Helper for stats
    const stats = {
        totalUsers: users.length,
        totalProducts: products.length,
        totalKeys: products.reduce((acc, p) => acc + (p.keys?.length || 0), 0),
        availableKeys: products.reduce((acc, p) => acc + (p.keys?.filter(k => !k.isSold).length || 0), 0),
        outOfStock: products.filter(p => !p.keys || p.keys.filter(k => !k.isSold).length === 0).length,
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        totalAvailableValue: products.reduce((acc, p) => acc + (p.price * (p.keys?.filter(k => !k.isSold).length || 0)), 0),
    };

    const SidebarItem = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                borderRadius: '14px',
                background: activeTab === id ? 'linear-gradient(135deg, rgba(255, 153, 0, 0.2) 0%, rgba(255, 87, 34, 0.1) 100%)' : 'transparent',
                color: activeTab === id ? 'var(--accent-color)' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: '700',
                fontSize: '0.9rem',
                width: '100%',
                textAlign: 'left',
                border: activeTab === id ? '1px solid rgba(255, 153, 0, 0.2)' : '1px solid transparent'
            }}
            className="sidebar-link"
        >
            <Icon size={18} style={{ color: activeTab === id ? 'var(--accent-color)' : 'inherit' }} />
            {label}
        </button>
    );

    const StatCard = ({ label, value, icon: Icon, color }) => (
        <div className="glass" style={{
            padding: '25px',
            borderRadius: '20px',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: `rgba(${color}, 0.12)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: `rgb(${color})`
            }}>
                <Icon size={24} />
            </div>
            <div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff' }}>{value}</div>
            </div>
        </div>
    );


    /* ... */

    /* ... Dashboard Header text logic ... */
    /* activeTab === "ranks" ? "Système de Rangs" : activeTab === "demos" ? "Gestion des Demos" : ... */

    /* ... Content View ... */
    /* ... inside ternary ... */





    return (
        <div style={{ minHeight: '100vh', background: '#0a0b14', display: 'flex', color: '#fff' }}>
            {/* Sidebar */}
            <div style={{
                width: '300px',
                background: '#0d0e1a',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                padding: '40px 24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 100
            }}>


                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <SidebarItem id="products" label="Gestion Produits" icon={FaBoxOpen} />
                    <SidebarItem id="categories" label="Gestion Catégories" icon={FaTag} />
                    <SidebarItem id="orders" label="Gestion Commandes" icon={FaShoppingBag} />
                    <SidebarItem id="historique" label="Historique Ventes" icon={FaHistory} />
                    <SidebarItem id="users" label="Gestion Clients" icon={FaUsers} />
                    <SidebarItem id="ranks" label="Système de Rangs" icon={FaMedal} />
                    <SidebarItem id="demos" label="Gestion Demos" icon={FaGift} />
                    <SidebarItem id="settings" label="Paramètres Généraux" icon={FaCog} />
                    <SidebarItem id="home" label="Gestion Page Home" icon={FaHome} />
                </div>

                <div className="glass" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '800' }}>STATUT DU SERVEUR</div>
                    <div className="flex items-center gap-2">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>En Ligne</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, marginLeft: '300px', padding: '50px 60px' }}>

                {/* Dashboard Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '8px' }}>
                            {activeTab === "products" ? "Inventaire des Produits" :
                                activeTab === "categories" ? "Gestion des Catégories" :
                                    activeTab === "orders" ? "Gestion des Commandes" :
                                        activeTab === "historique" ? "Historique des Ventes" :
                                            activeTab === "ranks" ? "Système de Rangs" :
                                                activeTab === "demos" ? "Gestion des Demos" :
                                                    activeTab === "settings" ? "Paramètres Généraux" :
                                                        activeTab === "home" ? "Gestion Page Home" : "Base de Données Clients"}
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                            {activeTab === "products" ? "Gérez vos catalogues de clés digitales et stocks." :
                                activeTab === "categories" ? "Organisez vos produits par types et icônes." :
                                    activeTab === "orders" ? "Suivez et validez les achats en attente." :
                                        activeTab === "historique" ? "Consultez toutes les transactions passées." :
                                            activeTab === "ranks" ? "Définissez les paliers de fidélité et récompenses." :
                                                activeTab === "demos" ? "Gérez les comptes d'essai et démos." :
                                                    activeTab === "settings" ? "Configurez les informations globales du site." :
                                                        activeTab === "home" ? "Modifiez le contenu de la page d'accueil." : "Gérez les permissions et soldes de vos clients."}
                        </p>
                    </div>
                    {activeTab === "products" && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="btn btn-primary hover-lift"
                            style={{
                                padding: '14px 28px',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'var(--accent-color)',
                                boxShadow: '0 8px 25px rgba(255, 153, 0, 0.25)'
                            }}
                        >
                            <FaPlus /> AJOUTER UN PRODUIT
                        </button>
                    )}
                    {activeTab === "categories" && (
                        <button
                            onClick={() => setShowCategoryForm(true)}
                            className="btn btn-primary hover-lift"
                            style={{
                                padding: '14px 28px',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'var(--success)',
                                boxShadow: '0 8px 25px rgba(46, 213, 115, 0.25)'
                            }}
                        >
                            <FaPlus /> AJOUTER UNE CATÉGORIE
                        </button>
                    )}
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <StatCard label="Total Produits" value={stats.totalProducts} icon={FaShoppingBag} color="255, 153, 0" />
                    <StatCard label="Commandes en attente" value={stats.pendingOrders} icon={FaDolly} color="255, 71, 87" />
                    <StatCard label="Stock Total" value={stats.totalKeys} icon={FaKey} color="46, 213, 115" />
                    <StatCard label="Valeur Stock" value={`$${stats.totalAvailableValue.toFixed(2)}`} icon={FaWallet} color="10, 191, 255" />
                    <StatCard label="Clients" value={stats.totalUsers} icon={FaUserFriends} color="162, 155, 254" />
                </div>

                {/* Content View */}
                {activeTab === "products" ? (
                    <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Produit</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Catégorie</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Prix</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Inventaire</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => {
                                    const totalKeys = p.keys?.length || 0;
                                    const availableKeys = p.keys?.filter(k => !k.isSold).length || 0;
                                    const soldKeys = totalKeys - availableKeys;

                                    return (
                                        <tr key={p._id} style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            filter: availableKeys === 0 ? 'grayscale(0.5)' : 'none',
                                            opacity: availableKeys === 0 ? 0.8 : 1
                                        }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div className="flex items-center gap-4">
                                                    <div style={{ position: 'relative' }}>
                                                        <img src={p.image} style={{ width: '45px', height: '62px', objectFit: 'cover', borderRadius: '8px' }} alt="" />
                                                        {availableKeys === 0 && (
                                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: '1px solid var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <FaExclamationTriangle size={14} color="var(--error)" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ color: '#fff', fontWeight: '800', fontSize: '1rem', marginBottom: '4px' }}>{p.title}</div>
                                                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: '700' }}>#{p._id.substring(18)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '0.75rem', fontWeight: '900' }}>
                                                    {p.category.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ color: 'var(--accent-color)', fontWeight: '900', fontSize: '1.1rem' }}>${p.price.toFixed(2)}</div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', width: '100px' }}>
                                                            <div style={{
                                                                width: totalKeys === 0 ? '0%' : `${(availableKeys / totalKeys) * 100}%`,
                                                                height: '100%',
                                                                background: availableKeys === 0 ? 'var(--error)' : 'var(--success)',
                                                                boxShadow: availableKeys > 0 ? '0 0 10px rgba(46, 213, 115, 0.3)' : 'none'
                                                            }}></div>
                                                        </div>
                                                        <span style={{ fontWeight: '900', fontSize: '0.85rem', color: availableKeys === 0 ? 'var(--error)' : 'var(--success)' }}>
                                                            {availableKeys}/{totalKeys}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: '700' }}>{soldKeys} UNITÉS VENDUES</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setIsEditing(p)} className="action-btn edit" title="Modifier"><FaEdit size={18} /></button>
                                                    <button onClick={() => handleDelete(p._id)} className="action-btn delete" title="Supprimer"><FaTrash size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === "categories" ? (
                    <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Catégorie</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Icône / Sous-catégories</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((c) => (
                                    <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem' }}>{c.name}</div>
                                            {c.description && (
                                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '4px' }}>{c.description}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--accent-color)' }}>
                                                    {c.icon.startsWith('http') ? <img src={c.icon} style={{ width: '24px', height: '24px' }} /> : c.icon}
                                                </div>
                                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontWeight: '700' }}>
                                                    {c.subcategories?.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {c.subcategories.slice(0, 3).map((sub, idx) => (
                                                                <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{sub}</span>
                                                            ))}
                                                            {c.subcategories.length > 3 && <span>+{c.subcategories.length - 3}</span>}
                                                        </div>
                                                    ) : "Aucune"}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div className="flex gap-2">
                                                <button onClick={() => setIsEditingCategory(c)} className="action-btn edit" title="Modifier"><FaEdit size={18} /></button>
                                                <button onClick={() => handleDeleteCategory(c._id)} className="action-btn delete" title="Supprimer"><FaTrash size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === "orders" ? (
                    <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Client</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Produit</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Code / Statut</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.filter(o => o.status === 'PENDING').map((o) => (
                                    <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ color: '#fff', fontWeight: '800' }}>{o.userId?.username || 'N/A'}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{o.userId?.email || ''}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div className="flex items-center gap-3">
                                                <img src={o.productImage} style={{ width: '30px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{o.productTitle}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                            {new Date(o.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            {o.status === 'PENDING' ? (
                                                <span style={{ color: 'var(--error)', fontWeight: '900', fontSize: '0.75rem', letterSpacing: '1px' }}>EN ATTENTE</span>
                                            ) : (
                                                <div style={{ fontFamily: 'monospace', color: 'var(--success)', fontWeight: '800' }}>{o.licenseKey}</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            {o.status === 'PENDING' && (
                                                <button onClick={() => setShowFulfillModal(o)} className="action-btn success" title="Envoyer le Code">
                                                    <FaKey size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === "historique" ? (
                    <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Client</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Produit (Prix)</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Statut</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o) => (
                                    <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ color: '#fff', fontWeight: '800' }}>{o.userId?.username || 'N/A'}</div>
                                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{o.userId?.email || ''}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ color: '#fff', fontWeight: '700' }}>{o.productTitle}</div>
                                            <div style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: '800' }}>${o.price.toFixed(2)}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            {o.status === 'COMPLETED' ? (
                                                <span style={{ color: 'var(--success)', fontWeight: '900', fontSize: '0.7rem', padding: '4px 8px', background: 'rgba(0, 210, 133, 0.1)', borderRadius: '6px' }}>COMPLÉTÉ</span>
                                            ) : o.status === 'REFUNDED' ? (
                                                <span style={{ color: 'var(--danger)', fontWeight: '900', fontSize: '0.7rem', padding: '4px 8px', background: 'rgba(255, 71, 87, 0.1)', borderRadius: '6px' }}>REMBOURSÉ</span>
                                            ) : (
                                                <span style={{ color: '#ff9900', fontWeight: '900', fontSize: '0.7rem', padding: '4px 8px', background: 'rgba(255, 153, 0, 0.1)', borderRadius: '6px' }}>EN ATTENTE</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            {o.status !== 'REFUNDED' && (
                                                <button
                                                    onClick={() => handleRefund(o._id)}
                                                    className="action-btn delete"
                                                    title="Rembourser"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '5px', width: 'auto', padding: '8px 15px', borderRadius: '10px' }}
                                                >
                                                    <FaWallet size={12} /> <span style={{ fontSize: '0.65rem', fontWeight: '800' }}>REMBOURSER</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                ) : activeTab === "ranks" ? (
                    <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900' }}>Paliers de Récompenses</h3>
                            <button
                                onClick={() => {
                                    const newRanks = [...(settings.ranks || []), { name: "Nouveau", minPurchases: 0, color: "#ffffff", icon: "FaMedal" }];
                                    setSettings({ ...settings, ranks: newRanks });
                                }}
                                className="btn"
                                style={{ background: 'var(--success)', color: '#000', fontSize: '0.8rem', padding: '8px 16px', borderRadius: '10px' }}
                            >
                                + AJOUTER PALIERS
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {settings?.ranks?.map((rank, idx) => (
                                <div key={idx} className="glass" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 50px', gap: '20px', alignItems: 'center' }}>
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Nom du Rang</label>
                                        <input
                                            className="admin-input"
                                            value={rank.name}
                                            onChange={(e) => {
                                                const newRanks = [...settings.ranks];
                                                newRanks[idx].name = e.target.value;
                                                setSettings({ ...settings, ranks: newRanks });
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Achats Requis</label>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={rank.minPurchases}
                                            onChange={(e) => {
                                                const newRanks = [...settings.ranks];
                                                newRanks[idx].minPurchases = parseInt(e.target.value);
                                                setSettings({ ...settings, ranks: newRanks });
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Récompense Demo (Qté)</label>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={rank.rewardDemoCount || 0}
                                            onChange={(e) => {
                                                const newRanks = [...settings.ranks];
                                                newRanks[idx].rewardDemoCount = parseInt(e.target.value);
                                                setSettings({ ...settings, ranks: newRanks });
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Récompense Demo (Qté)</label>
                                        <input
                                            type="number"
                                            className="admin-input"
                                            value={rank.rewardDemoCount || 0}
                                            onChange={(e) => {
                                                const newRanks = [...settings.ranks];
                                                newRanks[idx].rewardDemoCount = parseInt(e.target.value);
                                                setSettings({ ...settings, ranks: newRanks });
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Couleur (Hex)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                style={{ width: '40px', height: '40px', padding: '0', background: 'none', border: 'none', cursor: 'pointer' }}
                                                value={rank.color}
                                                onChange={(e) => {
                                                    const newRanks = [...settings.ranks];
                                                    newRanks[idx].color = e.target.value;
                                                    setSettings({ ...settings, ranks: newRanks });
                                                }}
                                            />
                                            <input
                                                className="admin-input"
                                                value={rank.color}
                                                onChange={(e) => {
                                                    const newRanks = [...settings.ranks];
                                                    newRanks[idx].color = e.target.value;
                                                    setSettings({ ...settings, ranks: newRanks });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Icône</label>
                                        <select
                                            className="admin-input"
                                            value={rank.icon}
                                            onChange={(e) => {
                                                const newRanks = [...settings.ranks];
                                                newRanks[idx].icon = e.target.value;
                                                setSettings({ ...settings, ranks: newRanks });
                                            }}
                                        >
                                            <option value="FaMedal">Médaille</option>
                                            <option value="FaTrophy">Trophée</option>
                                            <option value="FaStar">Étoile</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newRanks = settings.ranks.filter((_, i) => i !== idx);
                                            setSettings({ ...settings, ranks: newRanks });
                                        }}
                                        className="action-btn delete"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleUpdateSettings}
                            className="btn btn-primary"
                            style={{ marginTop: '30px', padding: '15px 40px', borderRadius: '15px', fontWeight: '900' }}
                        >
                            ENREGISTRER LES RANGS
                        </button>
                    </div>
                ) : activeTab === "demos" ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '20px', color: '#fff' }}>Ajouter Stock Demo</h3>
                            <form onSubmit={handleAddDemo} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="flex flex-col gap-2">
                                    <label className="form-label">Nom du Service (ex: IPTV Premium)</label>
                                    <input className="admin-input" value={newDemo.serviceName} onChange={(e) => setNewDemo({ ...newDemo, serviceName: e.target.value })} required />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="form-label">Image URL (Produit)</label>
                                    <input className="admin-input" value={newDemo.image} onChange={(e) => setNewDemo({ ...newDemo, image: e.target.value })} placeholder="https://..." />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="form-label">Description (Optionnel)</label>
                                    <input className="admin-input" value={newDemo.description} onChange={(e) => setNewDemo({ ...newDemo, description: e.target.value })} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="form-label">Comptes / Clés (Une par ligne)</label>
                                    <textarea className="admin-input" style={{ height: '150px', fontFamily: 'monospace' }} value={newDemo.contentListText} onChange={(e) => setNewDemo({ ...newDemo, contentListText: e.target.value })} required placeholder="user:pass&#10;user2:pass2" />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ padding: '15px', borderRadius: '14px', background: 'var(--accent-color)', color: '#000', fontWeight: '900' }}>AJOUTER AU STOCK</button>
                            </form>
                        </div>

                        <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '20px', color: '#fff' }}>Stock Disponible ({demos.length})</h3>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        <tr>
                                            <th style={{ padding: '15px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Service</th>
                                            <th style={{ padding: '15px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Contenu</th>
                                            <th style={{ padding: '15px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Statut</th>
                                            <th style={{ padding: '15px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {demos.map(d => (
                                            <tr key={d._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '15px', color: '#fff', fontWeight: '700' }}>{d.serviceName}</td>
                                                <td style={{ padding: '15px', fontFamily: 'monospace', color: 'var(--accent-color)', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>{d.content}</td>
                                                <td style={{ padding: '15px' }}>
                                                    {d.isClaimed ? (
                                                        <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>
                                                            {d.claimedBy?.username ? `Réclamé (${d.claimedBy.username})` : 'Réclamé'}
                                                        </span>
                                                    ) : <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Disponible</span>}
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <button onClick={() => handleDeleteDemo(d._id)} className="action-btn delete"><FaTrash size={12} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : activeTab === "settings" ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {settings && (
                            <form onSubmit={handleUpdateSettings}>
                                {/* SMTP Settings */}
                                <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '20px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Configuration Email (SMTP)</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="flex flex-col gap-2">
                                            <label className="form-label">Email Expéditeur</label>
                                            <input
                                                className="admin-input"
                                                type="email"
                                                value={settings.smtpEmail || ""}
                                                onChange={(e) => setSettings({ ...settings, smtpEmail: e.target.value })}
                                                placeholder="ex: monemail@gmail.com"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="form-label">Mot de passe d'application</label>
                                            <input
                                                className="admin-input"
                                                type="text"
                                                value={settings.smtpPassword || ""}
                                                onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                                                placeholder="Clé secrète / App Password"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Pied de page (Footer) */}
                                <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '20px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Pied de page (Footer)</h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div className="flex flex-col gap-2">
                                            <label className="form-label">Description (À Propos)</label>
                                            <textarea
                                                className="admin-input"
                                                style={{ height: '100px', resize: 'vertical' }}
                                                value={settings.footer.aboutText}
                                                onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, aboutText: e.target.value } })}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="form-label">Numéro de Contact</label>
                                            <input
                                                className="admin-input"
                                                value={settings.footer.contactNumber}
                                                onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, contactNumber: e.target.value } })}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div className="flex flex-col gap-2">
                                                <label className="form-label">Lien Facebook</label>
                                                <input
                                                    className="admin-input"
                                                    value={settings.footer.facebookLink}
                                                    onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, facebookLink: e.target.value } })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="form-label">Lien Telegram</label>
                                                <input
                                                    className="admin-input"
                                                    value={settings.footer.telegramLink}
                                                    onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, telegramLink: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Réseaux Sociaux Dynamiques */}
                                <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '20px', color: '#fff' }}>Réseaux Sociaux Dynamiques (Icônes supplémentaires)</h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {settings.footer.dynamicSocials?.map((social, idx) => (
                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 50px', gap: '15px', alignItems: 'end' }}>
                                                <div className="flex flex-col gap-1">
                                                    <label className="form-label" style={{ fontSize: '0.65rem' }}>Nom (ex: Instagram)</label>
                                                    <input
                                                        className="admin-input"
                                                        value={social.name}
                                                        onChange={(e) => {
                                                            const newSocials = [...settings.footer.dynamicSocials];
                                                            newSocials[idx].name = e.target.value;
                                                            setSettings({ ...settings, footer: { ...settings.footer, dynamicSocials: newSocials } });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="form-label" style={{ fontSize: '0.65rem' }}>URL Icône</label>
                                                    <input
                                                        className="admin-input"
                                                        value={social.icon}
                                                        onChange={(e) => {
                                                            const newSocials = [...settings.footer.dynamicSocials];
                                                            newSocials[idx].icon = e.target.value;
                                                            setSettings({ ...settings, footer: { ...settings.footer, dynamicSocials: newSocials } });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="form-label" style={{ fontSize: '0.65rem' }}>Lien (URL)</label>
                                                    <input
                                                        className="admin-input"
                                                        value={social.url}
                                                        onChange={(e) => {
                                                            const newSocials = [...settings.footer.dynamicSocials];
                                                            newSocials[idx].url = e.target.value;
                                                            setSettings({ ...settings, footer: { ...settings.footer, dynamicSocials: newSocials } });
                                                        }}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSocials = settings.footer.dynamicSocials.filter((_, i) => i !== idx);
                                                        setSettings({ ...settings, footer: { ...settings.footer, dynamicSocials: newSocials } });
                                                    }}
                                                    className="action-btn delete"
                                                    style={{ width: '100%', height: '45px' }}
                                                ><FaTrash size={14} /></button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSocials = [...(settings.footer.dynamicSocials || []), { name: "", icon: "", url: "" }];
                                                setSettings({ ...settings, footer: { ...settings.footer, dynamicSocials: newSocials } });
                                            }}
                                            style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px dashed var(--accent-color)', color: 'var(--accent-color)', padding: '10px 20px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            + Ajouter un réseau social
                                        </button>
                                    </div>
                                </div>

                                {/* Colonnes de Liens */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                                    {[1, 2, 3].map(num => (
                                        <div key={num} className="glass" style={{ padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <label className="form-label">Titre Colonne {num}</label>
                                                    <input
                                                        className="admin-input"
                                                        value={settings.footer[`col${num}Title`]}
                                                        onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, [`col${num}Title`]: e.target.value } })}
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1">
                                                    <label className="form-label">Liens Colonne {num}</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            className="admin-input"
                                                            placeholder="Nom du lien + Entrée"
                                                            value={num === 1 ? col1Input : num === 2 ? col2Input : col3Input}
                                                            onChange={(e) => num === 1 ? setCol1Input(e.target.value) : num === 2 ? setCol2Input(e.target.value) : setCol3Input(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    const val = e.target.value.trim();
                                                                    if (val) {
                                                                        const newLinks = [...settings.footer[`col${num}Links`], { name: val, url: "#" }];
                                                                        setSettings({ ...settings, footer: { ...settings.footer, [`col${num}Links`]: newLinks } });
                                                                        num === 1 ? setCol1Input("") : num === 2 ? setCol2Input("") : setCol3Input("");
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '5px', borderRadius: '5px' }}
                                                        >
                                                            <FaPlus size={10} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {settings.footer[`col${num}Links`].map((link, lIdx) => (
                                                        <span key={lIdx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {link.name}
                                                            <FaTimes
                                                                size={10}
                                                                style={{ cursor: 'pointer', opacity: 0.5 }}
                                                                onClick={() => {
                                                                    const newLinks = settings.footer[`col${num}Links`].filter((_, i) => i !== lIdx);
                                                                    setSettings({ ...settings, footer: { ...settings.footer, [`col${num}Links`]: newLinks } });
                                                                }}
                                                            />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ padding: '15px 40px', borderRadius: '15px', fontWeight: '900', boxShadow: '0 10px 30px rgba(255, 153, 0, 0.2)' }}>
                                    ENREGISTRER TOUS LES PARAMÈTRES
                                </button>
                            </form>
                        )}
                    </div>
                ) : activeTab === "home" ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {settings && (
                            <>
                                {/* Carousel Manager */}
                                <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>Carousel Principal</h3>
                                        <button
                                            onClick={() => {
                                                const currentCarousel = settings.home?.carousel || [];
                                                const newSlides = [...currentCarousel, { image: "", title: "", subtitle: "", color: "#ffffff", buttonText: "DÉCOUVRIR" }];
                                                setSettings({ ...settings, home: { ...settings.home, carousel: newSlides } });
                                            }}
                                            className="btn"
                                            style={{ background: 'var(--accent-color)', color: '#fff', fontSize: '0.8rem', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', boxShadow: '0 5px 15px rgba(255, 153, 0, 0.2)' }}
                                        >
                                            <FaPlus style={{ marginRight: '8px' }} /> AJOUTER SLIDE
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {(settings.home?.carousel || []).map((slide, idx) => (
                                            <div key={idx} className="glass" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.5fr 50px', gap: '15px', alignItems: 'center' }}>
                                                <div className="flex flex-col gap-1">
                                                    <label className="form-label">Image URL</label>
                                                    <input
                                                        className="admin-input"
                                                        value={slide.image}
                                                        onChange={(e) => {
                                                            const newSlides = [...settings.home.carousel];
                                                            newSlides[idx].image = e.target.value;
                                                            setSettings({ ...settings, home: { ...settings.home, carousel: newSlides } });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="form-label">Titre</label>
                                                    <input
                                                        className="admin-input"
                                                        value={slide.title}
                                                        onChange={(e) => {
                                                            const newSlides = [...settings.home.carousel];
                                                            newSlides[idx].title = e.target.value;
                                                            setSettings({ ...settings, home: { ...settings.home, carousel: newSlides } });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="form-label">Sous-titre</label>
                                                    <input
                                                        className="admin-input"
                                                        value={slide.subtitle}
                                                        onChange={(e) => {
                                                            const newSlides = [...settings.home.carousel];
                                                            newSlides[idx].subtitle = e.target.value;
                                                            setSettings({ ...settings, home: { ...settings.home, carousel: newSlides } });
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="form-label">Couleur</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="color"
                                                            value={slide.color}
                                                            onChange={(e) => {
                                                                const newSlides = [...settings.home.carousel];
                                                                newSlides[idx].color = e.target.value;
                                                                setSettings({ ...settings, home: { ...settings.home, carousel: newSlides } });
                                                            }}
                                                            style={{ width: '30px', height: '30px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                                                        />
                                                        <input
                                                            className="admin-input"
                                                            value={slide.color}
                                                            style={{ padding: '8px' }}
                                                            onChange={(e) => {
                                                                const newSlides = [...settings.home.carousel];
                                                                newSlides[idx].color = e.target.value;
                                                                setSettings({ ...settings, home: { ...settings.home, carousel: newSlides } });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newSlides = settings.home.carousel.filter((_, i) => i !== idx);
                                                        setSettings({ ...settings, home: { ...settings.home, carousel: newSlides } });
                                                    }}
                                                    className="action-btn delete"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats Cards Manager */}
                                <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff' }}>Cartes Statistiques (Gestion Cards)</h3>
                                        <button
                                            onClick={() => {
                                                const currentCards = settings.home?.statsCards || [];
                                                const newCards = [...currentCards, { title: "Nouveau", value: "0", icon: "FaShoppingCart", accent: "#0099ff", label: "INFO" }];
                                                setSettings({ ...settings, home: { ...settings.home, statsCards: newCards } });
                                            }}
                                            className="btn"
                                            style={{ background: 'var(--success)', color: '#000', fontSize: '0.8rem', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', boxShadow: '0 5px 15px rgba(46, 213, 115, 0.2)' }}
                                        >
                                            <FaPlus style={{ marginRight: '8px' }} /> AJOUTER CARTE
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                        {(settings.home?.statsCards || []).map((card, idx) => (
                                            <div key={idx} className="glass" style={{ padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                                <button
                                                    onClick={() => {
                                                        const newCards = settings.home.statsCards.filter((_, i) => i !== idx);
                                                        setSettings({ ...settings, home: { ...settings.home, statsCards: newCards } });
                                                    }}
                                                    className="action-btn delete"
                                                    style={{ position: 'absolute', top: '15px', right: '15px', width: '30px', height: '30px' }}
                                                >
                                                    <FaTrash size={12} />
                                                </button>

                                                <div className="flex flex-col gap-3">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="form-label">Titre</label>
                                                        <input
                                                            className="admin-input"
                                                            value={card.title}
                                                            onChange={(e) => {
                                                                const newCards = [...settings.home.statsCards];
                                                                newCards[idx].title = e.target.value;
                                                                setSettings({ ...settings, home: { ...settings.home, statsCards: newCards } });
                                                            }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="form-label">Valeur</label>
                                                            <input
                                                                className="admin-input"
                                                                value={card.value}
                                                                onChange={(e) => {
                                                                    const newCards = [...settings.home.statsCards];
                                                                    newCards[idx].value = e.target.value;
                                                                    setSettings({ ...settings, home: { ...settings.home, statsCards: newCards } });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="form-label">Badge</label>
                                                            <input
                                                                className="admin-input"
                                                                value={card.label}
                                                                onChange={(e) => {
                                                                    const newCards = [...settings.home.statsCards];
                                                                    newCards[idx].label = e.target.value;
                                                                    setSettings({ ...settings, home: { ...settings.home, statsCards: newCards } });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="form-label">Icône (Nom)</label>
                                                            <input
                                                                className="admin-input"
                                                                placeholder="ex: FaUser"
                                                                value={card.icon}
                                                                onChange={(e) => {
                                                                    const newCards = [...settings.home.statsCards];
                                                                    newCards[idx].icon = e.target.value;
                                                                    setSettings({ ...settings, home: { ...settings.home, statsCards: newCards } });
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <label className="form-label">Couleur</label>
                                                            <input
                                                                type="color"
                                                                value={card.accent}
                                                                onChange={(e) => {
                                                                    const newCards = [...settings.home.statsCards];
                                                                    newCards[idx].accent = e.target.value;
                                                                    setSettings({ ...settings, home: { ...settings.home, statsCards: newCards } });
                                                                }}
                                                                style={{ width: '100%', height: '45px', padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '10px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Best Sellers Manager */}
                                <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#fff', marginBottom: '20px' }}>Sélection Meilleures Ventes</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '20px' }}>Cochez les produits à afficher en page d'accueil.</p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                                        {products.map(p => (
                                            <div key={p._id}
                                                onClick={() => {
                                                    const currentList = settings.home?.bestSellers || [];
                                                    let newList;
                                                    if (currentList.includes(p._id)) {
                                                        newList = currentList.filter(id => id !== p._id);
                                                    } else {
                                                        newList = [...currentList, p._id];
                                                    }
                                                    setSettings({ ...settings, home: { ...settings.home, bestSellers: newList } });
                                                }}
                                                style={{
                                                    padding: '15px',
                                                    borderRadius: '16px',
                                                    background: (settings.home?.bestSellers || []).includes(p._id) ? 'rgba(255, 153, 0, 0.15)' : 'rgba(255,255,255,0.03)',
                                                    border: (settings.home?.bestSellers || []).includes(p._id) ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.05)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{
                                                    width: '20px', height: '20px', borderRadius: '6px',
                                                    border: '2px solid rgba(255,255,255,0.3)',
                                                    background: (settings.home?.bestSellers || []).includes(p._id) ? 'var(--accent-color)' : 'transparent',
                                                    borderColor: (settings.home?.bestSellers || []).includes(p._id) ? 'var(--accent-color)' : 'rgba(255,255,255,0.3)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {(settings.home?.bestSellers || []).includes(p._id) && <FaCheck color="white" size={12} />}
                                                </div>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: '800', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>${p.price}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleUpdateSettings} className="btn btn-primary" style={{ padding: '16px 40px', borderRadius: '16px', fontWeight: '900', fontSize: '1.1rem', marginTop: '20px', boxShadow: '0 10px 30px rgba(255, 87, 34, 0.4)' }}>
                                    ENREGISTER LES CHANGEMENTS HOME
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Utilisateur</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Solde Actuel</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Rang / Achats</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Statut</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div className="flex items-center gap-4">
                                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: u.email === 'feridadmin@admin.com' ? 'rgba(255, 153, 0, 0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.email === 'feridadmin@admin.com' ? 'var(--accent-color)' : '#fff', fontSize: '1.2rem', fontWeight: '900' }}>
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ color: '#fff', fontWeight: '800', fontSize: '1rem' }}>{u.username}</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: '600' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ color: 'var(--success)', fontWeight: '900', fontSize: '1.2rem' }}>${u.balance.toFixed(2)}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            {(() => {
                                                const rank = getRankDetail(u.purchaseCount || 0, settings?.ranks);
                                                return (
                                                    <div className="flex flex-col gap-1">
                                                        {rank && (
                                                            <div className="flex items-center gap-1" style={{ color: rank.color, fontSize: '0.7rem', fontWeight: '900' }}>
                                                                <FaMedal size={10} /> {rank.name.toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '800' }}>
                                                            {u.purchaseCount || 0} ACHATS RÉUSSIS
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            {u.isApproved !== false ? (
                                                <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: '900', background: 'rgba(46, 213, 115, 0.1)', padding: '5px 10px', borderRadius: '8px' }}>APPROUVÉ</span>
                                            ) : (
                                                <span style={{ color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: '900', background: 'rgba(255, 153, 0, 0.1)', padding: '5px 10px', borderRadius: '8px' }}>EN ATTENTE</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div className="flex gap-2">
                                                <button onClick={() => setShowBalanceModal(u)} className="action-btn success" title="Ajouter Solde"><FaWallet size={18} /></button>
                                                {u.isApproved === false && (
                                                    <button onClick={() => handleApproveUser(u)} className="action-btn" title="Approuver le compte" style={{ background: 'rgba(46, 213, 115, 0.1)', color: '#2ed573' }}>
                                                        <FaCheck size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals - Refined for Premium Feel */}
            {(showAddForm || isEditing) && (
                <div className="modal-overlay">
                    <div className="glass modal-content" style={{ animation: 'modalSlideUp 0.3s ease-out' }}>
                        <div className="flex justify-between items-center mb-8">
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '900' }}>
                                {showAddForm ? "Créer un Produit" : "Modifier le Produit"}
                            </h2>
                            <FaTimes
                                onClick={() => { setShowAddForm(false); setIsEditing(null); }}
                                style={{ color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: '0.3s' }}
                                className="hover:text-error"
                            />
                        </div>
                        <form onSubmit={showAddForm ? handleAddProduct : handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="form-label">Titre du Produit</label>
                                <input
                                    type="text"
                                    value={showAddForm ? newProduct.title : isEditing.title}
                                    className="admin-input"
                                    placeholder="Nom unique du produit"
                                    onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, title: e.target.value }) : setIsEditing({ ...isEditing, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="form-label">Prix Actuel ($)</label>
                                    <input
                                        type="number"
                                        value={showAddForm ? newProduct.price : isEditing.price}
                                        className="admin-input"
                                        onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, price: parseFloat(e.target.value) }) : setIsEditing({ ...isEditing, price: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="form-label">Prix Barré ($)</label>
                                    <input
                                        type="number"
                                        value={showAddForm ? newProduct.oldPrice : isEditing.oldPrice}
                                        className="admin-input"
                                        onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, oldPrice: parseFloat(e.target.value) }) : setIsEditing({ ...isEditing, oldPrice: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="form-label">URL de l'Image</label>
                                    <input
                                        type="text"
                                        value={showAddForm ? newProduct.image : isEditing.image}
                                        className="admin-input"
                                        onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, image: e.target.value }) : setIsEditing({ ...isEditing, image: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="form-label">Catégorie</label>
                                    <select
                                        className="admin-input"
                                        value={showAddForm ? newProduct.category : isEditing.category}
                                        onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, category: e.target.value, subcategory: "" }) : setIsEditing({ ...isEditing, category: e.target.value, subcategory: "" })}
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories.map((c) => (
                                            <option key={c._id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>

                                    {/* Subcategory Select - Rendered inside the same column */}
                                    {(showAddForm ? newProduct.category : isEditing.category) &&
                                        categories.find(c => c.name === (showAddForm ? newProduct.category : isEditing.category))?.subcategories?.length > 0 && (
                                            <div style={{ marginTop: '8px' }}>
                                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Sous-catégorie</label>
                                                <select
                                                    className="admin-input"
                                                    value={showAddForm ? newProduct.subcategory : isEditing.subcategory}
                                                    onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, subcategory: e.target.value }) : setIsEditing({ ...isEditing, subcategory: e.target.value })}
                                                >
                                                    <option value="">Sélectionner une sous-catégorie</option>
                                                    {categories.find(c => c.name === (showAddForm ? newProduct.category : isEditing.category)).subcategories.map((sub, idx) => (
                                                        <option key={idx} value={sub}>{sub}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="form-label">Clés de Licence (Séparez par des virgules)</label>
                                <textarea
                                    placeholder="ABCD-1234, EFGH-5678..."
                                    className="admin-input"
                                    style={{ height: '120px', fontFamily: 'monospace', resize: 'none' }}
                                    onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, keysInput: e.target.value }) : setIsEditing({ ...isEditing, keysInput: e.target.value })}
                                    required={showAddForm}
                                ></textarea>
                                {isEditing && <p style={{ color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: '800', opacity: 0.8 }}>* Les nouvelles clés seront ajoutées au stock existant.</p>}
                            </div>

                            <button type="submit" className="btn btn-primary btn-submit" style={{
                                padding: '18px',
                                borderRadius: '16px',
                                fontWeight: '900',
                                fontSize: '1rem',
                                letterSpacing: '1px',
                                border: 'none',
                                background: 'linear-gradient(135deg, var(--accent-color) 0%, #ff5722 100%)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                marginTop: '10px'
                            }}>
                                {showAddForm ? "PUBLIER LE PRODUIT" : "ENREGISTRER LES MODIFICATIONS"}
                            </button>
                        </form>
                    </div>
                </div >
            )}

            {/* Category Form Modal */}
            {
                (showCategoryForm || isEditingCategory) && (
                    <div className="modal-overlay">
                        <div className="glass modal-content" style={{ maxWidth: '450px' }}>
                            <div className="flex justify-between items-center mb-8">
                                <h2 style={{ fontSize: '1.6rem', fontWeight: '900' }}>
                                    {showCategoryForm ? "Nouvelle Catégorie" : "Modifier Catégorie"}
                                </h2>
                                <FaTimes onClick={() => { setShowCategoryForm(false); setIsEditingCategory(null); }} style={{ cursor: 'pointer', opacity: 0.5 }} />
                            </div>
                            <form onSubmit={showCategoryForm ? handleAddCategory : handleUpdateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="flex flex-col gap-2">
                                    <label className="form-label">Nom de la Catégorie</label>
                                    <input
                                        className="admin-input"
                                        placeholder="Ex: IPTV, Gaming..."
                                        value={showCategoryForm ? newCategory.name : isEditingCategory.name}
                                        onChange={(e) => showCategoryForm ? setNewCategory({ ...newCategory, name: e.target.value }) : setIsEditingCategory({ ...isEditingCategory, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="form-label">Icône (Unicode ou URL)</label>
                                    <input
                                        className="admin-input"
                                        placeholder="Ex: 📺, 🎮, ou URL image"
                                        value={showCategoryForm ? newCategory.icon : isEditingCategory.icon}
                                        onChange={(e) => showCategoryForm ? setNewCategory({ ...newCategory, icon: e.target.value }) : setIsEditingCategory({ ...isEditingCategory, icon: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="form-label">Sous-catégories</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            className="admin-input"
                                            placeholder="Ajouter une sous-catégorie"
                                            value={tempSubcategory}
                                            onChange={(e) => setTempSubcategory(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (tempSubcategory.trim()) {
                                                        const current = showCategoryForm ? newCategory : isEditingCategory;
                                                        const setter = showCategoryForm ? setNewCategory : setIsEditingCategory;
                                                        setter({ ...current, subcategories: [...(current.subcategories || []), tempSubcategory.trim()] });
                                                        setTempSubcategory("");
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn"
                                            style={{ background: 'rgba(255,255,255,0.1)', padding: '0 15px', borderRadius: '12px' }}
                                            onClick={() => {
                                                if (tempSubcategory.trim()) {
                                                    const current = showCategoryForm ? newCategory : isEditingCategory;
                                                    const setter = showCategoryForm ? setNewCategory : setIsEditingCategory;
                                                    setter({ ...current, subcategories: [...(current.subcategories || []), tempSubcategory.trim()] });
                                                    setTempSubcategory("");
                                                }
                                            }}
                                        >
                                            <FaPlus />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                        {(showCategoryForm ? newCategory.subcategories : isEditingCategory.subcategories)?.map((sub, idx) => (
                                            <span key={idx} style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                {sub}
                                                <FaTimes
                                                    size={12}
                                                    style={{ cursor: 'pointer', opacity: 0.7 }}
                                                    onClick={() => {
                                                        const current = showCategoryForm ? newCategory : isEditingCategory;
                                                        const setter = showCategoryForm ? setNewCategory : setIsEditingCategory;
                                                        setter({ ...current, subcategories: current.subcategories.filter((_, i) => i !== idx) });
                                                    }}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="form-label">Description (Interne - Optionnel)</label>
                                    <textarea
                                        className="admin-input"
                                        placeholder="Description pour usage admin uniquement..."
                                        value={showCategoryForm ? newCategory.description : isEditingCategory.description}
                                        onChange={(e) => showCategoryForm ? setNewCategory({ ...newCategory, description: e.target.value }) : setIsEditingCategory({ ...isEditingCategory, description: e.target.value })}
                                        style={{ height: '80px', resize: 'none' }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ padding: '16px', borderRadius: '14px', background: 'var(--success)', fontWeight: '800' }}>
                                    {showCategoryForm ? "CRÉER LA CATÉGORIE" : "METTRE À JOUR"}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                showBalanceModal && (
                    <div className="modal-overlay">
                        <div className="glass modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
                            <div style={{
                                width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(46, 213, 115, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)',
                                margin: '0 auto 20px'
                            }}>
                                <FaWallet size={30} />
                            </div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '10px' }}>Ajouter du Solde</h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600', marginBottom: '30px' }}>
                                Créditer le compte de <strong style={{ color: '#fff' }}>{showBalanceModal.username}</strong>
                            </p>

                            <input
                                type="number"
                                autoFocus
                                className="admin-input"
                                style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', color: 'var(--success)' }}
                                value={balanceAmount}
                                onChange={(e) => setBalanceAmount(e.target.value)}
                            />

                            <div className="flex gap-4 mt-8">
                                <button onClick={handleAddBalance} className="btn btn-primary flex-1" style={{ borderRadius: '12px' }}>CONFIRMER</button>
                                <button onClick={() => setShowBalanceModal(null)} className="btn" style={{ background: 'rgba(255,255,255,0.05)', flex: 1, borderRadius: '12px', color: '#fff' }}>ANNULER</button>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                .sidebar-link:hover { background: rgba(255,255,255,0.03) !important; color: #fff !important; }
                .action-btn { 
                    width: 42px; height: 42px; border: 1px solid rgba(255,255,255,0.1); borderRadius: 12px; 
                    display: flex !important; align-items: center !important; justify-content: center !important; 
                    cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none;
                    background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7);
                    padding: 0; margin: 0;
                }
                .action-btn.edit:hover { background: var(--accent-color); color: #000; border-color: var(--accent-color); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255, 153, 0, 0.2); }
                .action-btn.delete:hover { background: #ff4757; color: #fff; border-color: #ff4757; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255, 71, 87, 0.2); }
                .action-btn.success:hover { background: var(--success); color: #000; border-color: var(--success); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(46, 213, 115, 0.2); }
                
                .modal-overlay { 
                    position: fixed; inset: 0; background: rgba(5,6,12,0.92); 
                    z-index: 2000; display: flex; align-items: center; justify-content: center; 
                    backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
                }
                .modal-content { 
                    width: 95%; maxWidth: 600px; padding: 40px; borderRadius: 32px; 
                    border: 1px solid rgba(255,255,255,0.1); position: relative;
                    background: linear-gradient(135deg, rgba(20,22,40,0.95), rgba(15,16,32,0.98));
                    box-shadow: 0 25px 80px rgba(0,0,0,0.5);
                }
                .admin-input { 
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); 
                    color: #fff; padding: 14px 18px; borderRadius: 14px; width: 100%; outline: none;
                    transition: all 0.3s; font-weight: 600; font-size: 0.95rem;
                }
                .admin-input:focus { border-color: var(--accent-color); background: rgba(255,153,0,0.05); box-shadow: 0 0 20px rgba(255, 153, 0, 0.1); }
                .form-label { font-size: 0.75rem; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px; }
                .btn-submit:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(255, 87, 34, 0.3); filter: brightness(1.1); }
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
            {/* Fulfillment Logs Modal */}
            {
                showLogModal && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div className="glass" style={{
                            width: '100%',
                            maxWidth: '550px',
                            padding: '40px',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, rgba(13, 14, 26, 0.95) 0%, rgba(20, 21, 38, 0.95) 100%)',
                            border: '1px solid rgba(46, 213, 115, 0.3)',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                background: 'rgba(46, 213, 115, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                color: 'var(--success)'
                            }}>
                                <FaUserCheck size={30} />
                            </div>

                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', textAlign: 'center', marginBottom: '10px' }}>
                                Traitement Automatique Réussi !
                            </h2>
                            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '30px' }}>
                                Les codes suivants ont été envoyés automatiquement aux clients en attente.
                            </p>

                            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '12px', padding: '5px' }}>
                                {fulfillmentLogs.map((log, idx) => (
                                    <div key={idx} className="glass" style={{ padding: '15px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>Client</div>
                                            <div style={{ fontWeight: '800', color: '#fff' }}>{log.username}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>Code Envoyé</div>
                                            <div style={{ fontWeight: '900', color: 'var(--success)', fontFamily: 'monospace', letterSpacing: '1px' }}>{log.licenseKey}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowLogModal(false)}
                                className="btn btn-primary w-full"
                                style={{ padding: '16px', borderRadius: '14px', background: 'var(--success)', boxShadow: '0 8px 20px rgba(46, 213, 115, 0.2)' }}
                            >
                                D'ACCORD, COMPRIS
                            </button>
                        </div>
                    </div>
                )
            }
            {/* Fulfillment Modal */}
            {
                showFulfillModal && (
                    <div className="modal-overlay">
                        <div className="glass modal-content" style={{ maxWidth: '420px', textAlign: 'center' }}>
                            <div style={{
                                width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(46, 213, 115, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)',
                                margin: '0 auto 20px'
                            }}>
                                <FaKey size={30} />
                            </div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '10px' }}>Valider la Commande</h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600', marginBottom: '30px' }}>
                                Envoyer le code pour <strong style={{ color: '#fff' }}>{showFulfillModal.productTitle}</strong> à <strong style={{ color: '#fff' }}>{showFulfillModal.userId?.username}</strong>
                            </p>

                            <input
                                type="text"
                                autoFocus
                                placeholder="Entrez le code de licence..."
                                className="admin-input"
                                style={{ textAlign: 'center', fontWeight: '900' }}
                                value={manualKey}
                                onChange={(e) => setManualKey(e.target.value)}
                            />

                            <div className="flex gap-4 mt-8">
                                <button onClick={handleFulfillOrder} className="btn btn-primary flex-1" style={{ borderRadius: '12px', background: 'var(--success)' }}>ENVOYER LE CODE</button>
                                <button onClick={() => setShowFulfillModal(null)} className="btn" style={{ background: 'rgba(255,255,255,0.05)', flex: 1, borderRadius: '12px', color: '#fff' }}>ANNULER</button>
                            </div>
                        </div>
                    </div>
                )
            }

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
        </div >
    );
};

export default Admin;
