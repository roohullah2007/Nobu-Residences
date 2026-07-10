import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
import { I as InputError } from "./InputError-CBvD_6aD.js";
import { I as InputLabel } from "./InputLabel-DE424DvN.js";
import { P as PrimaryButton } from "./PrimaryButton-DDF1xnxF.js";
import { T as TextInput } from "./TextInput-D0qTZeQv.js";
import { P as PhoneInput } from "./PhoneInput-BOSF9o14.js";
import "react";
const lightFormClass = "[&_input]:!bg-white [&_input]:!text-gray-900 [&_textarea]:!bg-white [&_textarea]:!text-gray-900 [&_select]:!bg-white [&_select]:!text-gray-900";
function UsersEdit({ user, roles = [] }) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "user",
    is_active: !!user.is_active,
    password: "",
    password_confirmation: ""
  });
  const submit = (e) => {
    e.preventDefault();
    put(route("admin.users.update", user.id), { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AdminLayout, { title: `Edit User: ${user.name}`, children: [
    /* @__PURE__ */ jsx(Head, { title: `Edit User: ${user.name}` }),
    /* @__PURE__ */ jsx("div", { className: `max-w-3xl mx-auto ${lightFormClass}`, children: /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-sm sm:rounded-lg p-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Edit User" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [
            "Member since ",
            user.created_at || "—"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Link, { href: route("admin.users.index"), className: "text-sm text-indigo-600 hover:text-indigo-800", children: "← Back to users" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Name" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "name",
                type: "text",
                className: "mt-1 block w-full",
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                placeholder: "Full name"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: "Email" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "email",
                type: "email",
                className: "mt-1 block w-full",
                value: data.email,
                onChange: (e) => setData("email", e.target.value),
                placeholder: "user@example.com"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "phone", value: "Phone" }),
            /* @__PURE__ */ jsx(
              PhoneInput,
              {
                id: "phone",
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
                value: data.phone,
                onChange: (e) => setData("phone", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.phone, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "role", value: "Role" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                id: "role",
                className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                value: data.role,
                onChange: (e) => setData("role", e.target.value),
                children: roles.map((r) => /* @__PURE__ */ jsx("option", { value: r.value, children: r.label }, r.value))
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.role, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.is_active,
                onChange: (e) => setData("is_active", e.target.checked),
                className: "rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Account is active" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t pt-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-gray-900 mb-1", children: "Reset password (optional)" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 mb-4", children: "Leave blank to keep the current password." }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password", value: "New password" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "password",
                  type: "password",
                  className: "mt-1 block w-full",
                  value: data.password,
                  onChange: (e) => setData("password", e.target.value),
                  autoComplete: "new-password"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password_confirmation", value: "Confirm new password" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "password_confirmation",
                  type: "password",
                  className: "mt-1 block w-full",
                  value: data.password_confirmation,
                  onChange: (e) => setData("password_confirmation", e.target.value),
                  autoComplete: "new-password"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("admin.users.index"),
              className: "inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-300",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, children: processing ? "Saving…" : "Save changes" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  UsersEdit as default
};
