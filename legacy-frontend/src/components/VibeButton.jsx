import React, { useRef, useEffect, useState } from 'react';

const VibeButton = ({ children, onClick, loading, className = "", type = "button", disabled }) => {
    const buttonRef = useRef(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (buttonRef.current) {
            const updateWidth = () => {
                setWidth(buttonRef.current.offsetWidth);
            };
            updateWidth();
            window.addEventListener('resize', updateWidth);
            return () => window.removeEventListener('resize', updateWidth);
        }
    }, []);

    return (
        <button
            ref={buttonRef}
            type={type}
            onClick={onClick}
            disabled={loading || disabled}
            className={`btn-vibe group ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{ '--btn-width': `${width}px` }}
        >
            <div className="top-glow"></div>
            <div className="shimmer-effect"></div>

            {/* Dot Wrapper: Handles Horizontal Movement */}
            <div className="vibe-dot-container">
                {/* Inner Dot: Handles Pulsing and Scaling */}
                <div className="vibe-dot-inner">
                    <svg className="arrow-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                </div>
            </div>

            <span className="w-full text-center relative z-10">
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Processando...</span>
                    </div>
                ) : children}
            </span>
        </button>
    );
};

export default VibeButton;
