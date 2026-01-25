import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";
import StatsCards from "../components/StatsCards";

const Skeleton = ({ height, style }) => (
    <div style={{
        width: '100%',
        height,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
        backgroundSize: '200% 100%',
        borderRadius: '20px',
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

const Home = () => {
    const [products, setProducts] = useState([]);
    const [homeSettings, setHomeSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSmall, setIsSmall] = useState(window.innerWidth <= 660);
    const [isMedium, setIsMedium] = useState(window.innerWidth <= 930);

    useEffect(() => {
        const handleResize = () => {
            setIsSmall(window.innerWidth <= 660);
            setIsMedium(window.innerWidth <= 930);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, productsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/settings`),
                    axios.get(`${API_BASE_URL}/api/products`)
                ]);

                setHomeSettings(settingsRes.data?.home || {});

                // Filter best sellers if IDs are present
                const allProducts = productsRes.data || [];
                const bestSellerIds = settingsRes.data?.home?.bestSellers || [];

                // If specific best sellers selected, use them. Otherwise fallback to first 8.
                // The user request implies they WANT to select them. If none selected, maybe show none or fallback?
                // Let's show all if none selected, or specific ones. 
                // Actually, usually "Best Sellers" implies a subset.
                if (bestSellerIds.length > 0) {
                    // Filter and maintain order if possible, or just intersection
                    const selected = allProducts.filter(p => bestSellerIds.includes(p._id));
                    setProducts(selected);
                } else {
                    setProducts([]);
                }

            } catch (err) {
                console.error("Error fetching home data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ paddingBottom: '50px' }}>
                <div style={{ height: '60px' }}></div> {/* Spacer */}
                <div className="container" style={{ padding: isSmall ? '0 10px' : '0' }}>
                    {/* Carousel Skeleton */}
                    <div style={{ padding: isSmall ? '30px 0' : '60px 0' }}>
                        <Skeleton
                            height={isSmall ? '240px' : isMedium ? '320px' : '420px'}
                            style={{
                                marginBottom: isSmall ? '30px' : '60px',
                                width: isSmall ? '90%' : isMedium ? '85%' : '75%',
                                margin: '0 auto'
                            }}
                        />
                    </div>

                    {/* Stats Skeleton */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isSmall ? 'repeat(2, 1fr)' : isMedium ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                        gap: '20px',
                        marginBottom: '40px'
                    }}>
                        <Skeleton height="150px" />
                        <Skeleton height="150px" />
                        <Skeleton height="150px" />
                        <Skeleton height="150px" />
                    </div>

                    {/* Products Skeleton */}
                    <Skeleton height="40px" style={{ width: isSmall ? '200px' : '300px', marginBottom: '30px' }} />
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isSmall ? 'repeat(2, 1fr)' : isMedium ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
                        gap: isSmall ? '15px' : '25px'
                    }}>
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} height={isSmall ? '250px' : '350px'} />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '50px' }}>
            {/* Carousel Slider */}
            <HeroSlider slides={homeSettings?.carousel?.length > 0 ? homeSettings.carousel : undefined} />

            {/* Dashboard Stats */}
            <StatsCards statsCards={homeSettings?.statsCards || []} />

            {/* Best Sellers */}
            <section className="container" style={{ marginTop: '70px ' }}>
                <h2 className="section-title">MEILLEURES VENTES</h2>

                {products.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isSmall ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: isSmall ? '15px' : '25px'
                    }}>
                        {products.map(p => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>Aucun produit mis en avant pour le moment.</p>
                )}
            </section>
        </div>
    );
};

export default Home;
