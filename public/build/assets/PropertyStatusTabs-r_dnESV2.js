import{c as p,r as f,j as e}from"./app-CTSzo_QS.js";import g from"./PropertyRooms-CQEfFtDO.js";import u from"./MortgageCalculator-C81Y6NsK.js";import w from"./NearbySchools-kVbe-dNi.js";import b from"./Amenities-Bvsm3dAS.js";const S=()=>{const{globalWebsite:i,website:l}=p().props,r=i?.brand_colors||l?.brand_colors||{},o=r.button_primary_bg||"#293056",d=r.button_primary_text||"#FFFFFF",[n,c]=f.useState("overview"),a={daysOnMarket:25,saleDate:"Apr 25, 2025",status:"Sold",description:"This is 2nd Bedroom Room Rental. At Luxury and Fashionable Condo alongside world-renowned Nobu Hospitality, state-of-the-art indoor and outdoor amenities including ground floor commercial retail, flexible private social function and meeting space, a state-of-the-art fitness centre and Zen Garden outdoor terrace. All Luxury Finishes, Custom Made Rolling Blinds. Tenant Has Own Bathroom, Sharing Living Room, Kitchen and Laundry. Steps to CN Tower, Rogers Centre, Subways."},m=[{id:"overview",label:"Overview"},{id:"rooms",label:"Property rooms"},{id:"mortgage",label:"Mortgage calculator"},{id:"schools",label:"Nearby schools"},{id:"amenities",label:"Amenities"},{id:"neighbourhoods",label:"Neighbourhoods"}],x=t=>{c(t)},h=()=>{switch(n){case"overview":return e.jsx("div",{className:"flex flex-col items-start gap-2 w-full max-w-[1280px]",children:e.jsxs("div",{className:"w-full font-space-grotesk text-lg leading-7 tracking-tight text-[#252B37]",children:[e.jsx("span",{className:"font-bold mr-2",children:"About"}),e.jsx("span",{className:"font-normal",children:a.description})]})});case"rooms":return e.jsx("div",{className:"py-6 rounded-xl shadow-sm",children:e.jsx(g,{})});case"mortgage":return e.jsx("div",{className:"py-6 rounded-xl shadow-sm",children:e.jsx(u,{})});case"schools":return e.jsx("div",{className:"py-6 rounded-xl shadow-sm",children:e.jsx(w,{})});case"amenities":return e.jsx("div",{className:"py-6",children:e.jsx(b,{propertyData:a})});case"neighbourhoods":return e.jsxs("div",{className:"p-8 bg-white rounded-xl shadow-sm",children:[e.jsx("h3",{className:"font-red-hat font-bold text-2xl text-[#252B37] mb-5",children:"Neighbourhood Overview"}),e.jsxs("div",{className:"flex flex-col gap-6",children:[e.jsxs("div",{className:"bg-gray-50 p-5 rounded-lg",children:[e.jsx("h4",{className:"font-red-hat font-bold text-lg text-[#293056] mb-3",children:"King West"}),e.jsx("p",{className:"text-[#535862] leading-relaxed",children:"King West is one of Toronto's most vibrant neighborhoods, known for its entertainment district, fine dining, and luxury condominiums. The area offers easy access to the financial district and is home to many of the city's best restaurants and nightlife venues."})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-red-hat font-bold text-lg text-[#293056] mb-4",children:"What's Nearby"}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:[{name:"CN Tower",time:"5 min walk"},{name:"Rogers Centre",time:"3 min walk"},{name:"Union Station",time:"8 min walk"},{name:"St. Lawrence Market",time:"12 min walk"},{name:"Harbourfront",time:"10 min walk"},{name:"Financial District",time:"15 min walk"}].map((t,s)=>e.jsxs("div",{className:"flex flex-col bg-white p-4 rounded-md border-l-4 border-[#293056]",children:[e.jsx("strong",{className:"text-[#293056] mb-1",children:t.name}),e.jsx("span",{className:"text-[#535862] text-sm",children:t.time})]},s))})]}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-red-hat font-bold text-lg text-[#293056] mb-4",children:"Neighbourhood Stats"}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[{value:"9.2/10",label:"Walk Score"},{value:"8.8/10",label:"Transit Score"},{value:"7.5/10",label:"Bike Score"}].map((t,s)=>e.jsxs("div",{className:"flex flex-col items-center bg-white p-5 rounded-lg text-center",children:[e.jsx("span",{className:"text-2xl font-bold text-[#3E4784] mb-1",children:t.value}),e.jsx("span",{className:"text-[#535862] text-sm",children:t.label})]},s))})]})]})]});default:return null}};return e.jsxs("div",{className:"w-full max-w-[1280px] mx-auto px-5 py-0",children:[e.jsxs("div",{className:"flex flex-col items-start gap-6 w-full relative z-10",children:[e.jsxs("div",{className:"flex flex-row items-start gap-[22px] h-10",children:[e.jsx("div",{className:"flex items-center px-2 gap-2 w-[138px] h-10 rounded-xl",style:{backgroundColor:o},children:e.jsxs("span",{className:"font-work-sans font-bold text-sm leading-6 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-[122px]",style:{color:d},children:[a.daysOnMarket," Days on Market"]})}),e.jsx("div",{className:"flex items-center px-2 gap-2 w-[151px] h-10 bg-[#3E4784] rounded-xl",children:e.jsxs("span",{className:"font-work-sans font-bold text-sm leading-6 tracking-tight text-white whitespace-nowrap overflow-hidden text-ellipsis w-[135px]",children:[a.status," on ",a.saleDate]})})]}),e.jsx("div",{className:"flex flex-col items-start gap-[18px] w-full",children:e.jsx("div",{className:"flex flex-row items-center gap-[14px] h-[50px] overflow-x-auto flex-wrap max-w-full",children:m.map((t,s)=>e.jsx("div",{className:`flex justify-center items-center p-2.5 cursor-pointer transition-all duration-300 border-b ${n===t.id?"border-[#252B37]":"border-transparent hover:border-[#3E4784]"} ${s===0?"min-w-[108px]":s===1?"min-w-[163px]":s===2?"min-w-[202px]":s===3?"min-w-[158px]":s===4?"min-w-[112px]":"min-w-[173px]"} h-[50px]`,onClick:()=>x(t.id),children:e.jsx("span",{className:`font-red-hat font-bold text-xl leading-[30px] tracking-tight whitespace-nowrap flex items-center ${n===t.id?"text-[#252B37]":"text-[#252B37] hover:text-[#3E4784]"}`,children:t.label})},t.id))})})]}),e.jsx("div",{className:"w-full relative min-h-[200px] mt-5",children:e.jsx("div",{className:"w-full animate-fadeIn",children:h()})}),e.jsx("style",{jsx:!0,children:`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .flex-row.items-center.gap-\\[14px\\] {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            height: auto;
          }
          
          .min-w-\\[108px\\], .min-w-\\[163px\\], .min-w-\\[202px\\], .min-w-\\[158px\\], .min-w-\\[112px\\], .min-w-\\[173px\\] {
            min-width: auto;
            width: 100%;
            justify-content: flex-start;
            padding: 8px 12px;
            height: 40px;
          }
          
          .font-red-hat.font-bold.text-xl {
            font-size: 16px;
            line-height: 24px;
          }
        }
      `})]})};export{S as default};
