import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";
function QuickCreateSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  getOptionLabel = (option) => option.name,
  createUrl,
  createPayload = {},
  createTitle = "Add new",
  placeholder = "Select...",
  error,
  onCreated
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || isSaving) return;
    setIsSaving(true);
    setCreateError("");
    try {
      const response = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json"
        },
        body: JSON.stringify({ ...createPayload, name })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message ?? `Server returned ${response.status}`);
      }
      onCreated?.(result);
      onChange(result.id);
      setNewName("");
      setIsCreating(false);
    } catch (err) {
      setCreateError(err.message ?? "Failed to create.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
    if (e.key === "Escape") {
      setIsCreating(false);
      setCreateError("");
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(InputLabel, { htmlFor: id, value: label }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setIsCreating(!isCreating),
          className: "text-xs font-medium text-indigo-600 hover:text-indigo-800",
          children: isCreating ? "Cancel" : "+ New"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(
      "select",
      {
        id,
        className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
        value,
        onChange: (e) => onChange(e.target.value),
        children: [
          /* @__PURE__ */ jsx("option", { value: "", children: placeholder }),
          options.map((option) => /* @__PURE__ */ jsx("option", { value: option.id, children: getOptionLabel(option) }, option.id))
        ]
      }
    ),
    isCreating && /* @__PURE__ */ jsxs("div", { className: "mt-2 rounded-md border border-indigo-200 bg-indigo-50 p-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900",
            value: newName,
            onChange: (e) => setNewName(e.target.value),
            onKeyDown: handleKeyDown,
            placeholder: `${createTitle}...`,
            autoFocus: true
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleCreate,
            disabled: isSaving || !newName.trim(),
            className: "whitespace-nowrap rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50",
            children: isSaving ? "Adding..." : "Add"
          }
        )
      ] }),
      createError && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: createError })
    ] }),
    /* @__PURE__ */ jsx(InputError, { message: error, className: "mt-2" })
  ] });
}
export {
  QuickCreateSelect as Q
};
