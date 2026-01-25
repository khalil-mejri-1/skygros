import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const HeroSlider = ({ slides = [] }) => {
    // If no slides, we can either return null or show a placeholder. 
    // Ideally the parent handles loading.

    // We need to ensure we have slides to render
    const activeSlides = slides.length > 0 ? slides : [];

    const [activeIndex, setActiveIndex] = useState(0);
    const [screenSize, setScreenSize] = useState({
        isSmall: window.innerWidth <= 660,
        isMedium: window.innerWidth <= 930
    });

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                isSmall: window.innerWidth <= 660,
                isMedium: window.innerWidth <= 930
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextSlide = () => {
        if (activeSlides.length > 0) {
            setActiveIndex((prev) => (prev + 1) % activeSlides.length);
        }
    };

    const prevSlide = () => {
        if (activeSlides.length > 0) {
            setActiveIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
        }
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, []);

    const getSlideStyles = (index) => {
        const length = activeSlides.length;
        let diff = (index - activeIndex + length) % length;
        if (diff === 2) diff = -1;

        const { isSmall, isMedium } = screenSize;

        const baseStyles = {
            position: 'absolute',
            top: '50%',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: isSmall ? '16px' : '24px',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        };

        if (diff === 0) {
            return {
                ...baseStyles,
                left: '50%',
                transform: 'translate(-50%, -50%) scale(1)',
                width: isSmall ? '90%' : isMedium ? '85%' : '75%',
                height: isSmall ? '240px' : isMedium ? '320px' : '420px',
                zIndex: 20,
                opacity: 1,
                filter: 'brightness(1.1)'
            };
        } else if (diff === 1) {
            return {
                ...baseStyles,
                left: '100%',
                transform: isSmall ? 'translate(0%, -50%) scale(0.6)' : 'translate(-85%, -50%) scale(0.8)',
                width: isSmall ? '50%' : isMedium ? '65%' : '65%',
                height: isSmall ? '180px' : isMedium ? '260px' : '340px',
                zIndex: 10,
                opacity: isSmall ? 0 : 0.4,
                filter: 'brightness(0.4) blur(2px)',
                cursor: 'pointer'
            };
        } else {
            return {
                ...baseStyles,
                left: '0%',
                transform: isSmall ? 'translate(-100%, -50%) scale(0.6)' : 'translate(-15%, -50%) scale(0.8)',
                width: isSmall ? '50%' : isMedium ? '65%' : '65%',
                height: isSmall ? '180px' : isMedium ? '260px' : '340px',
                zIndex: 10,
                opacity: isSmall ? 0 : 0.4,
                filter: 'brightness(0.4) blur(2px)',
                cursor: 'pointer'
            };
        }
    };

    return (
        <div style={{ background: 'var(--bg-primary)', padding: screenSize.isSmall ? '30px 0' : '60px 0', overflow: 'hidden' }}>
            <div className="container" style={{
                position: 'relative',
                height: screenSize.isSmall ? '260px' : screenSize.isMedium ? '340px' : '450px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>

                {activeSlides.map((slide, index) => {
                    const styles = getSlideStyles(index);
                    const isActive = index === activeIndex;

                    let clickHandler = null;
                    const diff = (index - activeIndex + activeSlides.length) % activeSlides.length;
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
                                left: screenSize.isSmall ? '20px' : '60px',
                                transform: isActive ? 'translateY(-50%)' : 'translateY(-40%)',
                                zIndex: 20,
                                opacity: isActive ? 1 : 0,
                                transition: 'all 0.6s ease 0.3s',
                                maxWidth: '500px'
                            }}>
                                <span style={{
                                    color: slide.color,
                                    fontWeight: '800',
                                    letterSpacing: screenSize.isSmall ? '1px' : '3px',
                                    fontSize: screenSize.isSmall ? '0.6rem' : '0.8rem',
                                    textTransform: 'uppercase',
                                    marginBottom: '5px',
                                    display: 'block',
                                    fontFamily: 'var(--font-main)'
                                }}>
                                    {slide.subtitle}
                                </span>
                                <h1 style={{
                                    fontSize: screenSize.isSmall ? '1.8rem' : screenSize.isMedium ? '3rem' : '4.5rem',
                                    fontWeight: '900',
                                    lineHeight: '1',
                                    fontStyle: 'italic',
                                    textTransform: 'uppercase',
                                    textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    marginBottom: screenSize.isSmall ? '10px' : '20px',
                                    fontFamily: 'var(--font-main)',
                                    letterSpacing: screenSize.isSmall ? '-1px' : '-2px'
                                }}>
                                    {slide.title}
                                </h1>
                                <button className="btn btn-primary" style={{
                                    padding: screenSize.isSmall ? '8px 20px' : '14px 35px',
                                    fontSize: screenSize.isSmall ? '0.7rem' : '0.9rem'
                                }}>
                                    DÉCOUVRIR
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Refined Navigation Arrows */}
                <div onClick={(e) => { e.stopPropagation(); prevSlide(); }} style={{
                    position: 'absolute', top: '50%', left: screenSize.isSmall ? '5px' : '30px', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)',
                    width: screenSize.isSmall ? '35px' : '50px', height: screenSize.isSmall ? '35px' : '50px',
                    borderRadius: '50%', cursor: 'pointer', transition: '0.3s',
                    color: 'white', border: '1px solid rgba(255,255,255,0.1)', zIndex: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} className="hover-lift">
                    <FaChevronLeft size={screenSize.isSmall ? 14 : 18} />
                </div>

                <div onClick={(e) => { e.stopPropagation(); nextSlide(); }} style={{
                    position: 'absolute', top: '50%', right: screenSize.isSmall ? '5px' : '30px', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)',
                    width: screenSize.isSmall ? '35px' : '50px', height: screenSize.isSmall ? '35px' : '50px',
                    borderRadius: '50%', cursor: 'pointer', transition: '0.3s',
                    color: 'white', border: '1px solid rgba(255,255,255,0.1)', zIndex: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} className="hover-lift">
                    <FaChevronRight size={screenSize.isSmall ? 14 : 18} />
                </div>

            </div>

            {/* Dots Premium */}
            <div className="flex justify-center gap-3 mt-8" style={{ position: 'relative', zIndex: 30 }}>
                {activeSlides.map((_, idx) => (
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
