import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { createPortal } from "react-dom";

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = "warning", // warning, success, info, danger
    confirmText = "CONFIRMER",
    cancelText = "ANNULER",
    confirmColor = "#ff4757",
    loading = false
}) => {
    if (!isOpen) return null;

    const icons = {
        warning: { Icon: FaExclamationTriangle, color: "#ff9900" },
        danger: { Icon: FaExclamationTriangle, color: "#ff4757" },
        success: { Icon: FaCheckCircle, color: "#00d285" },
        info: { Icon: FaInfoCircle, color: "#0099ff" }
    };

    const { Icon, color } = icons[type] || icons.warning;

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
                    maxWidth: '420px',
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

                {/* Icon */}
                <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '24px',
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color,
                    margin: '0 auto 25px',
                    border: `2px solid ${color}33`
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
                    {title}
                </h2>

                {/* Message */}
                <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: '1.7',
                    marginBottom: '35px',
                    fontWeight: '500',
                    fontSize: '0.95rem'
                }}>
                    {message}
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="btn"
                        style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '16px',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.background = 'rgba(255,255,255,0.1)';
                                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.05)';
                            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="btn"
                        style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '16px',
                            background: confirmColor,
                            color: '#fff',
                            fontWeight: '900',
                            fontSize: '0.9rem',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            boxShadow: `0 8px 20px ${confirmColor}44`,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = `0 12px 25px ${confirmColor}55`;
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = `0 8px 20px ${confirmColor}44`;
                        }}
                    >
                        {loading ? "CHARGEMENT..." : confirmText}
                    </button>
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes scaleIn {
                        from { transform: scale(0.9); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
