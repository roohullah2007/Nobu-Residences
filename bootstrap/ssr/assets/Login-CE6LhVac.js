import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { usePage, useForm, Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { G as GoogleLoginButton } from "./GoogleLoginButton-wrwag0eM.js";
function Login({ status, canResetPassword }) {
  const { globalWebsite, website, googleOAuthEnabled, isMainDomain } = usePage().props;
  const currentWebsite = globalWebsite || website || {};
  const websiteName = currentWebsite?.name || "Our Site";
  const brandColors = globalWebsite?.brand_colors || website?.brand_colors || {};
  const buttonPrimaryBg = brandColors.button_primary_bg || "#293056";
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    post(route("login"), {
      onFinish: () => reset("password")
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Login - ${websiteName}` }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "relative z-10 w-full max-w-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white shadow-xl rounded-2xl p-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-space-grotesk font-bold text-gray-900 mb-2", children: "Welcome Back" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-work-sans text-gray-600", children: "Sign in to access your account" })
        ] }),
        status && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-green-50 border border-green-200 rounded-lg", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-work-sans text-green-600", children: status }) }),
        errors.google && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-work-sans text-red-600", children: errors.google }) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-work-sans font-medium text-gray-700 mb-2", children: "Email Address" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "email",
                type: "email",
                name: "email",
                value: data.email,
                onChange: (e) => setData("email", e.target.value),
                className: "w-full px-4 py-3 rounded-lg font-work-sans text-gray-900 placeholder-gray-400 transition-colors border-2 border-gray-300 focus:border-gray-300",
                placeholder: "Enter your email",
                autoComplete: "username",
                autoFocus: true
              }
            ),
            errors.email && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-work-sans text-red-600", children: errors.email })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-work-sans font-medium text-gray-700 mb-2", children: "Password" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "password",
                  type: showPassword ? "text" : "password",
                  name: "password",
                  value: data.password,
                  onChange: (e) => setData("password", e.target.value),
                  className: "w-full px-4 py-3 rounded-lg font-work-sans text-gray-900 placeholder-gray-400 transition-colors pr-12 border-2 border-gray-300 focus:border-gray-300",
                  placeholder: "Enter your password",
                  autoComplete: "current-password"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowPassword(!showPassword),
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none",
                  children: showPassword ? /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" }) }) : /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }),
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })
                  ] })
                }
              )
            ] }),
            errors.password && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-work-sans text-red-600", children: errors.password })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  name: "remember",
                  checked: data.remember,
                  onChange: (e) => setData("remember", e.target.checked),
                  className: "w-4 h-4 text-[#293056] border-gray-300 rounded focus:ring-[#293056] focus:ring-2"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm font-work-sans text-gray-600", children: "Remember me" })
            ] }),
            canResetPassword && !isMainDomain && /* @__PURE__ */ jsx(
              Link,
              {
                href: route("password.request"),
                className: "text-sm font-work-sans text-[#293056] hover:text-[#1f2441] transition-colors",
                children: "Forgot password?"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing,
              className: "w-full py-3 px-6 font-work-sans font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
              children: processing ? "Signing in..." : "Sign In"
            }
          ),
          googleOAuthEnabled && !isMainDomain && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("div", { className: "w-full border-t border-gray-300" }) }),
              /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-sm", children: /* @__PURE__ */ jsx("span", { className: "px-2 bg-white text-gray-500 font-work-sans", children: "Or continue with" }) })
            ] }),
            /* @__PURE__ */ jsx(GoogleLoginButton, {})
          ] }),
          !isMainDomain && /* @__PURE__ */ jsx("div", { className: "text-center pt-4 border-t border-gray-100", children: /* @__PURE__ */ jsxs("p", { className: "text-sm font-work-sans text-gray-600", children: [
            "Don't have an account?",
            " ",
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("register"),
                className: "text-[#293056] font-semibold hover:text-[#1f2441] transition-colors",
                children: "Sign up"
              }
            )
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-xs font-work-sans text-gray-500", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ",
        websiteName,
        ". All rights reserved."
      ] }) })
    ] }) })
  ] });
}
export {
  Login as default
};
