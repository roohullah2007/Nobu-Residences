import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
const getCsrfToken$1 = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";
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
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedOption = options.find((option) => String(option.id) === String(value));
  const filteredOptions = query.trim() ? options.filter((option) => getOptionLabel(option).toLowerCase().includes(query.trim().toLowerCase())) : options;
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
          "X-CSRF-TOKEN": getCsrfToken$1(),
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
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          id,
          type: "text",
          role: "combobox",
          "aria-expanded": isOpen,
          autoComplete: "off",
          className: "mt-1 block w-full rounded-md !border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900 pr-8",
          value: isOpen ? query : selectedOption ? getOptionLabel(selectedOption) : "",
          placeholder: selectedOption ? getOptionLabel(selectedOption) : placeholder,
          onFocus: () => {
            setIsOpen(true);
            setQuery("");
          },
          onChange: (e) => setQuery(e.target.value),
          onBlur: () => setTimeout(() => setIsOpen(false), 100),
          onKeyDown: (e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              e.currentTarget.blur();
            }
            if (e.key === "Enter") {
              e.preventDefault();
              if (filteredOptions.length === 1) {
                onChange(String(filteredOptions[0].id));
                setIsOpen(false);
                e.currentTarget.blur();
              }
            }
          }
        }
      ),
      /* @__PURE__ */ jsx(
        "svg",
        {
          className: "pointer-events-none absolute right-2.5 top-1/2 mt-0.5 h-4 w-4 -translate-y-1/2 text-gray-400",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
        }
      ),
      isOpen && /* @__PURE__ */ jsxs("ul", { className: "absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg", children: [
        /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "block w-full px-3 py-1.5 text-left text-gray-500 hover:bg-gray-50",
            onMouseDown: (e) => {
              e.preventDefault();
              onChange("");
              setIsOpen(false);
            },
            children: placeholder
          }
        ) }),
        filteredOptions.map((option) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `block w-full px-3 py-1.5 text-left hover:bg-indigo-50 ${String(option.id) === String(value) ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-900"}`,
            onMouseDown: (e) => {
              e.preventDefault();
              onChange(String(option.id));
              setIsOpen(false);
            },
            children: getOptionLabel(option)
          }
        ) }, option.id)),
        filteredOptions.length === 0 && /* @__PURE__ */ jsx("li", { className: "px-3 py-1.5 text-gray-400", children: 'No matches — use "+ New" to add it' })
      ] })
    ] }),
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
const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ?? "";
function QuickCreateInline({
  createUrl,
  createPayload = {},
  buttonLabel = "+ New",
  placeholder = "Name...",
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
  if (!isCreating) {
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setIsCreating(true),
        className: "text-xs font-medium text-indigo-600 hover:text-indigo-800",
        children: buttonLabel
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-indigo-200 bg-indigo-50 p-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          className: "block w-full rounded-md !border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900",
          value: newName,
          onChange: (e) => setNewName(e.target.value),
          onKeyDown: handleKeyDown,
          placeholder,
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
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setIsCreating(false);
            setCreateError("");
          },
          className: "whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900",
          children: "Cancel"
        }
      )
    ] }),
    createError && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: createError })
  ] });
}
export {
  QuickCreateSelect as Q,
  QuickCreateInline as a
};
