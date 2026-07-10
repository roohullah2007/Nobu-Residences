import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, useForm } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-B_5R_DFk.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { P as PrimaryButton } from "./PrimaryButton-DDF1xnxF.js";
import { T as TextInput } from "./TextInput-D0qTZeQv.js";
import { useState, useMemo } from "react";
const lightFormClass = "[&_input]:!bg-white [&_input]:!text-gray-900 [&_textarea]:!bg-white [&_textarea]:!text-gray-900 [&_select]:!bg-white [&_select]:!text-gray-900";
const labelFor = (key) => key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const TABS = [
  { id: "general", label: "General" },
  { id: "email", label: "Email & Notifications" }
];
function SettingsIndex({ schema, values, timezones = [], mail_drivers = [] }) {
  const [tab, setTab] = useState("general");
  const { flash } = usePage().props;
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Settings", children: [
    /* @__PURE__ */ jsx(Head, { title: "Settings" }),
    /* @__PURE__ */ jsxs("div", { className: `space-y-6 ${lightFormClass}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Settings" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Configure general site info and email notifications. API keys are managed in the server .env file." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-200 flex", children: TABS.map((t) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setTab(t.id),
            className: `px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700"}`,
            children: t.label
          },
          t.id
        )) }),
        flash?.success && /* @__PURE__ */ jsx("div", { className: "px-6 py-3 bg-green-50 border-b border-green-200 text-sm text-green-800", children: flash.success }),
        /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          tab === "general" && /* @__PURE__ */ jsx(GeneralTab, { schema: schema.general, values: values.general, timezones }),
          tab === "email" && /* @__PURE__ */ jsx(EmailTab, { schema: schema.email, values: values.email, mailDrivers: mail_drivers })
        ] })
      ] })
    ] })
  ] });
}
function GeneralTab({ schema, values, timezones }) {
  const initial = useMemo(() => {
    const o = { group: "general" };
    for (const f of schema) o[f.key] = values[f.key] ?? "";
    return o;
  }, [schema, values]);
  const { data, setData, put, processing, errors } = useForm(initial);
  const submit = (e) => {
    e.preventDefault();
    put(route("admin.settings.update"), { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: schema.map((f) => {
      if (f.key === "default_timezone") {
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: f.key, value: labelFor(f.key) }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: f.key,
              className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
              value: data[f.key] || "",
              onChange: (e) => setData(f.key, e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
                timezones.map((tz) => /* @__PURE__ */ jsx("option", { value: tz, children: tz }, tz))
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors[f.key], className: "mt-2" })
        ] }, f.key);
      }
      if (f.key === "contact_address" || f.key === "global_tracking_scripts") {
        const isTracking = f.key === "global_tracking_scripts";
        return /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: f.key, value: labelFor(f.key) }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: f.key,
              rows: isTracking ? 5 : 2,
              className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${isTracking ? "font-mono text-xs" : ""}`,
              value: data[f.key] || "",
              onChange: (e) => setData(f.key, e.target.value),
              placeholder: isTracking ? "<script>…<\/script> — tracking pixel injected into the <head> of every public website" : void 0
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors[f.key], className: "mt-2" }),
          isTracking && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Raw HTML snippet (e.g. Follow Up Boss pixel) rendered on every public website. Leave empty to disable." })
        ] }, f.key);
      }
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: f.key, value: labelFor(f.key) }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: f.key,
            type: "text",
            className: "mt-1 block w-full",
            value: data[f.key] || "",
            onChange: (e) => setData(f.key, e.target.value),
            placeholder: placeholderFor(f.key)
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors[f.key], className: "mt-2" })
      ] }, f.key);
    }) }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, children: processing ? "Saving…" : "Save general settings" }) })
  ] });
}
function EmailTab({ schema, values, mailDrivers }) {
  const initial = useMemo(() => {
    const o = { group: "email" };
    for (const f of schema) o[f.key] = values[f.key] ?? (f.type === "boolean" ? false : "");
    return o;
  }, [schema, values]);
  const { data, setData, put, processing, errors } = useForm(initial);
  const submit = (e) => {
    e.preventDefault();
    put(route("admin.settings.update"), { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: schema.map((f) => {
      if (f.type === "boolean") {
        return /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: !!data[f.key],
              onChange: (e) => setData(f.key, e.target.checked),
              className: "mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700", children: labelFor(f.key) })
        ] }) }, f.key);
      }
      if (f.key === "mail_driver") {
        return /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: f.key, value: labelFor(f.key) }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: f.key,
              className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
              value: data[f.key] || "",
              onChange: (e) => setData(f.key, e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "— Select —" }),
                mailDrivers.map((m) => /* @__PURE__ */ jsx("option", { value: m, children: m }, m))
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors[f.key], className: "mt-2" })
        ] }, f.key);
      }
      return /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: f.key, value: labelFor(f.key) }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: f.key,
            type: "text",
            className: "mt-1 block w-full",
            value: data[f.key] || "",
            onChange: (e) => setData(f.key, e.target.value),
            placeholder: placeholderFor(f.key)
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors[f.key], className: "mt-2" })
      ] }, f.key);
    }) }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, children: processing ? "Saving…" : "Save email settings" }) })
  ] });
}
function placeholderFor(key) {
  const map = {
    site_name: "Nobu Residences",
    site_tagline: "Luxury condos in downtown Toronto",
    contact_email: "contact@example.com",
    contact_phone: "+1 (555) 123-4567",
    contact_address: "15 Mercer St, Toronto",
    facebook_url: "https://facebook.com/yourpage",
    instagram_url: "https://instagram.com/yourpage",
    twitter_url: "https://twitter.com/yourpage",
    linkedin_url: "https://linkedin.com/company/yourpage",
    mail_from_address: "no-reply@example.com",
    mail_from_name: "Nobu Residences",
    ploi_server_id: "87657",
    ploi_site_id: "307242"
  };
  return map[key] || "";
}
export {
  SettingsIndex as default
};
