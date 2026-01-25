import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { createPortal } from "react-dom";

const AlertModal = ({
    isOpen,
    onClose,
    title,
    message,
    type = "success", // success, error, info
    buttonText = "OK"
}) => {
    if (!isOpen) return null;

    const config = {
        success: {
            Icon: FaCheckCircle,
            color: "#00d285",
            title: title || "Succès !"
        },
        error: {
            Icon: FaExclamationTriangle,
            color: "#ff4757",
            title: title || "Erreur"
        },
        info: {
            Icon: FaInfoCircle,
            color: "#0099ff",
            title: title || "Information"
        }
    };

    const { Icon, color, title: defaultTitle } = config[type] || config.success;

    return createPortal(
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(5, 6, 12, 0.95)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(15px)',
                padding: '20px',
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }}
        >
            <div
                className="glass"
                style={{
                    width: '90%',
                    maxWidth: '400px',
                    padding: '30px',
                    borderRadius: '24px',
                    border: `1px solid ${color}33`,
                    textAlign: 'center',
                    boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px ${color}22`,
                    animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: '12px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.4)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.1)';
                        e.target.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.05)';
                        e.target.style.color = 'rgba(255,255,255,0.4)';
                    }}
                >
                    <FaTimes size={14} />
                </button>

                {/* Icon with animation */}
                <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color,
                    margin: '0 auto 20px',
                    border: `3px solid ${color}33`,
                    animation: 'iconPulse 0.6s ease-out'
                }}>
                    <Icon size={32} />
                </div>

                {/* Title */}
                <h2 style={{
                    fontSize: '1.6rem',
                    fontWeight: '800',
                    color: '#fff',
                    marginBottom: '15px',
                    letterSpacing: '-0.02em'
                }}>
                    {title || defaultTitle}
                </h2>

                {/* Message */}
                <p style={{
                    color: 'rgba(255,255,255,0.65)',
                    lineHeight: '1.7',
                    marginBottom: '35px',
                    fontWeight: '500',
                    fontSize: '0.95rem'
                }}>
                    {message}
                </p>

                {/* Button */}
                <button
                    onClick={onClose}
                    className="btn"
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '16px',
                        background: color,
                        color: '#fff',
                        fontWeight: '900',
                        fontSize: '0.95rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: `0 8px 20px ${color}44`,
                        transition: 'all 0.2s',
                        letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = `0 12px 25px ${color}55`;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = `0 8px 20px ${color}44`;
                    }}
                >
                    {buttonText}
                </button>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes scaleIn {
                        from { transform: scale(0.9); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    @keyframes iconPulse {
                        0% { transform: scale(0); opacity: 0; }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        </div>,
        document.body
    );
};

export default AlertModal;
