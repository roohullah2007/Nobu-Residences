import React from 'react';

export default function GoogleLoginButton({ text = "Sign in with Google", className = "" }) {
    const handleGoogleLogin = () => {
        window.location.href = '/auth/google';
    };

    return (
        <button
            type="button"
            onClick={handleGoogleLogin}
            className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
        >
            <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g fill="none" fillRule="evenodd">
                    <path
                        d="M23.64 12.2045c0-.8181-.0727-1.6072-.2091-2.3681H12v4.4772h6.5181c-.2818 1.5109-1.1318 2.7909-2.4045 3.6545v3.0409h3.8954c2.2772-2.0954 3.5909-5.1818 3.5909-8.8045z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 24c3.24 0 5.9573-.1091 7.9091-2.9636l-3.8954-3.0409c-1.0727.7182-2.4409 1.1409-4.0137 1.1409-3.0909 0-5.7091-2.0863-6.6454-4.8954H1.3636v3.1363C3.2818 21.1636 7.3363 24 12 24z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.3545 14.2318c-.2363-.7182-.3727-1.4909-.3727-2.2318s.1364-1.5136.3727-2.2318V6.6318H1.3636C.4909 8.3636 0 10.1454 0 12s.4909 3.6364 1.3636 5.3682l3.991-3.1364z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 4.7727c1.7409 0 3.3045.6 4.5318 1.7727l3.3954-3.3954C17.9454.9818 15.2318 0 12 0 7.3363 0 3.2818 2.8364 1.3636 6.6318l3.991 3.1364C6.2909 6.8591 9.109 4.7727 12 4.7727z"
                        fill="#EA4335"
                    />
                </g>
            </svg>
            <span>{text}</span>
        </button>
    );
}