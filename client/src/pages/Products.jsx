import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { FaFilter, FaList, FaThLarge, FaSearch } from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../config/api";
import SEO from "../components/SEO";

const initialCategory = { id: "all", label: "Tous les Produits", subcategories: [] };

const Products = () => {
    // ... existing code ...
    const { categoryId } = useParams();
    const [selectedCategory, setSelectedCategory] = useState(categoryId || "all");
    // ... other hooks ...
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const { search } = useLocation();

    // Helper to get subcategory from current URL
    const getSubFromUrl = () => new URLSearchParams(search).get('subcategory');
    const subParam = getSubFromUrl();

    const [selectedSubcategory, setSelectedSubcategory] = useState(subParam || null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([initialCategory]);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [screenSize, setScreenSize] = useState({
        isSmall: window.innerWidth <= 930,
        isUltraSmall: window.innerWidth <= 660
    });

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                isSmall: window.innerWidth <= 930,
                isUltraSmall: window.innerWidth <= 660
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/products`);
                if (Array.isArray(res.data)) {
                    setProducts(res.data);
                } else {
                    setProducts([]);
                }
            } catch (err) {
                console.error(err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();

        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/categories`);
                if (Array.isArray(res.data)) {
                    const fetchedCategories = res.data.map(cat => ({
                        id: cat.name,
                        label: cat.name,
                        subcategories: cat.subcategories || []
                    }));
                    setCategories([initialCategory, ...fetchedCategories]);
                } else {
                    setCategories([initialCategory]);
                }
            } catch (err) {
                console.error("Error fetching categories", err);
                setCategories([initialCategory]);
            }
        };
        fetchCategories();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSubcategory = !selectedSubcategory || p.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase();
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSubcategory && matchesSearch;
    }).sort((a, b) => {
        if (sortBy === 'price_low') {
            return a.price - b.price;
        } else if (sortBy === 'price_high') {
            return b.price - a.price;
        } else {
            // Default: 'latest' -> assuming newer products are added later, or modify if 'createdAt' is available
            // If explicit 'createdAt' exists: return new Date(b.createdAt) - new Date(a.createdAt);
            // If not, relying on array order (assuming fetched newest first or DB default) might be okay,
            // or explicit reverse:
            return 0; // Keeping default order from API
        }
    });

    useEffect(() => {
        if (categoryId) {
            setSelectedCategory(categoryId);
            // Sync subcategory from URL parameter
            setSelectedSubcategory(subParam || null);
        }
    }, [categoryId, subParam]);

    // This effect handles resetting subcategory only when the category is changed 
    // without a sub-parameter being present in the URL (manual category change).
    useEffect(() => {
        if (!subParam) {
            setSelectedSubcategory(null);
        }
    }, [selectedCategory, subParam]);

    const Skeleton = ({ height, width, style, borderRadius = '12px' }) => (
        <div style={{
            width: width || '100%',
            height,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
            backgroundSize: '200% 100%',
            borderRadius,
            animation: 'skeletonLoading 1.5s infinite',
            ...style
        }}>
            <style>{`
            @keyframes skeletonLoading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `}</style>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '40px', paddingBottom: '80px' }}>
            <SEO
                title={selectedCategory === 'all' ? 'Nos Produits' : `${selectedCategory} - Skygros`}
                description="Explorez notre catalogue de produits IPTV et numériques."
            />
            <div className="container">
                {/* Header Section */}
                <div style={{ marginBottom: screenSize.isUltraSmall ? '20px' : '30px' }}>
                    <h1 className="section-title" style={{
                        marginBottom: '10px',
                        fontSize: screenSize.isUltraSmall ? '1.5rem' : screenSize.isSmall ? '2rem' : '2.25rem'
                    }}>
                        Parcourir le <span style={{ color: 'var(--accent-color)' }}>Catalogue</span>
                    </h1>
                    <div className="flex justify-between items-center" style={{ gap: '15px', flexWrap: 'wrap' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: screenSize.isUltraSmall ? '0.85rem' : '1rem' }}>
                            {loading ? "Chargement..." : `Affichage de ${filteredProducts.length} produits`}
                        </p>

                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                className="btn btn-glass"
                                style={{ height: '38px', padding: '0 15px', fontSize: '0.8rem', borderRadius: '10px' }}
                            >
                                <FaList size={12} />
                                <span style={{ marginLeft: '8px' }}>
                                    {sortBy === 'latest' ? "Récent" : sortBy === 'price_low' ? "Prix ↑" : "Prix ↓"}
                                </span>
                            </button>
                            {isSortDropdownOpen && (
                                <div className="glass" style={{
                                    position: 'absolute', top: '110%', right: 0, width: '180px', zIndex: 1000,
                                    background: 'rgba(20, 21, 38, 0.98)', borderRadius: '12px', padding: '5px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {[
                                        { value: 'price_low', label: 'Prix croissant' },
                                        { value: 'price_high', label: 'Prix décroissant' }
                                    ].map((opt) => (
                                        <div key={opt.value} onClick={() => { setSortBy(opt.value); setIsSortDropdownOpen(false); }}
                                            style={{
                                                padding: '10px 15px', fontSize: '0.8rem', borderRadius: '8px', cursor: 'pointer',
                                                color: sortBy === opt.value ? 'var(--accent-color)' : '#fff',
                                                background: sortBy === opt.value ? 'rgba(255,153,0,0.1)' : 'transparent'
                                            }}>
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Search Input */}
                    {/* <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            className="input-search"
                            placeholder="Rechercher un produit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '12px 15px 12px 45px', fontSize: '0.95rem', height: '50px', background: 'rgba(255,255,255,0.03)' }}
                        />
                        <FaSearch style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    </div> */}

                    {/* Main Categories Row */}
                    {/* <div className="custom-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', whiteSpace: 'nowrap' }}>
                        {categories.map(cat => (
                            <div key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                                style={{
                                    padding: '10px 22px', borderRadius: '25px', cursor: 'pointer', transition: 'all 0.3s ease',
                                    fontSize: '0.9rem', fontWeight: '800', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0,
                                    background: selectedCategory === cat.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                    color: selectedCategory === cat.id ? '#000' : 'rgba(255,255,255,0.6)',
                                    textTransform: 'uppercase', letterSpacing: '0.5px'
                                }}
                                className="category-pill-hover"
                            >
                                {cat.label}
                            </div>
                        ))}
                    </div> */}

                    {/* Subcategories Row - Mobile Design inspired block */}
                    {selectedCategory !== 'all' && categories.find(c => c.id === selectedCategory)?.subcategories?.length > 0 && (
                        <div className="custom-scrollbar" style={{
                            display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px',
                            background: 'rgba(255, 153, 0, 0.03)', border: '1px solid rgba(255, 153, 0, 0.1)', borderRadius: '15px',
                            whiteSpace: 'nowrap', animation: 'slideDown 0.3s ease'
                        }}>
                            {/* <span style={{ color: 'var(--accent-color)', fontSize: '0.7rem', fontWeight: '900', marginRight: '5px', alignSelf: 'center' }}>SOUS-CATÉGORIES:</span> */}
                            {categories.find(c => c.id === selectedCategory).subcategories.map((sub, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedSubcategory(selectedSubcategory === sub ? null : sub)}
                                    style={{
                                        padding: '6px 15px',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        background: selectedSubcategory === sub ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                                        color: selectedSubcategory === sub ? '#000' : '#fff',
                                        border: selectedSubcategory === sub ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.05)',
                                        flexShrink: 0
                                    }}>
                                    {sub}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Product Grid */}
                    <main style={{ marginTop: '10px' }}>
                        {loading ? (
                            <div style={{ display: 'grid', gridTemplateColumns: screenSize.isUltraSmall ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: screenSize.isUltraSmall ? '15px' : '25px' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} style={{ height: '320px' }}>
                                        <Skeleton height="100%" borderRadius="var(--radius-lg)" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: screenSize.isUltraSmall ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: screenSize.isUltraSmall ? '15px' : '25px' }}>
                                {filteredProducts.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="glass" style={{ padding: screenSize.isUltraSmall ? '40px 20px' : '100px', textAlign: 'center', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                                <h3 style={{ color: '#fff', marginBottom: '10px' }}>Aucun produit trouvé</h3>
                                <p>Essayez d'ajuster vos filtres</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <style jsx>{`
                .category-pill-hover:hover {
                    box-shadow: 0 4px 15px rgba(255, 153, 0, 0.2);
                    border-color: rgba(255, 153, 0, 0.3);
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Products;
