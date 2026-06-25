import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
function FAQSection({ website, pageContent, building = {} }) {
  const faqData = pageContent?.faq || {};
  const faqEnabled = faqData?.enabled !== false;
  const buildingName = building?.name || "Nobu Residences";
  const eyebrow = faqData.eyebrow || "Knowledge Base";
  const title = faqData.title || "Frequently Asked Questions";
  const subtitle = faqData.subtitle || `Everything you need to know about buying, renting, or investing at ${buildingName}.`;
  const defaultItems = [
    { question: `Where is ${buildingName} located?`, answer: `${buildingName} is located at 15 Mercer Street in Toronto's Entertainment District, in the heart of King West — steps from the Financial District and major transit, with the Nobu Hotel and Restaurant on site.` },
    { question: "Who is the developer?", answer: "The building was developed by Madison Group in partnership with Westdale Properties." },
    { question: "What amenities are available?", answer: "Residents enjoy hospitality-grade amenities including 24-hour concierge/security, an outdoor pool, party and meeting rooms, a media room, a rooftop deck, and parking — plus direct access to the Nobu Hotel and Restaurant." },
    { question: "What suite types are available?", answer: "Suites range from studios to multi-bedroom residences. Live availability and pricing are shown in the listings above, updated every 15 minutes from the MLS®." },
    { question: "How do I schedule a viewing?", answer: "Use the contact form below or reach our team directly by phone or email — we will tailor a shortlist of available suites and arrange a private viewing." }
  ];
  const groups = Array.isArray(faqData.groups) && faqData.groups.length ? faqData.groups.map((g) => ({ title: g.title || "", items: Array.isArray(g.items) ? g.items : [] })) : [{ title: "", items: Array.isArray(faqData.items) && faqData.items.length ? faqData.items : defaultItems }];
  const [openKey, setOpenKey] = useState(null);
  if (!faqEnabled) return null;
  return /* @__PURE__ */ jsx("section", { id: "faq", className: "bg-white py-20 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 md:px-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-14", children: [
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gold-500 text-[11px] tracking-[0.3em] uppercase mb-3", children: eyebrow }),
      /* @__PURE__ */ jsx("h2", { className: "font-playfair text-3xl md:text-4xl text-neutral-900 mb-4", children: title }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-neutral-500 text-sm max-w-xl mx-auto", children: subtitle })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-10", children: groups.map((group, gi) => /* @__PURE__ */ jsxs("div", { children: [
      group.title && /* @__PURE__ */ jsx("h3", { className: "text-[12px] tracking-[0.2em] uppercase text-gold-500 font-semibold mb-4", children: group.title }),
      /* @__PURE__ */ jsx("div", { className: "bg-neutral-50 rounded-xl overflow-hidden divide-y divide-neutral-200", children: group.items.map((item, ii) => {
        const key = `${gi}-${ii}`;
        const open = openKey === key;
        const question = item.question || item.q || "";
        const answer = item.answer || item.a || item.body || "";
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setOpenKey(open ? null : key),
              className: "w-full flex items-center justify-between px-6 py-5 text-left group",
              "aria-expanded": open,
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-[15px] text-neutral-800 font-medium pr-4 group-hover:text-neutral-600 transition-colors", children: question }),
                /* @__PURE__ */ jsxs(
                  "svg",
                  {
                    xmlns: "http://www.w3.org/2000/svg",
                    width: "18",
                    height: "18",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    className: `text-neutral-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-45" : ""}`,
                    "aria-hidden": "true",
                    children: [
                      /* @__PURE__ */ jsx("path", { d: "M5 12h14" }),
                      /* @__PURE__ */ jsx("path", { d: "M12 5v14" })
                    ]
                  }
                )
              ]
            }
          ),
          open && answer && /* @__PURE__ */ jsx("div", { className: "px-6 pb-5", children: /* @__PURE__ */ jsx("p", { className: "text-[14px] text-neutral-500 leading-relaxed", children: answer }) })
        ] }, key);
      }) })
    ] }, group.title || `group-${gi}`)) })
  ] }) });
}
export {
  FAQSection as default
};
