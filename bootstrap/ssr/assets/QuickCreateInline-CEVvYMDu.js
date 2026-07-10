import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
import { c as csrfHeaders } from "./csrf-Rc-HMXbg.js";
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
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const selectedOption = options.find((option) => String(option.id) === String(value));
  const filteredOptions = query.trim() ? options.filter((option) => getOptionLabel(option).toLowerCase().includes(query.trim().toLowerCase())) : options;
  const selectOption = (option) => {
    onChange(String(option.id));
    setIsOpen(false);
    setHighlightIndex(-1);
  };
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
          ...csrfHeaders(),
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
            setHighlightIndex(-1);
          },
          onChange: (e) => {
            setQuery(e.target.value);
            setHighlightIndex(-1);
          },
          onBlur: () => setTimeout(() => setIsOpen(false), 100),
          onKeyDown: (e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
              e.currentTarget.blur();
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setIsOpen(true);
              setHighlightIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightIndex((prev) => Math.max(prev - 1, 0));
            }
            if (e.key === "Enter") {
              e.preventDefault();
              const target = filteredOptions[highlightIndex] ?? (filteredOptions.length === 1 ? filteredOptions[0] : null);
              if (target) {
                selectOption(target);
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
        filteredOptions.map((option, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `block w-full px-3 py-1.5 text-left hover:bg-indigo-50 ${index === highlightIndex ? "bg-indigo-100 text-indigo-900" : String(option.id) === String(value) ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-900"}`,
            onMouseDown: (e) => {
              e.preventDefault();
              selectOption(option);
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
function QuickCreateInline({
  createUrl,
  createPayload = {},
  buttonLabel = "+ New",
  placeholder = "Name...",
  onCreated,
  withImage = false,
  imageFieldName = "icon_file"
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const fileInputRef = useRef(null);
  const resetForm = () => {
    setNewName("");
    setImageFile(null);
    setImagePreview("");
    setCreateError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };
  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || isSaving) return;
    setIsSaving(true);
    setCreateError("");
    try {
      let body;
      const headers = {
        ...csrfHeaders(),
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json"
      };
      if (imageFile) {
        body = new FormData();
        Object.entries(createPayload).forEach(([k, v]) => body.append(k, v));
        body.append("name", name);
        body.append(imageFieldName, imageFile);
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ ...createPayload, name });
      }
      const response = await fetch(createUrl, { method: "POST", headers, body });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message ?? `Server returned ${response.status}`);
      }
      onCreated?.(result);
      resetForm();
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
      resetForm();
    }
  };
  if (!isCreating) {
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setIsCreating(true),
        className: "inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-50",
        children: buttonLabel
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full rounded-md border border-indigo-200 bg-indigo-50 p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          className: "block flex-1 min-w-[200px] rounded-md !border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 !bg-white !text-gray-900",
          value: newName,
          onChange: (e) => setNewName(e.target.value),
          onKeyDown: handleKeyDown,
          placeholder,
          autoFocus: true
        }
      ),
      withImage && /* @__PURE__ */ jsxs("label", { className: "inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50", children: [
        imagePreview ? /* @__PURE__ */ jsx("img", { src: imagePreview, alt: "Icon preview", className: "h-5 w-5 object-contain" }) : /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" }) }),
        imageFile ? imageFile.name : "Upload icon",
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: "image/*,.svg",
            className: "hidden",
            onChange: handleFileChange
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: handleCreate,
          disabled: isSaving || !newName.trim(),
          className: "whitespace-nowrap rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50",
          children: isSaving ? "Adding..." : "Add"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setIsCreating(false);
            resetForm();
          },
          className: "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900",
          children: "Cancel"
        }
      )
    ] }),
    withImage && !imageFile && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Optional icon — SVG, PNG or JPG, max 2 MB." }),
    createError && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: createError })
  ] });
}
export {
  QuickCreateSelect as Q,
  QuickCreateInline as a
};
