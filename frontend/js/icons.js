const TechSVGIcons = {
    "b-1": `
        <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
                <linearGradient id="g-b1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38BDF8" />
                    <stop offset="100%" stop-color="#0369A1" />
                </linearGradient>
                <filter id="glow-b1">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx="50" cy="50" r="45" fill="rgba(30, 41, 59, 0.8)" stroke="url(#g-b1)" stroke-width="4" filter="url(#glow-b1)" />
            <polygon points="50,15 80,35 80,68 50,88 20,68 20,35" fill="rgba(56, 189, 248, 0.1)" stroke="url(#g-b1)" stroke-width="2" />
            <path d="M38,42 L28,50 L38,58 M62,42 L72,50 L62,58 M54,34 L46,66" stroke="url(#g-b1)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="50" cy="50" r="4" fill="#FFF" />
        </svg>
    `,
    "b-2": `
        <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
                <linearGradient id="g-b2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#06B6D4" />
                    <stop offset="100%" stop-color="#0891B2" />
                </linearGradient>
                <filter id="glow-b2">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx="50" cy="50" r="45" fill="rgba(30, 41, 59, 0.8)" stroke="url(#g-b2)" stroke-width="4" filter="url(#glow-b2)" />
            <path d="M50,20 L78,26 L72,68 L50,82 L28,68 L22,26 Z" fill="rgba(6, 182, 212, 0.1)" stroke="url(#g-b2)" stroke-width="3" stroke-linejoin="round" />
            <path d="M40,55 L58,37 L63,42 L45,60 Z" fill="#FFF" />
            <path d="M63,42 L58,37 L61,31 C63,28 68,28 70,30 C72,32 72,37 69,39 Z" fill="url(#g-b2)" />
            <path d="M45,60 C42,63 36,65 32,66 C33,62 35,56 38,53 Z" fill="#E2E8F0" />
            <path d="M30,30 L34,34 M70,64 L74,68 M68,25 L70,29" stroke="#FFF" stroke-width="2" stroke-linecap="round" />
        </svg>
    `,
    "b-3": `
        <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
                <linearGradient id="g-b3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#F59E0B" />
                    <stop offset="100%" stop-color="#D97706" />
                </linearGradient>
                <filter id="glow-b3">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx="50" cy="50" r="45" fill="rgba(30, 41, 59, 0.8)" stroke="url(#g-b3)" stroke-width="4" filter="url(#glow-b3)" />
            <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="rgba(245, 158, 11, 0.1)" stroke="url(#g-b3)" stroke-width="3" />
            <text x="35" y="62" font-family="'Outfit', sans-serif" font-weight="900" font-size="28" fill="url(#g-b3)">JS</text>
            <path d="M68,36 L64,48 L74,48 L66,64 L68,52 L58,52 Z" fill="#FFF" filter="drop-shadow(0 0 4px rgba(245, 158, 11, 0.8))" />
        </svg>
    `,
    "b-4": `
        <svg viewBox="0 0 100 100" width="100%" height="100%">
            <defs>
                <linearGradient id="g-b4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#C084FC" />
                    <stop offset="50%" stop-color="#8B5CF6" />
                    <stop offset="100%" stop-color="#5B21B6" />
                </linearGradient>
                <filter id="glow-b4">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx="50" cy="50" r="45" fill="rgba(30, 41, 59, 0.8)" stroke="url(#g-b4)" stroke-width="4" filter="url(#glow-b4)" />
            <path d="M24,65 L76,65 L82,40 L65,52 L50,30 L35,52 L18,40 Z" fill="url(#g-b4)" stroke="#FFF" stroke-width="2" stroke-linejoin="round" />
            <circle cx="32" cy="61" r="2.5" fill="#FFF" />
            <circle cx="50" cy="61" r="2.5" fill="#FFF" />
            <circle cx="68" cy="61" r="2.5" fill="#FFF" />
            <circle cx="18" cy="38" r="3.5" fill="#F43F5E" />
            <circle cx="50" cy="28" r="3.5" fill="#22C55E" />
            <circle cx="82" cy="38" r="3.5" fill="#06B6D4" />
            <path d="M30,72 L70,72" stroke="url(#g-b4)" stroke-width="3" stroke-linecap="round" />
            <path d="M40,78 L60,78" stroke="url(#g-b4)" stroke-width="2" stroke-linecap="round" />
        </svg>
    `
};

window.TechSVGIcons = TechSVGIcons;