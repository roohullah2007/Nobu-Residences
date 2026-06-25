import{j as e}from"./app-DooxqIKl.js";const n=({direction:t="left",onClick:r,className:s=""})=>{const o=t==="left";return e.jsx("button",{onClick:r,className:`
                flex flex-row justify-end items-center
                p-1 w-8 h-8 rounded-full
                bg-white hover:bg-gray-100 transition-colors
                ${o?"-scale-x-100":""}
                ${s}
            `,"aria-label":`Navigate ${t}`,children:e.jsx("svg",{className:`w-6 h-6 ${o?"-scale-x-100":""}`,fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5l7 7-7 7"})})})},l=({onPrev:t,onNext:r,className:s=""})=>e.jsxs("div",{className:`flex gap-2.5 ${s}`,children:[e.jsx(n,{direction:"left",onClick:t}),e.jsx(n,{direction:"right",onClick:r})]});export{n as ArrowButton,l as NavigationArrows,l as default};
