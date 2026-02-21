import { useState, useEffect } from "react";

import API_BASE_URL from "../config/api";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaTag, FaKey, FaBoxOpen, FaUsers, FaDolly, FaWallet, FaUserShield, FaUserCheck, FaChartLine, FaShoppingBag, FaUserFriends, FaExclamationTriangle, FaCog, FaMedal, FaTrophy, FaStar, FaHome, FaCheck, FaGift, FaHistory, FaEye, FaBars, FaChartBar } from "react-icons/fa";
import ConfirmModal from "../components/ConfirmModal";
import AlertModal from "../components/AlertModal";
import Toast from "../components/Toast";
import SEO from "../components/SEO";

const Admin = () => {
    const [activeTab, setActiveTab] = useState("products");
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [demos, setDemos] = useState([]); // demos state
    const [newDemo, setNewDemo] = useState({ serviceName: "", description: "", image: "", contentListText: "" }); // new demo state
    const [resetRequests, setResetRequests] = useState([]);
    const [resetOptions, setResetOptions] = useState([]);
    const [newOptionLabel, setNewOptionLabel] = useState("");
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isLargeDesktop = windowWidth >= 1147;

    // ... existing states ...
    const [isEditing, setIsEditing] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBalanceModal, setShowBalanceModal] = useState(null);
    const [balanceAmount, setBalanceAmount] = useState(0);
    const [fulfillmentLogs, setFulfillmentLogs] = useState([]);
    const [providerPackages, setProviderPackages] = useState([]);
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

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null, type: "warning" });
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "", type: "success" });
    const [toast, setToast] = useState(null);
    const [historySearch, setHistorySearch] = useState("");
    const [historyStatusFilter, setHistoryStatusFilter] = useState("ALL");
    const [col2Input, setCol2Input] = useState("");
    const [col3Input, setCol3Input] = useState("");

    const triggerToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    // Selection States
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);

    const [newProduct, setNewProduct] = useState({
        title: "",
        description: "",
        price: 0,
        oldPrice: 0,
        hasDiscount: false,
        image: "",
        category: "PC",
        keysInput: "",
        type: "normal",
        provider: "neo",
        pack: "",
        duration: 12,
        showBouquetSorter: true,
        bouquetNames: {},
        durationPrices: []
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
        fetchResetData();
    }, []);

    useEffect(() => {
        const isAnyModalOpen = showBalanceModal || showLogModal || showFulfillModal || showAddForm || isEditingCategory || showCategoryForm;
        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showBalanceModal, showLogModal, showFulfillModal, showAddForm, isEditingCategory, showCategoryForm]);

    const fetchDemos = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/demos`);
            setDemos(res.data);
        } catch (err) {
            console.error("Error fetching demos:", err);
        }
    };

    const fetchResetData = async () => {
        try {
            const reqRes = await axios.get(`${API_BASE_URL}/reset-codes`);
            setResetRequests(reqRes.data);
            const optRes = await axios.get(`${API_BASE_URL}/reset-codes/options`);
            setResetOptions(optRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddOption = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/reset-codes/options`, { label: newOptionLabel, value: newOptionLabel.toLowerCase().replace(/\s+/g, '-') });
            setNewOptionLabel("");
            fetchResetData();
            triggerToast("Option ajoutée avec succès.");
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteOption = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/reset-codes/options/${id}`);
            fetchResetData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateResetStatus = async (id, status) => {
        try {
            await axios.put(`${API_BASE_URL}/reset-codes/${id}`, { status });
            fetchResetData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddDemo = async (e) => {
        e.preventDefault();
        try {
            const contentList = newDemo.contentListText.split('\n').filter(line => line.trim() !== "");
            await axios.post(`${API_BASE_URL}/demos`, {
                serviceName: newDemo.serviceName,
                description: newDemo.description,
                image: newDemo.image,
                contentList
            });
            setNewDemo({ serviceName: "", description: "", image: "", contentListText: "" });
            fetchDemos();
            triggerToast("Les démos ont été ajoutées avec succès.");
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
                    await axios.delete(`${API_BASE_URL}/demos/${id}`);
                    fetchDemos();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    triggerToast("Le compte demo a été supprimé.");
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
                    await axios.post(`${API_BASE_URL}/orders/refund/${orderId}`);
                    fetchOrders();
                    fetchUsers();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    triggerToast("Le montant a été recrédité au client.");
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
            const res = await axios.get(`${API_BASE_URL}/settings`);
            setSettings(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API_BASE_URL}/settings`, settings);
            setSettings(res.data);
            triggerToast("Paramètres mis à jour.");
        } catch (err) {
            console.error(err);
            setAlertModal({ isOpen: true, title: "Erreur", message: "Erreur lors de la mise à jour des paramètres.", type: "error" });
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/orders`);
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

    const handleMarkAllSeen = async () => {
        try {
            await axios.put(`${API_BASE_URL}/orders/mark-all-seen`);
            fetchOrders();
            triggerToast("Tous les nouveaux ordres ont été marqués comme vus.");
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/products`);
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

    const handleDeleteUser = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer l'utilisateur ?",
            message: "Cette action est irréversible. L'utilisateur et toutes ses données seront supprimés.",
            type: "danger",
            confirmColor: "#ff4757",
            confirmText: "SUPPRIMER",
            onConfirm: async () => {
                try {
                    await axios.delete(`${API_BASE_URL}/users/${id}`);
                    fetchUsers();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    triggerToast("L'utilisateur a été supprimé.");
                } catch (err) {
                    console.error(err);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Erreur", message: "Impossible de supprimer l'utilisateur.", type: "error" });
                }
            }
        });
    };

    const handleBulkDeleteUsers = async () => {
        if (selectedUsers.length === 0) return;
        setConfirmModal({
            isOpen: true,
            title: `Supprimer ${selectedUsers.length} utilisateurs ?`,
            message: "Cette action supprimera définitivement les utilisateurs sélectionnés.",
            type: "danger",
            onConfirm: async () => {
                try {
                    await axios.post(`${API_BASE_URL}/users/bulk-delete`, { userIds: selectedUsers });
                    fetchUsers();
                    setSelectedUsers([]);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    triggerToast(`${selectedUsers.length} utilisateurs supprimés.`);
                } catch (err) {
                    console.error(err);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Erreur", message: "Échec de la suppression groupée.", type: "error" });
                }
            }
        });
    };

    const handleDeleteOrder = async (id) => {
        setConfirmModal({
            isOpen: true,
            title: "Supprimer cette commande ?",
            message: "Cette action est irréversible. L'historique de cette vente sera perdu.",
            type: "danger",
            confirmText: "SUPPRIMER",
            onConfirm: async () => {
                try {
                    await axios.delete(`${API_BASE_URL}/orders/${id}`);
                    fetchOrders();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    triggerToast("La commande a été supprimée.");
                } catch (err) {
                    console.error(err);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Erreur", message: "Impossible de supprimer la commande.", type: "error" });
                }
            }
        });
    };

    const handleBulkDeleteOrders = async () => {
        if (selectedOrders.length === 0) return;
        setConfirmModal({
            isOpen: true,
            title: `Supprimer ${selectedOrders.length} commandes ?`,
            message: "Cette action supprimera définitivement les commandes sélectionnées.",
            type: "danger",
            onConfirm: async () => {
                try {
                    await axios.post(`${API_BASE_URL}/orders/bulk-delete`, { orderIds: selectedOrders });
                    fetchOrders();
                    setSelectedOrders([]);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    triggerToast(`${selectedOrders.length} commandes supprimées.`);
                } catch (err) {
                    console.error(err);
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    setAlertModal({ isOpen: true, title: "Erreur", message: "Échec de la suppression groupée.", type: "error" });
                }
            }
        });
    };

    const handleToggleSelect = (id, type) => {
        if (type === 'user') {
            setSelectedUsers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else if (type === 'order') {
            setSelectedOrders(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        }
    };


    const handleDeleteKey = async (productId, keyId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce code ?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/products/${productId}/keys/${keyId}`);
            // Update local state
            setIsEditing(prev => ({
                ...prev,
                keys: prev.keys.filter(k => k._id !== keyId)
            }));
            fetchProducts(); // Refresh main list
        } catch (err) {
            console.error("Error deleting key:", err);
            setAlertModal({ isOpen: true, title: "Erreur", message: "Impossible de supprimer le code.", type: "error" });
        }
    };

    const handleUpdateKey = async (productId, keyId, currentVal) => {
        const newVal = window.prompt("Modifier le code:", currentVal);
        if (newVal === null || newVal.trim() === "") return;

        try {
            await axios.put(`${API_BASE_URL}/products/${productId}/keys/${keyId}`, { newKey: newVal });
            // Update local state
            setIsEditing(prev => ({
                ...prev,
                keys: prev.keys.map(k => k._id === keyId ? { ...k, key: newVal } : k)
            }));
            fetchProducts();
        } catch (err) {
            console.error("Error updating key:", err);
            setAlertModal({ isOpen: true, title: "Erreur", message: "Impossible de modifier le code.", type: "error" });
        }
    };


    const fetchProviderPackages = async (provider) => {
        if (!provider || provider === 'normal') return;
        try {
            const res = await axios.get(`${API_BASE_URL}/${provider}/packages`);
            // Normalize data (some APIs return array, others object)
            const pkgs = Array.isArray(res.data) ? res.data : Object.values(res.data || {});
            setProviderPackages(pkgs);
        } catch (err) {
            console.error(`Error fetching packages for ${provider}:`, err);
            setProviderPackages([]);
        }
    };

    useEffect(() => {
        if (showAddForm && newProduct.type !== 'normal') {
            fetchProviderPackages(newProduct.provider);
        }
    }, [showAddForm, newProduct.provider, newProduct.type]);

    useEffect(() => {
        if (isEditing && isEditing.type !== 'normal') {
            fetchProviderPackages(isEditing.provider);
        }
    }, [isEditing, isEditing?.provider, isEditing?.type]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/categories`);
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (showAddForm) {
                setNewProduct({ ...newProduct, image: res.data.filePath });
            } else {
                setIsEditing({ ...isEditing, image: res.data.filePath });
            }
        } catch (err) {
            console.error("Error uploading image:", err);
            alert("Erreur lors de l'upload de l'image");
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/categories`, newCategory);
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
            await axios.put(`${API_BASE_URL}/categories/${isEditingCategory._id}`, isEditingCategory);
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
                    await axios.delete(`${API_BASE_URL}/categories/${id}`);
                    fetchCategories();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    triggerToast("La catégorie a été supprimée.");
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
            const res = await axios.get(`${API_BASE_URL}/users`);
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
                    await axios.delete(`${API_BASE_URL}/products/${id}`);
                    fetchProducts();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    triggerToast("Le produit a été supprimé.");
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
            await axios.post(`${API_BASE_URL}/products`, { ...newProduct, keys: keysArray });
            setNewProduct({
                title: "",
                description: "",
                price: 0,
                oldPrice: 0,
                hasDiscount: false,
                image: "",
                category: "PC",
                keysInput: "",
                type: "normal",
                provider: "neo",
                pack: "",
                duration: 12
            });
            setShowAddForm(false);
            fetchProducts();
            triggerToast("Produit créé avec succès.");
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
            const res = await axios.put(`${API_BASE_URL}/products/${isEditing._id}`, updatedData);
            setIsEditing(null);
            fetchProducts();
            triggerToast("Produit mis à jour.");

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
            await axios.post(`${API_BASE_URL}/users/add-balance`, {
                userId: showBalanceModal._id,
                amount: balanceAmount
            });
            setShowBalanceModal(null);
            setBalanceAmount(0);
            fetchUsers();
            triggerToast(`Solde ajouté avec succès à ${showBalanceModal.username}`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFulfillOrder = async () => {
        try {
            await axios.put(`${API_BASE_URL}/orders/fulfill/${showFulfillModal._id}`, {
                licenseKey: manualKey
            });
            setShowFulfillModal(null);
            setManualKey("");
            fetchOrders();
            triggerToast("Commande validée et code envoyé.");
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
                    await axios.post(`${API_BASE_URL}/auth/approve-user/${user._id}`);
                    fetchUsers();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                    triggerToast("Utilisateur approuvé et email envoyé.");
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
        unseenOrders: orders.filter(o => o.status === 'PENDING' && !o.isSeen).length,
        totalAvailableValue: products.reduce((acc, p) => acc + (p.price * (p.keys?.filter(k => !k.isSold).length || 0)), 0),
    };

    const SidebarItem = ({ id, label, icon: Icon, badge }) => (
        <button
            onClick={() => { setActiveTab(id); if (!isLargeDesktop) setIsMobileMenuOpen(false); }}
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
            <span style={{ flex: 1 }}>{label}</span>
            {badge > 0 && (
                <span style={{
                    background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    minWidth: '22px',
                    height: '22px',
                    borderRadius: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 6px',
                    fontWeight: '900',
                    boxShadow: '0 4px 12px rgba(255, 71, 87, 0.4)',
                    border: '2px solid rgba(255,255,255,0.1)'
                }}>
                    {badge}
                </span>
            )}
        </button>
    );

    const StatCard = ({ label, value, icon: Icon, color }) => {
        const isSmall = !isLargeDesktop;
        return (
            <div className="glass" style={{
                padding: isSmall ? '15px' : '25px',
                borderRadius: isSmall ? '16px' : '20px',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: isSmall ? '12px' : '20px',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                minWidth: isSmall ? '140px' : '200px'
            }}>
                <div style={{
                    width: isSmall ? '40px' : '56px',
                    height: isSmall ? '40px' : '56px',
                    borderRadius: isSmall ? '12px' : '16px',
                    background: `rgba(${color}, 0.12)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: `rgb(${color})`
                }}>
                    <Icon size={isSmall ? 18 : 24} />
                </div>
                <div>
                    <div style={{ fontSize: isSmall ? '0.65rem' : '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>{label}</div>
                    <div style={{ fontSize: isSmall ? '1.1rem' : '1.6rem', fontWeight: '900', color: '#fff' }}>{value}</div>
                </div>
            </div>
        );
    };


    /* ... */

    /* ... Dashboard Header text logic ... */
    /* activeTab === "ranks" ? "Système de Rangs" : activeTab === "demos" ? "Gestion des Demos" : ... */

    /* ... Content View ... */
    /* ... inside ternary ... */





    return (
        <div style={{ minHeight: '100vh', background: '#0a0b14', display: 'flex', color: '#fff' }}>
            <SEO title="Administration | Skygros Panel" noindex={true} />
            {/* Sidebar Overlay for mobile */}
            {!isLargeDesktop && isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 140
                    }}
                />
            )}

            {/* Sidebar */}
            <div style={{
                width: isLargeDesktop ? '300px' : '280px',
                background: '#0d0e1a',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                padding: isLargeDesktop ? '40px 24px' : '30px 20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 150,
                transition: '0.3s ease-in-out',
                left: isLargeDesktop ? 0 : (isMobileMenuOpen ? 0 : '-300px')
            }}>
                {/* Mobile Sidebar Header */}
                {!isLargeDesktop && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-color)' }}>SKYGROS ADMIN</h2>
                        <FaTimes onClick={() => setIsMobileMenuOpen(false)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }} />
                    </div>
                )}


                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <SidebarItem id="products" label="Gestion Produits" icon={FaBoxOpen} />
                    <SidebarItem id="categories" label="Gestion Catégories" icon={FaTag} />
                    <SidebarItem id="orders" label="Gestion Commandes" icon={FaShoppingBag} badge={stats.unseenOrders} />
                    <SidebarItem id="historique" label="Historique Ventes" icon={FaHistory} />
                    <SidebarItem id="users" label="Gestion Clients" icon={FaUsers} />
                    <SidebarItem id="ranks" label="Système de Rangs" icon={FaMedal} />
                    <SidebarItem id="demos" label="Gestion Demos" icon={FaGift} />
                    <SidebarItem id="resetcodes" label="Gestion Reset Codes" icon={FaTimes} badge={resetRequests.filter(r => r.status === 'PENDING').length} />
                    <SidebarItem id="settings" label="Paramètres Généraux" icon={FaCog} />
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
            <div style={{
                flex: 1,
                marginLeft: isLargeDesktop ? '300px' : '0',
                padding: isLargeDesktop ? '50px 60px' : '30px 20px 100px 20px',
                minWidth: 0 // Prevent flex-basis overflow
            }}>

                {/* Dashboard Header */}
                <div style={{
                    display: 'flex',
                    flexDirection: isLargeDesktop ? 'row' : 'column',
                    justifyContent: 'space-between',
                    alignItems: isLargeDesktop ? 'center' : 'flex-start',
                    marginBottom: '40px',
                    gap: isLargeDesktop ? '0' : '25px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {!isLargeDesktop && (
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    color: '#fff',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaBars size={20} />
                            </button>
                        )}
                        <div>
                            <h1 style={{ fontSize: isLargeDesktop ? '2.2rem' : '1.5rem', fontWeight: '900', marginBottom: '8px' }}>
                                {activeTab === "products" ? "Inventaire des Produits" :
                                    activeTab === "categories" ? "Gestion des Catégories" :
                                        activeTab === "orders" ? "Gestion des Commandes" :
                                            activeTab === "historique" ? "Historique des Ventes" :
                                                activeTab === "ranks" ? "Système de Rangs" :
                                                    activeTab === "demos" ? "Gestion des Demos" :
                                                        activeTab === "resetcodes" ? "Demandes de Reset Code" :
                                                            activeTab === "settings" ? "Paramètres Généraux" : "Base de Données Clients"}
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: isLargeDesktop ? '1rem' : '0.85rem' }}>
                                {activeTab === "products" ? "Gérez vos catalogues de clés digitales et stocks." :
                                    activeTab === "categories" ? "Organisez vos produits par types et icônes." :
                                        activeTab === "orders" ? "Suivez et validez les achats en attente." :
                                            activeTab === "historique" ? "Consultez toutes les transactions passées." :
                                                activeTab === "ranks" ? "Définissez les paliers de fidélité et récompenses." :
                                                    activeTab === "demos" ? "Gérez les comptes d'essai et démos." :
                                                        activeTab === "settings" ? "Configurez les informations globales du site." : "Gérez les permissions et soldes de vos clients."}
                            </p>
                        </div>
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
                    {activeTab === "orders" && (
                        <button
                            onClick={handleMarkAllSeen}
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
                            <FaEye /> MARQUER COMME VU
                        </button>
                    )}
                </div>

                {/* Quick Stats */}
                {isLargeDesktop ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
                        gap: '20px',
                        marginBottom: '40px'
                    }}>
                        <StatCard label="Total Produits" value={stats.totalProducts} icon={FaShoppingBag} color="255, 153, 0" />
                        <StatCard label="Commandes en attente" value={stats.pendingOrders} icon={FaDolly} color="255, 71, 87" />
                        <StatCard label="Stock Total" value={stats.totalKeys} icon={FaKey} color="46, 213, 115" />
                        <StatCard label="Valeur Stock" value={`$${stats.totalAvailableValue.toFixed(2)}`} icon={FaWallet} color="10, 191, 255" />
                        <StatCard label="Clients" value={stats.totalUsers} icon={FaUserFriends} color="162, 155, 254" />
                    </div>
                ) : (
                    <div style={{ marginBottom: '30px' }}>
                        <button
                            onClick={() => setShowStatsModal(true)}
                            className="glass hover-lift"
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 153, 0, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                color: 'var(--accent-color)',
                                fontWeight: '900',
                                fontSize: '0.9rem',
                                letterSpacing: '1px',
                                background: 'rgba(255, 153, 0, 0.05)'
                            }}
                        >
                            <FaChartBar size={18} /> VOIR LES STATISTIQUES DU PANEL
                        </button>
                    </div>
                )}

                {/* Content View */}
                {activeTab === "products" ? (
                    <div className="glass" style={{ borderRadius: '24px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isLargeDesktop ? 'auto' : '900px' }}>
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
                                    const isOutOfStock = p.type === 'normal' && availableKeys === 0;

                                    return (
                                        <tr key={p._id} style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            filter: isOutOfStock ? 'grayscale(0.5)' : 'none',
                                            opacity: isOutOfStock ? 0.8 : 1
                                        }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div className="flex items-center gap-4">
                                                    <div style={{ position: 'relative' }}>
                                                        <img src={p.image} style={{ width: '45px', height: '62px', objectFit: 'cover', borderRadius: '8px' }} alt="" />
                                                        {isOutOfStock && (
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
                                                {p.type === 'normal' ? (
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
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            background: 'rgba(var(--accent-color-rgb), 0.1)',
                                                            color: 'var(--accent-color)',
                                                            borderRadius: '6px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '900',
                                                            border: '1px solid rgba(var(--accent-color-rgb), 0.2)'
                                                        }}>
                                                            STOCK API
                                                        </span>
                                                        {totalKeys > 0 && (
                                                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: availableKeys > 0 ? 'var(--success)' : 'rgba(255,255,255,0.3)' }}>
                                                                <FaKey size={10} style={{ marginRight: '4px' }} />
                                                                {availableKeys} Codes
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
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
                    <div className="glass" style={{ borderRadius: '24px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isLargeDesktop ? 'auto' : '800px' }}>
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
                    <div className="glass" style={{ borderRadius: '24px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isLargeDesktop ? 'auto' : '900px' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '24px 10px 24px 24px', width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.length === orders.filter(o => o.status === 'PENDING').length && orders.filter(o => o.status === 'PENDING').length > 0}
                                            onChange={(e) => setSelectedOrders(e.target.checked ? orders.filter(o => o.status === 'PENDING').map(o => o._id) : [])}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Client</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Produit</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Code / Statut</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrders.length > 0 && activeTab === "orders" && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '10px 24px', background: 'rgba(255, 71, 87, 0.05)' }}>
                                            <div className="flex items-center gap-3">
                                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--error)' }}>{selectedOrders.length} sélectionnés</span>
                                                <button onClick={handleBulkDeleteOrders} className="btn" style={{ background: 'var(--error)', color: '#fff', fontSize: '0.7rem', padding: '5px 12px', borderRadius: '6px' }}>
                                                    SUPPRIMER LA SÉLECTION
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {orders.filter(o => o.status === 'PENDING').map((o) => (
                                    <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: selectedOrders.includes(o._id) ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(o._id)}
                                                onChange={() => handleToggleSelect(o._id, 'order')}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
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
                                            <button onClick={() => handleDeleteOrder(o._id)} className="action-btn delete" title="Supprimer"><FaTrash size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : activeTab === "historique" ? (
                    <div className="flex flex-col gap-6">
                        {/* History Filters */}
                        <div className="glass" style={{
                            padding: isLargeDesktop ? '20px' : '12px',
                            borderRadius: '20px',
                            display: 'flex',
                            gap: isLargeDesktop ? '20px' : '10px',
                            alignItems: 'center',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder={isLargeDesktop ? "Rechercher par client, produit ou code..." : "Rechercher..."}
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                    style={{
                                        paddingLeft: isLargeDesktop ? '45px' : '35px',
                                        fontSize: isLargeDesktop ? '1rem' : '0.85rem'
                                    }}
                                />
                                <FaShoppingBag style={{
                                    position: 'absolute',
                                    left: isLargeDesktop ? '18px' : '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    opacity: 0.3,
                                    fontSize: isLargeDesktop ? '18px' : '14px'
                                }} />
                            </div>
                            <div style={{ width: isLargeDesktop ? '250px' : '120px' }}>
                                <select
                                    className="w-full bg-[#151725] border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                                    style={{
                                        padding: isLargeDesktop ? '12px 16px' : '10px 8px',
                                        fontSize: isLargeDesktop ? '0.9rem' : '0.75rem'
                                    }}
                                    value={historyStatusFilter}
                                    onChange={(e) => setHistoryStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">{isLargeDesktop ? "Tous les statuts" : "Statuts"}</option>
                                    <option value="COMPLETED">{isLargeDesktop ? "Complétés" : "OK"}</option>
                                    <option value="REFUNDED">{isLargeDesktop ? "Remboursés" : "Remb."}</option>
                                </select>
                            </div>
                        </div>

                        <div className="glass" style={{ borderRadius: '24px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', WebkitOverflowScrolling: 'touch' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isLargeDesktop ? 'auto' : '1000px' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <tr>
                                        <th style={{ padding: '24px 10px 24px 24px', width: '40px' }}>
                                            <input
                                                type="checkbox"
                                                checked={
                                                    (() => {
                                                        const filtered = orders.filter(o => {
                                                            if (o.status === 'PENDING') return false;
                                                            const matchesStatus = historyStatusFilter === "ALL" || o.status === historyStatusFilter;
                                                            const searchText = historySearch.toLowerCase();
                                                            return matchesStatus && (
                                                                o.userId?.username?.toLowerCase().includes(searchText) ||
                                                                o.userId?.email?.toLowerCase().includes(searchText) ||
                                                                o.productTitle?.toLowerCase().includes(searchText) ||
                                                                o.licenseKey?.toLowerCase().includes(searchText)
                                                            );
                                                        });
                                                        return filtered.length > 0 && filtered.every(o => selectedOrders.includes(o._id));
                                                    })()
                                                }
                                                onChange={(e) => {
                                                    const filtered = orders.filter(o => {
                                                        if (o.status === 'PENDING') return false;
                                                        const matchesStatus = historyStatusFilter === "ALL" || o.status === historyStatusFilter;
                                                        const searchText = historySearch.toLowerCase();
                                                        return matchesStatus && (
                                                            o.userId?.username?.toLowerCase().includes(searchText) ||
                                                            o.userId?.email?.toLowerCase().includes(searchText) ||
                                                            o.productTitle?.toLowerCase().includes(searchText) ||
                                                            o.licenseKey?.toLowerCase().includes(searchText)
                                                        );
                                                    });
                                                    if (e.target.checked) {
                                                        const newSelected = Array.from(new Set([...selectedOrders, ...filtered.map(o => o._id)]));
                                                        setSelectedOrders(newSelected);
                                                    } else {
                                                        const filteredIds = filtered.map(o => o._id);
                                                        setSelectedOrders(selectedOrders.filter(id => !filteredIds.includes(id)));
                                                    }
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </th>
                                        <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Date & Heure</th>
                                        <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Client</th>
                                        <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Produit (Prix)</th>
                                        <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Code / Licence</th>
                                        <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Statut</th>
                                        <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const filteredIds = orders.filter(o => {
                                            if (o.status === 'PENDING') return false;
                                            const matchesStatus = historyStatusFilter === "ALL" || o.status === historyStatusFilter;
                                            const searchText = historySearch.toLowerCase();
                                            return matchesStatus && (
                                                o.userId?.username?.toLowerCase().includes(searchText) ||
                                                o.userId?.email?.toLowerCase().includes(searchText) ||
                                                o.productTitle?.toLowerCase().includes(searchText) ||
                                                o.licenseKey?.toLowerCase().includes(searchText)
                                            );
                                        }).map(o => o._id);
                                        const selectedFilteredCount = selectedOrders.filter(id => filteredIds.includes(id)).length;

                                        return selectedFilteredCount > 0 && (
                                            <tr>
                                                <td colSpan="7" style={{ padding: '10px 24px', background: 'rgba(255, 71, 87, 0.05)' }}>
                                                    <div className="flex items-center gap-3">
                                                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--error)' }}>
                                                            {selectedFilteredCount} sélectionnés
                                                        </span>
                                                        <button onClick={handleBulkDeleteOrders} className="btn" style={{ background: 'var(--error)', color: '#fff', fontSize: '0.7rem', padding: '5px 12px', borderRadius: '6px' }}>
                                                            SUPPRIMER LA SÉLECTION
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })()}
                                    {orders
                                        .filter(o => {
                                            if (o.status === 'PENDING') return false;
                                            const matchesStatus = historyStatusFilter === "ALL" || o.status === historyStatusFilter;
                                            const searchText = historySearch.toLowerCase();
                                            const matchesSearch =
                                                o.userId?.username?.toLowerCase().includes(searchText) ||
                                                o.userId?.email?.toLowerCase().includes(searchText) ||
                                                o.productTitle?.toLowerCase().includes(searchText) ||
                                                o.licenseKey?.toLowerCase().includes(searchText);
                                            return matchesStatus && matchesSearch;
                                        })
                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                        .map((o) => (
                                            <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: selectedOrders.includes(o._id) ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOrders.includes(o._id)}
                                                        onChange={() => handleToggleSelect(o._id, 'order')}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '0.85rem' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{new Date(o.createdAt).toLocaleTimeString()}</div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ color: '#fff', fontWeight: '800' }}>{o.userId?.username || 'N/A'}</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>{o.userId?.email || ''}</div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ color: '#fff', fontWeight: '700' }}>{o.productTitle}</div>
                                                    <div style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: '800' }}>${o.price.toFixed(2)}</div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    {o.licenseKey ? (
                                                        <div style={{
                                                            background: 'rgba(255,255,255,0.05)',
                                                            color: '#fff',
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '700',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            wordBreak: 'break-all'
                                                        }}>
                                                            {o.licenseKey}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem italic' }}>Pas de code</span>
                                                    )}
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
                                                    <div className="flex gap-2">
                                                        {o.status !== 'REFUNDED' && (
                                                            <button
                                                                onClick={() => handleRefund(o._id)}
                                                                className="action-btn delete"
                                                                title="Rembourser"
                                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px' }}
                                                            >
                                                                <FaWallet size={12} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteOrder(o._id)}
                                                            className="action-btn delete"
                                                            title="Supprimer"
                                                            style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
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
                                <div key={idx} className="glass" style={{
                                    padding: isLargeDesktop ? '20px' : '15px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    display: 'grid',
                                    gridTemplateColumns: isLargeDesktop ? '1fr 1fr 1fr 1fr 50px' : '1fr 1fr',
                                    gap: isLargeDesktop ? '20px' : '12px',
                                    alignItems: 'center'
                                }}>
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
                                            className="w-full bg-[#151725] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
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

                        <div className="glass" style={{ padding: isLargeDesktop ? '30px' : '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '20px', color: '#fff' }}>Stock Disponible ({demos.length})</h3>
                            <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isLargeDesktop ? 'auto' : '600px' }}>
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
                ) : activeTab === "resetcodes" ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* Options Management */}
                        <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '20px', color: '#fff' }}>Gérer les Types</h3>
                            <form onSubmit={handleAddOption} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                <input
                                    className="admin-input"
                                    placeholder="Nouveau Type (ex: IPTV)"
                                    value={newOptionLabel}
                                    onChange={(e) => setNewOptionLabel(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', borderRadius: '14px', background: 'var(--accent-color)', fontWeight: 'bold' }}>AJOUTER</button>
                            </form>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {resetOptions.map(opt => (
                                    <div key={opt._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', fontSize: '0.9rem' }}>
                                        {opt.label}
                                        <FaTimes
                                            size={12}
                                            className="cursor-pointer hover:text-red-500 transition-colors"
                                            onClick={() => handleDeleteOption(opt._id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Requests Table */}
                        <div className="glass" style={{ borderRadius: '24px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', WebkitOverflowScrolling: 'touch' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isLargeDesktop ? 'auto' : '850px' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <tr>
                                        <th style={{ padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>Client</th>
                                        <th style={{ padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>Type / Code</th>
                                        <th style={{ padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>Produit (Mdp)</th>
                                        <th style={{ padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>Date</th>
                                        <th style={{ padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>Statut</th>
                                        <th style={{ padding: '20px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resetRequests.map(req => (
                                        <tr key={req._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '20px' }}>
                                                <div style={{ fontWeight: '800', color: '#fff' }}>{req.userId?.username || 'Inconnu'}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{req.userId?.email}</div>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', marginRight: '8px', fontWeight: '700' }}>{req.type}</span>
                                                <span style={{ fontFamily: 'monospace', color: 'var(--accent-color)' }}>{req.code}</span>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <div className="flex items-center gap-2">
                                                    {req.productImage && <img src={req.productImage} style={{ width: '24px', height: '24px', borderRadius: '4px' }} />}
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{req.productTitle || 'N/A'}</span>
                                                </div>
                                                {req.password && (
                                                    <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Pass: {req.password}</div>
                                                )}
                                            </td>
                                            <td style={{ padding: '20px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                                                {new Date(req.createdAt).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                {req.status === 'PENDING' ? (
                                                    <span style={{ color: 'var(--accent-color)', fontWeight: '900', fontSize: '0.75rem' }}>EN ATTENTE</span>
                                                ) : req.status === 'COMPLETED' ? (
                                                    <span style={{ color: 'var(--success)', fontWeight: '900', fontSize: '0.75rem' }}>TRAITÉ</span>
                                                ) : (
                                                    <span style={{ color: 'var(--error)', fontWeight: '900', fontSize: '0.75rem' }}>REJETÉ</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                {req.status === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleUpdateResetStatus(req._id, 'COMPLETED')}
                                                            title="Marquer comme traité"
                                                            className="action-btn success"
                                                        >
                                                            <FaCheck size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateResetStatus(req._id, 'REJETÉ')}
                                                            title="Rejeter"
                                                            className="action-btn delete"
                                                        >
                                                            <FaTimes size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {resetRequests.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Aucune demande pour le moment.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === "settings" ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {settings && (
                            <form onSubmit={handleUpdateSettings}>
                                {/* Contact Settings */}
                                <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '20px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>Paramètres de Contact</h3>
                                    <div className="flex flex-col gap-2">
                                        <label className="form-label">Numéro WhatsApp Admin</label>
                                        <input
                                            className="admin-input"
                                            type="text"
                                            value={settings.whatsappNumber || ""}
                                            onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                            placeholder="ex: +216..."
                                        />
                                    </div>
                                </div>

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


                                <button type="submit" className="btn btn-primary" style={{ padding: '15px 40px', borderRadius: '15px', fontWeight: '900', boxShadow: '0 10px 30px rgba(255, 153, 0, 0.2)' }}>
                                    ENREGISTRER TOUS LES PARAMÈTRES
                                </button>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="glass" style={{ borderRadius: '24px', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: isLargeDesktop ? 'auto' : '900px' }}>
                            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <tr>
                                    <th style={{ padding: '24px 10px 24px 24px', width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === users.length && users.length > 0}
                                            onChange={(e) => setSelectedUsers(e.target.checked ? users.map(u => u._id) : [])}
                                            style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                        />
                                    </th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Utilisateur</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Solde Actuel</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Rang / Achats</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Statut</th>
                                    <th style={{ padding: '24px', color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedUsers.length > 0 && (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '10px 24px', background: 'rgba(255, 71, 87, 0.05)' }}>
                                            <div className="flex items-center gap-3">
                                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--error)' }}>{selectedUsers.length} sélectionnés</span>
                                                <button onClick={handleBulkDeleteUsers} className="btn" style={{ background: 'var(--error)', color: '#fff', fontSize: '0.7rem', padding: '5px 12px', borderRadius: '6px' }}>
                                                    SUPPRIMER LA SÉLECTION
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {users.map((u) => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: selectedUsers.includes(u._id) ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(u._id)}
                                                onChange={() => handleToggleSelect(u._id, 'user')}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </td>
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
                                                <button onClick={() => handleDeleteUser(u._id)} className="action-btn delete" title="Supprimer"><FaTrash size={18} /></button>
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
            {
                (showAddForm || isEditing) && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowAddForm(false); setIsEditing(null); } }}>
                        <div className="modal-content" style={{ animation: 'modalSlideUp 0.3s ease-out' }}>
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
                                        <label className="form-label">Image du Produit</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="admin-input"
                                                onChange={handleImageUpload}
                                                style={{ padding: '8px', fontSize: '0.8rem' }}
                                            />
                                            {(showAddForm ? newProduct.image : isEditing.image) && (
                                                <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                    <img
                                                        src={showAddForm ? newProduct.image : isEditing.image}
                                                        alt="Preview"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label className="form-label">Catégorie</label>
                                        <select
                                            className="w-full bg-[#151725] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
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
                                                        className="w-full bg-[#151725] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
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
                                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Clés de Licence / Codes (Stock)</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', background: 'rgba(255, 153, 0, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                            {(showAddForm ? newProduct.keysInput : isEditing.keysInput) ? (showAddForm ? newProduct.keysInput : isEditing.keysInput).split(',').filter(k => k.trim()).length : 0} Codes
                                        </span>
                                    </label>

                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        {/* Input Area */}
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                            <input
                                                type="text"
                                                placeholder="Entrez un code..."
                                                className="admin-input"
                                                style={{ flex: 1 }}
                                                value={showAddForm ? (newProduct.tempKeyInput || "") : (isEditing.tempKeyInput || "")}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    showAddForm
                                                        ? setNewProduct({ ...newProduct, tempKeyInput: val })
                                                        : setIsEditing({ ...isEditing, tempKeyInput: val });
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const p = showAddForm ? newProduct : isEditing;
                                                        const val = (p.tempKeyInput || "").trim();
                                                        if (!val) return;

                                                        const currentKeys = p.keysInput ? p.keysInput.split(',').map(k => k.trim()).filter(k => k) : [];
                                                        if (!currentKeys.includes(val)) {
                                                            currentKeys.push(val);
                                                            const newKeysInput = currentKeys.join(',');
                                                            showAddForm
                                                                ? setNewProduct({ ...newProduct, keysInput: newKeysInput, tempKeyInput: "" })
                                                                : setIsEditing({ ...isEditing, keysInput: newKeysInput, tempKeyInput: "" });
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                style={{ padding: '0 20px', borderRadius: '10px' }}
                                                onClick={() => {
                                                    const p = showAddForm ? newProduct : isEditing;
                                                    const val = (p.tempKeyInput || "").trim();
                                                    if (!val) return;

                                                    const currentKeys = p.keysInput ? p.keysInput.split(',').map(k => k.trim()).filter(k => k) : [];
                                                    if (!currentKeys.includes(val)) {
                                                        currentKeys.push(val);
                                                        const newKeysInput = currentKeys.join(',');
                                                        showAddForm
                                                            ? setNewProduct({ ...newProduct, keysInput: newKeysInput, tempKeyInput: "" })
                                                            : setIsEditing({ ...isEditing, keysInput: newKeysInput, tempKeyInput: "" });
                                                    }
                                                }}
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>

                                        {/* Keys List */}
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '8px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            padding: '5px'
                                        }}>
                                            {(() => {
                                                const p = showAddForm ? newProduct : isEditing;
                                                const keys = p.keysInput ? p.keysInput.split(',').map(k => k.trim()).filter(k => k) : [];

                                                if (keys.length === 0) return <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontStyle: 'italic', width: '100%', textAlign: 'center', padding: '10px' }}>Aucun code ajouté temporairement.</div>;

                                                return keys.map((k, idx) => (
                                                    <div key={idx} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        fontSize: '0.85rem',
                                                        fontFamily: 'monospace'
                                                    }}>
                                                        <span style={{ color: '#fff' }}>{k}</span>
                                                        <FaTimes
                                                            size={12}
                                                            style={{ cursor: 'pointer', color: 'var(--error)', opacity: 0.7 }}
                                                            onClick={() => {
                                                                const newKeys = keys.filter((_, i) => i !== idx);
                                                                const newKeysInput = newKeys.join(',');
                                                                showAddForm
                                                                    ? setNewProduct({ ...newProduct, keysInput: newKeysInput })
                                                                    : setIsEditing({ ...isEditing, keysInput: newKeysInput });
                                                            }}
                                                            onMouseOver={(e) => e.target.style.opacity = 1}
                                                            onMouseOut={(e) => e.target.style.opacity = 0.7}
                                                        />
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                    {(isEditing || (showAddForm && newProduct.type !== 'normal')) && <p style={{ color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: '800', opacity: 0.8, marginTop: '10px' }}>* Les nouvelles clés seront ajoutées au stock existant. Pour les produits API, elles seront utilisées si le client choisit "Code".</p>}

                                    {/* Existing/Registered Code Display */}
                                    {isEditing && isEditing.keys && isEditing.keys.length > 0 && (
                                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="form-label" style={{ marginBottom: 0 }}>Stock Enregistré (Base de Données)</label>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '900' }}>
                                                    {isEditing.keys.filter(k => !k.isSold).length} Disponibles
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '8px',
                                                maxHeight: '150px',
                                                overflowY: 'auto',
                                                padding: '10px',
                                                background: 'rgba(0,0,0,0.3)',
                                                borderRadius: '12px'
                                            }}>
                                                {isEditing.keys.filter(k => !k.isSold).map((k, idx) => (
                                                    <div key={idx} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        background: 'rgba(46, 213, 115, 0.1)',
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid rgba(46, 213, 115, 0.2)',
                                                        fontSize: '0.8rem',
                                                        fontFamily: 'monospace',
                                                        color: '#2ed573'
                                                    }}>
                                                        <FaKey size={10} />
                                                        <span>{k.key}</span>
                                                        <div style={{ display: 'flex', gap: '5px', marginLeft: '5px', borderLeft: '1px solid rgba(46, 213, 115, 0.3)', paddingLeft: '5px' }}>
                                                            <FaEdit
                                                                size={12}
                                                                style={{ cursor: 'pointer', color: '#2ed573' }}
                                                                title="Modifier"
                                                                onClick={() => handleUpdateKey(isEditing._id, k._id, k.key)}
                                                            />
                                                            <FaTrash
                                                                size={12}
                                                                style={{ cursor: 'pointer', color: '#ff4757' }}
                                                                title="Supprimer"
                                                                onClick={() => handleDeleteKey(isEditing._id, k._id)}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                                {isEditing.keys.filter(k => !k.isSold).length === 0 && (
                                                    <div style={{ width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Stock épuisé.</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* API / IPTV Configuration */}
                                <div className="glass" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '15px', color: 'var(--accent-color)', textTransform: 'uppercase' }}>Configuration API Automatique</h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label className="form-label">Type de Produit</label>
                                            <select
                                                className="w-full bg-[#151725] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                                value={showAddForm ? newProduct.type : isEditing.type}
                                                onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, type: e.target.value }) : setIsEditing({ ...isEditing, type: e.target.value })}
                                            >
                                                <option value="normal">💎 Normal (Clés manuelles)</option>
                                                <option value="m3u">📺 M3U (Lien Automatique)</option>
                                                <option value="mag">📟 MAG (Mac Address)</option>
                                            </select>
                                        </div>

                                        {(showAddForm ? newProduct.type : isEditing.type) !== 'normal' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label className="form-label">Fournisseur API</label>
                                                <select
                                                    className="w-full bg-[#151725] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                                    value={showAddForm ? newProduct.provider : isEditing.provider}
                                                    onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, provider: e.target.value }) : setIsEditing({ ...isEditing, provider: e.target.value })}
                                                >
                                                    <option value="neo">NEO 4K (neo4kpro.me)</option>
                                                    <option value="strong8k">STRONG 8K (my8k.me)</option>
                                                    <option value="activation">ACTIVATION PANEL (activationpanel.net)</option>
                                                    <option value="tivipanel">TIVIPANEL (api.tivipanel.net)</option>
                                                    <option value="promax">PROMAX (api.promax-dash.com)</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {(showAddForm ? newProduct.type : isEditing.type) !== 'normal' && (<>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label className="form-label">ID du Bouquet (Pack ID - 'all' pour tous)</label>
                                                {(showAddForm ? newProduct.provider : isEditing.provider) === 'promax' ? (
                                                    <select
                                                        className="admin-input"
                                                        value={showAddForm ? newProduct.pack : (isEditing.pack || "1")}
                                                        onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, pack: e.target.value }) : setIsEditing({ ...isEditing, pack: e.target.value })}
                                                    >
                                                        <option value="">Sélectionner un bouquet</option>
                                                        {providerPackages.map(b => (
                                                            <option key={b.id} value={b.id}>{b.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className="admin-input"
                                                        placeholder="ex: 123 ou all"
                                                        value={showAddForm ? newProduct.pack : (isEditing.pack || "")}
                                                        onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, pack: e.target.value }) : setIsEditing({ ...isEditing, pack: e.target.value })}
                                                    />
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label className="form-label">Durée par défaut (Mois)</label>
                                                <input
                                                    type="number"
                                                    className="admin-input"
                                                    placeholder="ex: 12"
                                                    value={showAddForm ? newProduct.duration : (isEditing.duration || 12)}
                                                    onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, duration: parseInt(e.target.value) }) : setIsEditing({ ...isEditing, duration: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        {/* Dynamic Duration Pricing */}
                                        <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                            <label className="form-label" style={{ color: 'var(--accent-color)' }}>Prix par Durée (Prioritaire sur le prix de base)</label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                                {(showAddForm ? (newProduct.durationPrices || []) : (isEditing.durationPrices || [])).map((dp, idx) => (
                                                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <input
                                                            type="number"
                                                            placeholder="Mois (ex: 3)"
                                                            className="admin-input"
                                                            style={{ flex: 1 }}
                                                            value={dp.duration}
                                                            onChange={(e) => {
                                                                const updated = showAddForm ? [...(newProduct.durationPrices || [])] : [...(isEditing.durationPrices || [])];
                                                                updated[idx].duration = parseInt(e.target.value);
                                                                showAddForm ? setNewProduct({ ...newProduct, durationPrices: updated }) : setIsEditing({ ...isEditing, durationPrices: updated });
                                                            }}
                                                        />
                                                        <input
                                                            type="number"
                                                            placeholder="Prix ($)"
                                                            className="admin-input"
                                                            style={{ flex: 1 }}
                                                            value={dp.price}
                                                            onChange={(e) => {
                                                                const updated = showAddForm ? [...(newProduct.durationPrices || [])] : [...(isEditing.durationPrices || [])];
                                                                updated[idx].price = parseFloat(e.target.value);
                                                                showAddForm ? setNewProduct({ ...newProduct, durationPrices: updated }) : setIsEditing({ ...isEditing, durationPrices: updated });
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="action-btn delete"
                                                            onClick={() => {
                                                                const updated = showAddForm ? [...(newProduct.durationPrices || [])] : [...(isEditing.durationPrices || [])];
                                                                updated.splice(idx, 1);
                                                                showAddForm ? setNewProduct({ ...newProduct, durationPrices: updated }) : setIsEditing({ ...isEditing, durationPrices: updated });
                                                            }}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    className="btn btn-glass"
                                                    style={{ fontSize: '0.8rem', padding: '8px' }}
                                                    onClick={() => {
                                                        const newItem = { duration: 1, price: 0 };
                                                        const updated = showAddForm ? [...(newProduct.durationPrices || [])] : [...(isEditing.durationPrices || [])];
                                                        updated.push(newItem);
                                                        showAddForm ? setNewProduct({ ...newProduct, durationPrices: updated }) : setIsEditing({ ...isEditing, durationPrices: updated });
                                                    }}
                                                >
                                                    + Ajouter une durée
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                                            <div className="flex items-center gap-3 mb-4">
                                                <input
                                                    type="checkbox"
                                                    id="showBouquetSorter"
                                                    checked={showAddForm ? (newProduct.showBouquetSorter !== false) : (isEditing.showBouquetSorter !== false)}
                                                    onChange={(e) => showAddForm ? setNewProduct({ ...newProduct, showBouquetSorter: e.target.checked }) : setIsEditing({ ...isEditing, showBouquetSorter: e.target.checked })}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <label htmlFor="showBouquetSorter" className="form-label" style={{ cursor: 'pointer', marginBottom: 0 }}>
                                                    Afficher le tri des bouquets (Sort Bouquets Client)
                                                </label>
                                            </div>

                                            {providerPackages.length > 0 && (
                                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                                                    <label className="form-label" style={{ marginBottom: '10px', display: 'block', color: 'var(--accent-color)' }}>Renommer les Bouquets (Optionnel)</label>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                        {providerPackages.map(pkg => {
                                                            const currentNames = showAddForm ? (newProduct.bouquetNames || {}) : (isEditing.bouquetNames || {});
                                                            const customName = currentNames[pkg.id] || "";

                                                            return (
                                                                <div key={pkg.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{pkg.name} (Original)</div>
                                                                    <input
                                                                        className="admin-input"
                                                                        style={{ padding: '8px', fontSize: '0.8rem' }}
                                                                        placeholder="Nom personnalisé..."
                                                                        value={customName}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            const updatedNames = { ...currentNames };
                                                                            if (val.trim()) {
                                                                                updatedNames[pkg.id] = val;
                                                                            } else {
                                                                                delete updatedNames[pkg.id];
                                                                            }

                                                                            if (showAddForm) {
                                                                                setNewProduct({ ...newProduct, bouquetNames: updatedNames });
                                                                            } else {
                                                                                setIsEditing({ ...isEditing, bouquetNames: updatedNames });
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>)}
                                </div>

                                <div className="flex justify-end gap-3 mt-4 sticky bottom-0 bg-[#131427] pt-4 border-t border-white/5 pb-2 -mb-2">
                                    <button
                                        type="button"
                                        className="btn btn-glass"
                                        onClick={() => { setShowAddForm(false); setIsEditing(null); }}
                                    >
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ boxShadow: '0 4px 15px rgba(255, 153, 0, 0.3)' }}>
                                        {showAddForm ? "Créer" : "Enregistrer"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div >
                )
            }

            {/* Category Form Modal */}
            {
                (showCategoryForm || isEditingCategory) && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowCategoryForm(false); setIsEditingCategory(null); } }}>
                        <div className="modal-content" style={{ maxWidth: '400px', animation: 'modalSlideUp 0.3s ease-out' }}>
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
                    position: fixed; inset: 0; background: rgba(5,6,12,0.4); 
                    z-index: 2000; display: flex; align-items: center; justify-content: center; 
                    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    animation: modalBackdropIn 0.4s ease-out forwards;
                }
                .modal-content { 
                    width: 95%; maxWidth: 600px; padding: 40px; borderRadius: 32px; 
                    border: 1px solid rgba(255,255,255,0.1); position: relative;
                    background: linear-gradient(135deg, rgba(20,22,40,0.95), rgba(15,16,32,0.98));
                    box-shadow: 0 25px 80px rgba(0,0,0,0.5);
                    animation: modalContentIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .admin-input { 
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); 
                    color: #fff; padding: 14px 18px; borderRadius: 14px; width: 100%; outline: none;
                    transition: all 0.3s; font-weight: 600; font-size: 0.95rem;
                }
                .admin-input:focus { border-color: var(--accent-color); background: rgba(255,153,0,0.05); box-shadow: 0 0 20px rgba(255, 153, 0, 0.1); }
                .form-label { font-size: 0.75rem; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 5px; }
                .btn-submit:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(255, 87, 34, 0.3); filter: brightness(1.1); }
                
                @keyframes modalBackdropIn {
                    from { opacity: 0; backdrop-filter: blur(0); }
                    to { opacity: 1; backdrop-filter: blur(20px); }
                }

                @keyframes modalContentIn {
                    from { opacity: 0; transform: scale(0.9) translateY(30px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
            {/* Fulfillment Logs Modal */}
            {
                showLogModal && (
                    <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
                        <div className="glass modal-content" style={{ maxWidth: '550px' }} onClick={e => e.stopPropagation()}>
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
            {/* The previous Sent Keys Modal content is now integrated into the main history table or removed as per instruction. */}
            {/* New states for search and filter would be declared here or at the top of the component */}
            {/* const [searchTerm, setSearchTerm] = useState(''); */}
            {/* const [filterStatus, setFilterStatus] = useState('ALL'); */}
            {/* const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' }); */}
            {/* const filteredOrders = useMemo(() => { ... }, [orders, searchTerm, filterStatus, sortConfig]); */}

            {/* Mobile Stats Modal */}
            {!isLargeDesktop && showStatsModal && (
                <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '400px',
                            width: '90%',
                            animation: 'modalSlideUp 0.3s ease-out',
                            padding: '30px'
                        }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '900' }}>Tableau de Bord</h2>
                            <FaTimes onClick={() => setShowStatsModal(false)} style={{ cursor: 'pointer', opacity: 0.3 }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <StatCard label="Total Produits" value={stats.totalProducts} icon={FaShoppingBag} color="255, 153, 0" />
                            <StatCard label="Commandes en attente" value={stats.pendingOrders} icon={FaDolly} color="255, 71, 87" />
                            <StatCard label="Stock Total" value={stats.totalKeys} icon={FaKey} color="46, 213, 115" />
                            <StatCard label="Valeur Stock" value={`$${stats.totalAvailableValue.toFixed(2)}`} icon={FaWallet} color="10, 191, 255" />
                            <StatCard label="Clients" value={stats.totalUsers} icon={FaUserFriends} color="162, 155, 254" />
                        </div>
                        <button
                            onClick={() => setShowStatsModal(false)}
                            className="btn btn-primary w-full mt-8"
                            style={{ padding: '15px', borderRadius: '12px' }}
                        >
                            FERMER
                        </button>
                    </div>
                </div>
            )}

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

            {
                toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )
            }
        </div >
    );
};

export default Admin;
