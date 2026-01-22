import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import HeroSlider from "../components/HeroSlider";

import StatsCards from "../components/StatsCards";

const Home = () => {
    const [products, setProducts] = useState([]);

    // Fallback data
    const fallbackProducts = [
        { _id: "1", title: "Cyber Warrior 2077", price: 59.99, image: "/assets/game_cover.png", category: "Jeux" },
        { _id: "2", title: "Space Odyssey: Horizons", price: 49.99, image: "/assets/game_cover.png", category: "Jeux" },
        { _id: "3", title: "$50 Steam Gift Card", price: 50.00, image: "/assets/gift_card.png", category: "Cartes Cadeaux" },
        { _id: "4", title: "Grand Theft Auto VI", price: 69.99, image: "/assets/game_cover.png", category: "Jeux" },
        { _id: "5", title: "Apex Legends Coins", price: 9.99, image: "/assets/game_cover.png", category: "Monnaie" },
        { _id: "6", title: "Netflix 1 Month", price: 15.99, image: "/assets/gift_card.png", category: "Abo" },
        { _id: "7", title: "Elden Ring", price: 59.99, image: "/assets/game_cover.png", category: "Jeux" },
        { _id: "8", title: "FIFA 25", price: 69.99, image: "/assets/game_cover.png", category: "Jeux" }
    ];

    useEffect(() => {
        setProducts(fallbackProducts);
    }, []);

    return (
        <div style={{ paddingBottom: '50px' }}>
            {/* Carousel Slider */}
            <HeroSlider />

            {/* Dashboard Stats */}
            <StatsCards />

            {/* Best Sellers */}
            <section className="container" style={{ marginTop: '20px' }}>
                <h2 className="section-title">MEILLEURES VENTES</h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)', // Force 4 columns like the image
                    gap: '25px'
                }}>
                    {products.map(p => (
                        <ProductCard key={p._id} product={p} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
