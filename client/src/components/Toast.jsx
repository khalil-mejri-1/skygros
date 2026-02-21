import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for fade out animation
    };

    const config = {
        success: {
            icon: <FaCheckCircle size={20} />,
            color: '#00d285',
            bgColor: 'rgba(0, 210, 133, 0.1)',
            borderColor: 'rgba(0, 210, 133, 0.2)'
        },
        error: {
            icon: <FaExclamationCircle size={20} />,
            color: '#ff4757',
            bgColor: 'rgba(255, 71, 87, 0.1)',
            borderColor: 'rgba(255, 71, 87, 0.2)'
        },
        info: {
            icon: <FaInfoCircle size={20} />,
            color: '#0099ff',
            bgColor: 'rgba(0, 153, 255, 0.1)',
            borderColor: 'rgba(0, 153, 255, 0.2)'
        }
    };

    const { icon, color, bgColor, borderColor } = config[type] || config.success;

    return createPortal(
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            pointerEvents: 'none'
        }}>
            <div style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                background: 'rgba(15, 16, 32, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${borderColor}`,
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                color: '#fff',
                minWidth: '300px',
                transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                animation: 'toastSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div style={{ color: color, display: 'flex' }}>
                    {icon}
                </div>
                <div style={{ flex: 1, fontWeight: '600', fontSize: '0.9rem' }}>
                    {message}
                </div>
                <button
                    onClick={handleClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        transition: '0.3s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                    <FaTimes size={14} />
                </button>

                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '3px',
                    background: color,
                    width: '100%',
                    borderRadius: '0 0 0 16px',
                    animation: `toastProgress ${duration}ms linear forwards`,
                    transformOrigin: 'left'
                }} />

                <style>{`
                    @keyframes toastSlideIn {
                        from { transform: translateX(120%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes toastProgress {
                        from { transform: scaleX(1); }
                        to { transform: scaleX(0); }
                    }
                `}</style>
            </div>
        </div>,
        document.body
    );
};

export default Toast;
