import { jsx, jsxs } from "react/jsx-runtime";
function HistoryTimeline({ pageContent, building = {} }) {
  const buildingName = building.name || "Nobu Residences";
  const historyContent = pageContent?.history || {};
  const eyebrow = historyContent.eyebrow || "Heritage";
  const title = historyContent.title || `The Story of ${buildingName}`;
  const subtitle = historyContent.subtitle || `From vision to move-in — the journey of ${buildingName} in Toronto's Entertainment District.`;
  const rawItems = Array.isArray(historyContent.items) && historyContent.items.length ? historyContent.items : [
    { year: "2017", title: "Vision Unveiled", text: "Madison Group and Westdale Properties announce a landmark Nobu-branded development for Toronto's Entertainment District." },
    { year: "2018", title: "Heritage Reimagined", text: "Plans incorporate the restoration of the historic Pilkington Glass Factory podium at 15 Mercer Street." },
    { year: "2020", title: "Construction Begins", text: "Excavation and foundation work commence on the twin-tower residential community." },
    { year: "2023", title: "Topping Off", text: "Both 49-storey towers reach their full height above the King West skyline." },
    { year: String(building.year_built || "2024"), title: "Residents Move In", text: `${buildingName} welcomes its first homeowners, alongside the Nobu Hotel and Restaurant.` }
  ];
  const milestones = rawItems.map((m, i) => ({
    year: String(m.year ?? ""),
    title: m.title || "",
    text: m.text || m.body || m.description || "",
    key: `${m.year || i}-${m.title || i}`
  }));
  return /* @__PURE__ */ jsx("section", { id: "history", className: "bg-neutral-900 py-20 md:py-28", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 md:px-0", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-gold-400 text-[11px] tracking-[0.3em] uppercase mb-3", children: eyebrow }),
      /* @__PURE__ */ jsx("h2", { className: "font-playfair text-3xl md:text-4xl text-white mb-4", children: title }),
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-white/50 text-base max-w-xl mx-auto", children: subtitle })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute left-[23px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[2px] bg-white/10" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-10", children: milestones.map((m, i) => {
        const even = i % 2 === 0;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `relative flex flex-col ${even ? "md:flex-row" : "md:flex-row-reverse"} items-start md:items-center gap-6 md:gap-10`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "absolute left-[16px] md:left-1/2 md:-translate-x-1/2 w-[16px] h-[16px] rounded-full bg-gold-500 border-4 border-neutral-900 z-10" }),
              /* @__PURE__ */ jsxs("div", { className: `ml-12 md:ml-0 md:w-[calc(50%-2.5rem)] ${even ? "md:text-right" : "md:text-left"}`, children: [
                /* @__PURE__ */ jsx("span", { className: "inline-block text-gold-400 text-[12px] tracking-[0.2em] uppercase font-semibold mb-1", children: m.year }),
                /* @__PURE__ */ jsx("h3", { className: "text-white text-lg font-medium mb-2", children: m.title }),
                /* @__PURE__ */ jsx("p", { className: "text-white/50 text-[14px] leading-relaxed", children: m.text })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "hidden md:block md:w-[calc(50%-2.5rem)]" })
            ]
          },
          m.key
        );
      }) })
    ] })
  ] }) });
}
export {
  HistoryTimeline as default
};
