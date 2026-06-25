import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
function RichTextEditor({
  value = "",
  onChange,
  placeholder = "",
  error = null,
  id,
  minHeight = "120px"
}) {
  const editorRef = useRef(null);
  const lastEmittedRef = useRef(value);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastEmittedRef.current) {
      el.innerHTML = value || "";
      lastEmittedRef.current = value || "";
    }
  }, [value]);
  const emit = () => {
    const html = editorRef.current?.innerHTML || "";
    lastEmittedRef.current = html;
    onChange?.(html);
  };
  const exec = (command, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };
  const promptLink = () => {
    const selectedUrl = document.getSelection()?.toString();
    const url = window.prompt("Link URL", selectedUrl?.startsWith("http") ? selectedUrl : "https://");
    if (!url) return;
    if (url === "unlink") {
      exec("unlink");
      return;
    }
    exec("createLink", url);
  };
  const isEmpty = !value || value === "<br>" || value === "<p></p>";
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: `rounded-md border ${error ? "border-red-300 ring-1 ring-red-300" : focused ? "border-indigo-500 ring-1 ring-indigo-500" : "border-gray-300"} bg-white shadow-sm overflow-hidden`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5", children: [
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("bold"), title: "Bold (Ctrl/Cmd-B)", children: /* @__PURE__ */ jsx("span", { className: "font-bold", children: "B" }) }),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("italic"), title: "Italic (Ctrl/Cmd-I)", children: /* @__PURE__ */ jsx("span", { className: "italic", children: "I" }) }),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("underline"), title: "Underline (Ctrl/Cmd-U)", children: /* @__PURE__ */ jsx("span", { className: "underline", children: "U" }) }),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("strikeThrough"), title: "Strikethrough", children: /* @__PURE__ */ jsx("span", { className: "line-through", children: "S" }) }),
        /* @__PURE__ */ jsx(ToolbarDivider, {}),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("formatBlock", "<h2>"), title: "Heading 2", children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-xs", children: "H2" }) }),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("formatBlock", "<h3>"), title: "Heading 3", children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-xs", children: "H3" }) }),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("formatBlock", "<p>"), title: "Paragraph", children: /* @__PURE__ */ jsx("span", { className: "text-xs", children: "P" }) }),
        /* @__PURE__ */ jsx(ToolbarDivider, {}),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("insertUnorderedList"), title: "Bulleted list", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 6h16M4 12h16M4 18h7" }) }) }),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("insertOrderedList"), title: "Numbered list", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01" }) }) }),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("formatBlock", "<blockquote>"), title: "Quote", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 7h6v4l-2 6H3l2-6V7zm12 0h6v4l-2 6h-4l2-6V7z" }) }) }),
        /* @__PURE__ */ jsx(ToolbarDivider, {}),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: promptLink, title: "Insert link", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }) }) }),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("unlink"), title: "Remove link", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M18.364 18.364l-12.728-12.728M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" }) }) }),
        /* @__PURE__ */ jsx(ToolbarDivider, {}),
        /* @__PURE__ */ jsx(ToolbarButton, { onClick: () => exec("removeFormat"), title: "Clear formatting", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 4h12M9 4v12m6-12v8m-9 4l12-12" }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        isEmpty && !focused && placeholder && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 px-3 py-2 text-sm text-gray-400 select-none", children: placeholder }),
        /* @__PURE__ */ jsx(
          "div",
          {
            id,
            ref: editorRef,
            contentEditable: true,
            suppressContentEditableWarning: true,
            role: "textbox",
            "aria-multiline": "true",
            spellCheck: true,
            onFocus: () => setFocused(true),
            onBlur: () => setFocused(false),
            onInput: emit,
            onPaste: (e) => {
              e.preventDefault();
              const text = (e.clipboardData || window.clipboardData).getData("text/plain");
              document.execCommand("insertText", false, text);
            },
            className: "prose prose-sm max-w-none px-3 py-2 text-sm text-gray-900 focus:outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-indigo-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic",
            style: { minHeight }
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600", children: error })
  ] });
}
function ToolbarButton({ onClick, title, children }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onMouseDown: (e) => {
        e.preventDefault();
      },
      onClick,
      title,
      className: "inline-flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-gray-700 hover:bg-gray-200 active:bg-gray-300",
      children
    }
  );
}
function ToolbarDivider() {
  return /* @__PURE__ */ jsx("span", { className: "mx-1 h-5 w-px bg-gray-300", "aria-hidden": "true" });
}
export {
  RichTextEditor as R
};
