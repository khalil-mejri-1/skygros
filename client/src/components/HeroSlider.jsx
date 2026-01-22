import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const HeroSlider = () => {
    const slides = [
        {
            id: 1,
            image: "/assets/slider2.png",
            title: "Cyberpunk Edge",
            subtitle: "FUTUR DU GAMING",
            color: "#ff9900"
        },
        {
            id: 2,
            image: "/assets/slider1.png",
            title: "Elden Legends",
            subtitle: "PRÉPAREZ-VOUS À CONQUÉRIR",
            color: "#8e44ad"
        },
        {
            id: 3,
            image: "/assets/slider3.png",
            title: "Sports Mondiaux",
            subtitle: "EXPÉRIENCE ULTIME",
            color: "#00d285"
        }
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, []);

    const getSlideStyles = (index) => {
        const length = slides.length;
        let diff = (index - activeIndex + length) % length;
        if (diff === 2) diff = -1;

        const baseStyles = {
            position: 'absolute',
            top: '50%',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        };

        if (diff === 0) {
            return {
                ...baseStyles,
                left: '50%',
                transform: 'translate(-50%, -50%) scale(1)',
                width: '75%',
                height: '420px',
                zIndex: 20,
                opacity: 1,
                filter: 'brightness(1.1)'
            };
        } else if (diff === 1) {
            return {
                ...baseStyles,
                left: '100%',
                transform: 'translate(-85%, -50%) scale(0.8)',
                width: '65%',
                height: '340px',
                zIndex: 10,
                opacity: 0.4,
                filter: 'brightness(0.4) blur(2px)',
                cursor: 'pointer'
            };
        } else {
            return {
                ...baseStyles,
                left: '0%',
                transform: 'translate(-15%, -50%) scale(0.8)',
                width: '65%',
                height: '340px',
                zIndex: 10,
                opacity: 0.4,
                filter: 'brightness(0.4) blur(2px)',
                cursor: 'pointer'
            };
        }
    };

    return (
        <div style={{ background: 'var(--bg-primary)', padding: '60px 0', overflow: 'hidden' }}>
            <div className="container" style={{ position: 'relative', height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                {slides.map((slide, index) => {
                    const styles = getSlideStyles(index);
                    const isActive = index === activeIndex;

                    let clickHandler = null;
                    const diff = (index - activeIndex + slides.length) % slides.length;
                    if (diff === 1) clickHandler = nextSlide;
                    if (diff === 2 || diff === -1) clickHandler = prevSlide;

                    return (
                        <div key={slide.id} style={styles} onClick={clickHandler}>
                            <img src={slide.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                            {/* Overlay Gradient */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to right, rgba(10, 11, 20, 0.9) 0%, rgba(10, 11, 20, 0.4) 40%, transparent 100%)',
                                opacity: isActive ? 1 : 0,
                                transition: 'opacity 0.6s ease'
                            }}></div>

                            {/* Left Content */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '60px',
                                transform: isActive ? 'translateY(-50%)' : 'translateY(-40%)',
                                zIndex: 20,
                                opacity: isActive ? 1 : 0,
                                transition: 'all 0.6s ease 0.3s',
                                maxWidth: '500px'
                            }}>
                                <span style={{
                                    color: slide.color,
                                    fontWeight: '800',
                                    letterSpacing: '3px',
                                    fontSize: '0.8rem',
                                    textTransform: 'uppercase',
                                    marginBottom: '10px',
                                    display: 'block',
                                    fontFamily: 'var(--font-main)'
                                }}>
                                    {slide.subtitle}
                                </span>
                                <h1 style={{
                                    fontSize: '4.5rem',
                                    fontWeight: '900',
                                    lineHeight: '1',
                                    fontStyle: 'italic',
                                    textTransform: 'uppercase',
                                    textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    marginBottom: '20px',
                                    fontFamily: 'var(--font-main)',
                                    letterSpacing: '-2px'
                                }}>
                                    {slide.title}
                                </h1>
                                <button className="btn btn-primary" style={{ padding: '14px 35px' }}>
                                    DÉCOUVRIR
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Refined Navigation Arrows */}
                <div onClick={(e) => { e.stopPropagation(); prevSlide(); }} style={{
                    position: 'absolute', top: '50%', left: '30px', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)',
                    width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s',
                    color: 'white', border: '1px solid rgba(255,255,255,0.1)', zIndex: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} className="hover-lift">
                    <FaChevronLeft size={18} />
                </div>

                <div onClick={(e) => { e.stopPropagation(); nextSlide(); }} style={{
                    position: 'absolute', top: '50%', right: '30px', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)',
                    width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s',
                    color: 'white', border: '1px solid rgba(255,255,255,0.1)', zIndex: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} className="hover-lift">
                    <FaChevronRight size={18} />
                </div>

            </div>

            {/* Dots Premium */}
            <div className="flex justify-center gap-3 mt-8" style={{ position: 'relative', zIndex: 30 }}>
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        style={{
                            width: activeIndex === idx ? '35px' : '10px',
                            height: '10px',
                            borderRadius: '5px',
                            background: activeIndex === idx ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.4s ease',
                            border: activeIndex === idx ? 'none' : '1px solid rgba(255,255,255,0.05)'
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
