export default function ApplicationLogo(props) {
    return (
        <svg {...props} viewBox="0 0 316 316" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#912018" />
                    <stop offset="100%" stopColor="#293056" />
                </linearGradient>
            </defs>
            <path
                fill="url(#logo-gradient)"
                d="M158 28C88.7 28 32 84.7 32 154s56.7 126 126 126 126-56.7 126-126S227.3 28 158 28zm0 226c-55.1 0-100-44.9-100-100s44.9-100 100-100 100 44.9 100 100-44.9 100-100 100z"
            />
            <path
                fill="url(#logo-gradient)"
                d="M158 78c-41.8 0-76 34.2-76 76s34.2 76 76 76 76-34.2 76-76-34.2-76-76-76zm20 96h-40v-40h40v40z"
            />
            <text
                x="158"
                y="190"
                textAnchor="middle"
                fill="url(#logo-gradient)"
                fontSize="36"
                fontWeight="bold"
                fontFamily="serif"
            >
                NOBU
            </text>
        </svg>
    );
}
