import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-DVgDNs4A.js";
import { T as TextInput } from "./TextInput-D0qTZeQv.js";
import { useState } from "react";
const lightFormClass = "[&_input]:!bg-white [&_input]:!text-gray-900 [&_textarea]:!bg-white [&_textarea]:!text-gray-900 [&_select]:!bg-white [&_select]:!text-gray-900";
function UsersIndex({ users, filters = {} }) {
  const [q, setQ] = useState(filters.q || "");
  const submitSearch = (e) => {
    e.preventDefault();
    router.get(route("admin.users.index"), { q }, { preserveState: true, replace: true });
  };
  const handleDelete = (user) => {
    if (!confirm(`Delete user "${user.name}"? This will soft-delete the account.`)) return;
    router.delete(route("admin.users.destroy", user.id), { preserveScroll: true });
  };
  const roleBadge = (role) => {
    const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
    if (role === "admin") return /* @__PURE__ */ jsx("span", { className: `${base} bg-purple-100 text-purple-800`, children: "Admin" });
    return /* @__PURE__ */ jsx("span", { className: `${base} bg-gray-100 text-gray-700`, children: "User" });
  };
  const statusBadge = (active) => {
    const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
    return active ? /* @__PURE__ */ jsx("span", { className: `${base} bg-green-100 text-green-800`, children: "Active" }) : /* @__PURE__ */ jsx("span", { className: `${base} bg-red-100 text-red-800`, children: "Inactive" });
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Users", children: [
    /* @__PURE__ */ jsx(Head, { title: "Users" }),
    /* @__PURE__ */ jsxs("div", { className: `space-y-6 ${lightFormClass}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Users" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Search, edit and delete registered users." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submitSearch, className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            TextInput,
            {
              type: "search",
              value: q,
              onChange: (e) => setQ(e.target.value),
              placeholder: "Search by name, email or phone…",
              className: "w-72"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700",
              children: "Search"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Email" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Phone" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Role" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Joined" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsxs("tbody", { className: "bg-white divide-y divide-gray-200", children: [
            users.data.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "px-6 py-12 text-center text-sm text-gray-500", children: "No users found." }) }),
            users.data.map((u) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: u.name }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700", children: u.email }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-700", children: u.phone || "—" }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm", children: roleBadge(u.role) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm", children: statusBadge(u.is_active) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm text-gray-500", children: u.created_at || "—" }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 text-sm text-right space-x-3", children: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: route("admin.users.edit", u.id),
                    className: "text-indigo-600 hover:text-indigo-800 font-medium",
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleDelete(u),
                    className: "text-red-600 hover:text-red-800 font-medium",
                    children: "Delete"
                  }
                )
              ] })
            ] }, u.id))
          ] })
        ] }) }),
        users.links && users.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "px-6 py-3 border-t border-gray-200 flex flex-wrap gap-2 items-center justify-end", children: users.links.map((link, i) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            disabled: !link.url,
            onClick: () => link.url && router.get(link.url, {}, { preserveState: true }),
            className: `px-3 py-1 text-sm rounded ${link.active ? "bg-indigo-600 text-white" : link.url ? "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" : "bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"}`,
            dangerouslySetInnerHTML: { __html: link.label }
          },
          i
        )) })
      ] })
    ] })
  ] });
}
export {
  UsersIndex as default
};
