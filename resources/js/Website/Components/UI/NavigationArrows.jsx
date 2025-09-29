import React from 'react';

/**
 * Navigation Arrow Button Component
 * Converted from the provided CSS to Tailwind
 */

export const ArrowButton = ({ direction = 'left', onClick, className = '' }) => {
    const isLeft = direction === 'left';

    return (
        <button
            onClick={onClick}
            className={`
                flex flex-row justify-end items-center
                p-1 w-8 h-8 rounded-full
                bg-white hover:bg-gray-100 transition-colors
                ${isLeft ? '-scale-x-100' : ''}
                ${className}
            `}
            aria-label={`Navigate ${direction}`}
        >
            <svg
                className={`w-6 h-6 ${isLeft ? '-scale-x-100' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </button>
    );
};

/**
 * Navigation Arrows Container
 * Displays prev/next navigation arrows
 */
export const NavigationArrows = ({ onPrev, onNext, className = '' }) => {
    return (
        <div className={`flex gap-2.5 ${className}`}>
            <ArrowButton direction="left" onClick={onPrev} />
            <ArrowButton direction="right" onClick={onNext} />
        </div>
    );
};

/**
 * Tailwind CSS equivalents for the provided styles:
 *
 * Original CSS -> Tailwind Classes:
 *
 * gap: 10px -> gap-2.5
 * width: 24px -> w-6
 * height: 24px -> h-6
 * border-radius: 100px -> rounded-full
 * transform: matrix(-1, 0, 0, 1, 0, 0) -> -scale-x-100
 *
 * display: flex -> flex
 * flex-direction: row -> flex-row
 * justify-content: flex-end -> justify-end
 * align-items: center -> items-center
 * padding: 4px -> p-1
 * width: 32px -> w-8
 * height: 32px -> h-8
 * border-radius: 32px -> rounded-full
 *
 * position: absolute -> absolute
 * left: 16.67% -> left-[16.67%]
 * right: 16.67% -> right-[16.67%]
 * top: 16.67% -> top-[16.67%]
 * bottom: 16.67% -> bottom-[16.67%]
 * background: #FFFFFF -> bg-white
 *
 * flex: none -> flex-none
 * order: 0 -> order-0
 * flex-grow: 0 -> flex-grow-0
 */

export default NavigationArrows;