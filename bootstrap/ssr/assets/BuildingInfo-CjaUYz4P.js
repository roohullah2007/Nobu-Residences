import { jsx, jsxs } from "react/jsx-runtime";
function BuildingInfo({ pageContent, building = {} }) {
  const aboutContent = pageContent?.about || {};
  const buildingImage = building.main_image || aboutContent.image || "/assets/building.jpg";
  const buildingName = building.name || "Nobu Residences";
  const clean = (v) => {
    if (v === null || v === void 0) return "";
    const s = String(v).trim();
    return s === "-" || s === "" ? "" : s;
  };
  const facts = [
    { label: "Developer", value: clean(building.developer_name) || "Madison Group" },
    { label: "Year Built", value: clean(building.year_built) || "2024" },
    { label: "Floors", value: clean(building.floors) || "45" },
    { label: "Total Units", value: clean(building.total_units) || "660" },
    { label: "Management", value: clean(building.management_name) },
    { label: "Corp #", value: clean(building.corp_number) }
  ].filter((f) => f.value !== "");
  const overviewText = building.description || aboutContent?.tabs?.overview?.content || `Rising above ${clean(building.street_address_1) || "15 Mercer Street"} in Toronto's Entertainment District, ${buildingName} pairs iconic residences with a hospitality-grade lifestyle. Home to the world-renowned Nobu Hotel and Restaurant, the building delivers concierge service, curated amenities, and suites ranging from intimate studios to expansive multi-bedroom residences.`;
  const addresses = (building.address ? building.address.split(",").map((a) => a.trim()) : [clean(building.street_address_1), clean(building.street_address_2)]).filter(Boolean);
  const heading = `A landmark address${addresses.length ? ` on ${addresses[0]}` : " on Mercer Street"}`;
  return /* @__PURE__ */ jsx("section", { id: "building", className: "bg-white py-16 md:py-24", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-screen-xl px-4 md:px-0", children: /* @__PURE__ */ jsxs("div", { className: "grid items-center gap-12 lg:grid-cols-2", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-work-sans text-xs uppercase tracking-[0.3em] text-gold-500", children: "The Building" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-2 font-playfair text-3xl md:text-4xl font-semibold text-neutral-900", children: heading }),
      /* @__PURE__ */ jsx("p", { className: "mt-5 font-work-sans text-base md:text-lg leading-relaxed text-neutral-500", children: overviewText }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3", children: facts.map((f) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-neutral-200 bg-neutral-50 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "font-work-sans text-[11px] uppercase tracking-[0.18em] text-neutral-400", children: f.label }),
        /* @__PURE__ */ jsx("p", { className: "mt-1.5 font-work-sans text-sm font-semibold text-neutral-900", children: f.value })
      ] }, f.label)) }),
      addresses.length > 1 && /* @__PURE__ */ jsx("div", { className: "mt-6 flex flex-wrap gap-3", children: addresses.map((a) => /* @__PURE__ */ jsx("span", { className: "rounded-full border border-gold-300 bg-gold-50 px-4 py-1.5 font-work-sans text-sm text-gold-700", children: a }, a)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-3xl border border-neutral-200", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: buildingImage,
          alt: `${buildingName} building`,
          className: "h-[420px] md:h-[560px] w-full object-cover",
          onError: (e) => {
            e.currentTarget.src = "/assets/nobu-building.jpg";
          }
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-5 -left-5 hidden rounded-2xl border border-gold-300 bg-white/90 px-6 py-4 backdrop-blur-sm shadow-lg md:block", children: [
        /* @__PURE__ */ jsx("p", { className: "font-playfair text-2xl font-semibold text-gold-600", children: "Nobu" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-neutral-500", children: "Hotel · Restaurant · Residences" })
      ] })
    ] })
  ] }) }) });
}
export {
  BuildingInfo as default
};
