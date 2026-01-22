import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { FaFilter, FaList, FaThLarge, FaSearch } from "react-icons/fa";
import axios from "axios";

const initialCategory = { id: "all", label: "Tous les Produits" };

const Products = () => {
    const { categoryId } = useParams();
    const [selectedCategory, setSelectedCategory] = useState(categoryId || "all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([initialCategory]);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get("/api/products");
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProducts();

        const fetchCategories = async () => {
            try {
                const res = await axios.get("/api/categories");
                const fetchedCategories = res.data.map(cat => ({ id: cat.name, label: cat.name }));
                setCategories([initialCategory, ...fetchedCategories]);
            } catch (err) {
                console.error("Error fetching categories", err);
            }
        };
        fetchCategories();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === "all" || p.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    useEffect(() => {
        if (categoryId) setSelectedCategory(categoryId);
    }, [categoryId]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '40px', paddingBottom: '80px' }}>
            <div className="container">
                {/* Header Section */}
                <div style={{ marginBottom: '40px' }}>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="section-title" style={{ marginBottom: '10px' }}>
                                Parcourir le <span style={{ color: 'var(--accent-color)' }}>Catalogue</span>
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                                Affichage de {filteredProducts.length} produits numériques premium
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' }}>
                    {/* Sidebar Filters */}
                    <aside>
                        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', position: 'sticky', top: '120px' }}>
                            <div className="flex items-center gap-2" style={{ marginBottom: '20px', color: '#fff', fontWeight: '800', fontSize: '1.1rem' }}>
                                <FaFilter size={16} style={{ color: 'var(--accent-color)' }} /> CATÉGORIES
                            </div>

                            <div className="flex flex-col gap-1">
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            transition: '0.3s',
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            background: selectedCategory === cat.id ? 'rgba(255, 153, 0, 0.1)' : 'transparent',
                                            color: selectedCategory === cat.id ? 'var(--accent-color)' : 'var(--text-muted)',
                                            borderLeft: selectedCategory === cat.id ? '3px solid var(--accent-color)' : '3px solid transparent'
                                        }}
                                        className="category-item-hover"
                                    >
                                        {cat.label}
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff', marginBottom: '15px' }}>TRIER PAR</div>
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                        className="input-search flex justify-between items-center"
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            fontSize: '0.85rem',
                                            width: '100%',
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <span>
                                            {sortBy === 'latest' && "Plus récents"}
                                            {sortBy === 'price_low' && "Prix: Croissant"}
                                            {sortBy === 'price_high' && "Prix: Décroissant"}
                                        </span>
                                        <FaList size={12} style={{ opacity: 0.5 }} />
                                    </button>

                                    {isSortDropdownOpen && (
                                        <div className="glass" style={{
                                            position: 'absolute',
                                            top: '110%',
                                            left: 0,
                                            width: '100%',
                                            zIndex: 50,
                                            background: '#131421', // Solid background to prevent transparency issues
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            overflow: 'hidden',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                                        }}>
                                            {[
                                                { value: 'latest', label: 'Plus récents' },
                                                { value: 'price_low', label: 'Prix: Croissant' },
                                                { value: 'price_high', label: 'Prix: Décroissant' }
                                            ].map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setSortBy(opt.value);
                                                        setIsSortDropdownOpen(false);
                                                    }}
                                                    className="sort-option"
                                                    style={{
                                                        padding: '10px 15px',
                                                        fontSize: '0.85rem',
                                                        color: sortBy === opt.value ? 'var(--accent-color)' : 'rgba(255,255,255,0.7)',
                                                        cursor: 'pointer',
                                                        transition: '0.2s',
                                                        background: sortBy === opt.value ? 'rgba(255, 153, 0, 0.05)' : 'transparent'
                                                    }}
                                                >
                                                    {opt.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main>
                        {filteredProducts.length > 0 ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                gap: '25px'
                            }}>
                                {filteredProducts.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="glass" style={{
                                padding: '100px',
                                textAlign: 'center',
                                borderRadius: 'var(--radius-lg)',
                                color: 'var(--text-muted)'
                            }}>
                                <h3 style={{ color: '#fff', marginBottom: '10px' }}>Aucun produit trouvé</h3>
                                <p>Essayez d'ajuster vos filtres</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <style jsx>{`
                .category-item-hover:hover {
                    color: #fff !important;
                    background: rgba(255,255,255,0.03) !important;
                }
            `}</style>
        </div>
    );
};

export default Products;
