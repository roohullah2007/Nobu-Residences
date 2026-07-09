import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { G as GoogleLoginButton } from "./GoogleLoginButton-wrwag0eM.js";
const LoginModal = ({ isOpen, onClose, website = {}, initialTab = "register" }) => {
  const { googleOAuthEnabled, globalWebsite, siteName } = usePage().props;
  const siteDisplayName = website?.name || globalWebsite?.name || siteName || "Nobu Residences";
  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    confirmPassword: ""
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const EyeIcon = ({ open }) => open ? /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" })
  ] }) : /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsx("path", { d: "M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.77 19.77 0 0 1 5.06-5.94" }),
    /* @__PURE__ */ jsx("path", { d: "M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-3.17 4.19" }),
    /* @__PURE__ */ jsx("path", { d: "M14.12 14.12A3 3 0 1 1 9.88 9.88" }),
    /* @__PURE__ */ jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })
  ] });
  const brandColors = website?.brand_colors || {
    primary: "#912018",
    button_primary_bg: "#912018",
    button_primary_text: "#FFFFFF"
  };
  const buttonPrimaryBg = brandColors.button_primary_bg || brandColors.primary;
  const buttonPrimaryText = brandColors.button_primary_text || "#FFFFFF";
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: "",
        password: "",
        name: "",
        phone: "",
        confirmPassword: ""
      });
      setForgotPasswordEmail("");
      setErrors({});
      setForgotPasswordSuccess(false);
      setShowForgotPassword(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, activeTab]);
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "At least 8 characters";
    }
    if (activeTab === "register") {
      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = "At least 2 characters";
      }
      if (!formData.phone || formData.phone.trim().length < 10) {
        newErrors.phone = "At least 10 digits";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setErrors({});
    const redirectTo = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}${window.location.hash}` : "";
    if (activeTab === "login") {
      router.post("/login", {
        email: formData.email,
        password: formData.password,
        redirect_to: redirectTo
      }, {
        onSuccess: (page) => {
          onClose();
        },
        onError: (errors2) => {
          const formattedErrors = {};
          Object.keys(errors2).forEach((key) => {
            if (Array.isArray(errors2[key])) {
              formattedErrors[key] = errors2[key][0];
            } else {
              formattedErrors[key] = errors2[key];
            }
          });
          setErrors(formattedErrors);
          setIsLoading(false);
        },
        onFinish: () => {
          setIsLoading(false);
        }
      });
    } else {
      router.post("/register", {
        name: formData.name.trim(),
        email: formData.email,
        phone: formData.phone.trim(),
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        redirect_to: redirectTo
      }, {
        onSuccess: (page) => {
          onClose();
        },
        onError: (errors2) => {
          const formattedErrors = {};
          Object.keys(errors2).forEach((key) => {
            if (Array.isArray(errors2[key])) {
              formattedErrors[key] = errors2[key][0];
            } else {
              formattedErrors[key] = errors2[key];
            }
          });
          setErrors(formattedErrors);
          setIsLoading(false);
        },
        onFinish: () => {
          setIsLoading(false);
        }
      });
    }
  };
  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setErrors({ email: "Email is invalid" });
      return;
    }
    setIsLoading(true);
    setErrors({});
    router.post("/forgot-password", {
      email: forgotPasswordEmail
    }, {
      onSuccess: () => {
        setForgotPasswordSuccess(true);
        setIsLoading(false);
      },
      onError: (errors2) => {
        setErrors(errors2);
        setIsLoading(false);
      },
      onFinish: () => {
        setIsLoading(false);
      }
    });
  };
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4",
      onClick: handleModalClick,
      children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl max-w-md w-full relative shadow-2xl max-h-[92vh] flex flex-col", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: onClose,
            className: "absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-white hover:bg-gray-100",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
              /* @__PURE__ */ jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
              /* @__PURE__ */ jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 overflow-y-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center mb-4 sm:mb-6 px-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl sm:text-2xl font-space-grotesk font-bold mb-1 sm:mb-2", style: { color: brandColors.primary }, children: showForgotPassword ? "Reset Password" : `Welcome to ${siteDisplayName}` }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600 text-xs sm:text-sm", children: showForgotPassword ? "Enter your email address and we'll send you a link to reset your password" : activeTab === "login" ? "Sign in to access your account and saved properties" : "Create an account to save properties and get personalized recommendations" })
          ] }),
          !showForgotPassword && /* @__PURE__ */ jsxs("div", { className: "flex mb-4 sm:mb-6 bg-gray-100 rounded-lg p-1", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setActiveTab("login"),
                className: `flex-1 py-2 px-2 sm:px-4 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === "login" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`,
                children: "Sign In"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setActiveTab("register"),
                className: `flex-1 py-2 px-2 sm:px-4 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === "register" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`,
                children: "Create Account"
              }
            )
          ] }),
          showForgotPassword ? (
            /* Forgot Password Form */
            /* @__PURE__ */ jsx("form", { onSubmit: handleForgotPasswordSubmit, className: "space-y-4", children: forgotPasswordSuccess ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
              /* @__PURE__ */ jsx("div", { className: "w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "#10B981", strokeWidth: "2", children: [
                /* @__PURE__ */ jsx("path", { d: "m9 12 2 2 4-4" }),
                /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "9" })
              ] }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Email Sent!" }),
              /* @__PURE__ */ jsxs("p", { className: "text-gray-600 mb-6", children: [
                "We've sent a password reset link to ",
                /* @__PURE__ */ jsx("strong", { children: forgotPasswordEmail })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setShowForgotPassword(false);
                    setForgotPasswordSuccess(false);
                    setForgotPasswordEmail("");
                  },
                  className: "font-medium hover:opacity-80",
                  style: { color: brandColors.primary },
                  children: "← Back to Sign In"
                }
              )
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "forgotEmail", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "email",
                    id: "forgotEmail",
                    value: forgotPasswordEmail,
                    onChange: (e) => {
                      setForgotPasswordEmail(e.target.value);
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: null }));
                      }
                    },
                    className: `w-full px-3 py-2 rounded-lg text-sm border-2 focus:border-gray-300 ${errors.email ? "border-red-500" : "border-gray-300"}`,
                    placeholder: "Enter your email"
                  }
                ),
                errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.email })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: isLoading,
                  className: "w-full py-2.5 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
                  children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" }),
                    "Sending Reset Link..."
                  ] }) : "Send Reset Link"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowForgotPassword(false),
                  className: "text-sm hover:opacity-80 transition-colors",
                  style: { color: brandColors.primary },
                  children: "← Back to Sign In"
                }
              ) })
            ] }) })
          ) : (
            /* Login/Register Form */
            /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-3 sm:space-y-4", children: [
              activeTab === "register" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 sm:gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 mb-1", children: "Full Name" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        id: "name",
                        name: "name",
                        value: formData.name,
                        onChange: handleInputChange,
                        className: `w-full px-3 py-2 rounded-lg text-sm border-2 focus:border-gray-300 ${errors.name ? "border-red-500" : "border-gray-300"}`,
                        placeholder: "Full name"
                      }
                    ),
                    errors.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.name })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone Number" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "tel",
                        id: "phone",
                        name: "phone",
                        value: formData.phone,
                        onChange: handleInputChange,
                        className: `w-full px-3 py-2 rounded-lg text-sm border-2 focus:border-gray-300 ${errors.phone ? "border-red-500" : "border-gray-300"}`,
                        placeholder: "Phone number"
                      }
                    ),
                    errors.phone && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.phone })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "email",
                      id: "email",
                      name: "email",
                      value: formData.email,
                      onChange: handleInputChange,
                      className: `w-full px-3 py-2 rounded-lg text-sm border-2 focus:border-gray-300 ${errors.email ? "border-red-500" : "border-gray-300"}`,
                      placeholder: "Enter your email"
                    }
                  ),
                  errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.email })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 sm:gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }),
                    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: showPassword ? "text" : "password",
                          id: "password",
                          name: "password",
                          value: formData.password,
                          onChange: handleInputChange,
                          className: `w-full px-3 py-2 pr-9 rounded-lg text-sm border-2 focus:border-gray-300 ${errors.password ? "border-red-500" : "border-gray-300"}`,
                          placeholder: "Password"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setShowPassword((prev) => !prev),
                          className: "absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700",
                          "aria-label": showPassword ? "Hide password" : "Show password",
                          tabIndex: -1,
                          children: /* @__PURE__ */ jsx(EyeIcon, { open: showPassword })
                        }
                      )
                    ] }),
                    errors.password && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.password })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700 mb-1", children: "Confirm Password" }),
                    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          type: showConfirmPassword ? "text" : "password",
                          id: "confirmPassword",
                          name: "confirmPassword",
                          value: formData.confirmPassword,
                          onChange: handleInputChange,
                          className: `w-full px-3 py-2 pr-9 rounded-lg text-sm border-2 focus:border-gray-300 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`,
                          placeholder: "Confirm"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => setShowConfirmPassword((prev) => !prev),
                          className: "absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700",
                          "aria-label": showConfirmPassword ? "Hide password" : "Show password",
                          tabIndex: -1,
                          children: /* @__PURE__ */ jsx(EyeIcon, { open: showConfirmPassword })
                        }
                      )
                    ] }),
                    errors.confirmPassword && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.confirmPassword })
                  ] })
                ] })
              ] }),
              activeTab === "login" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "email",
                      id: "email",
                      name: "email",
                      value: formData.email,
                      onChange: handleInputChange,
                      className: `w-full px-3 py-2 rounded-lg text-sm border-2 focus:border-gray-300 ${errors.email ? "border-red-500" : "border-gray-300"}`,
                      placeholder: "Enter your email"
                    }
                  ),
                  errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.email })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }),
                  /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: showPassword ? "text" : "password",
                        id: "password",
                        name: "password",
                        value: formData.password,
                        onChange: handleInputChange,
                        className: `w-full px-3 py-2 pr-10 rounded-lg text-sm border-2 focus:border-gray-300 ${errors.password ? "border-red-500" : "border-gray-300"}`,
                        placeholder: "Enter your password"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setShowPassword((prev) => !prev),
                        className: "absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700",
                        "aria-label": showPassword ? "Hide password" : "Show password",
                        tabIndex: -1,
                        children: /* @__PURE__ */ jsx(EyeIcon, { open: showPassword })
                      }
                    )
                  ] }),
                  errors.password && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-red-600", children: errors.password })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: isLoading,
                  className: "w-full py-2.5 px-4 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  style: { backgroundColor: buttonPrimaryBg, color: buttonPrimaryText },
                  children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center", children: [
                    /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" }),
                    activeTab === "login" ? "Signing In..." : "Creating Account..."
                  ] }) : activeTab === "login" ? "Sign In" : "Create Account"
                }
              )
            ] })
          ),
          !showForgotPassword && googleOAuthEnabled && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { className: "relative my-4", children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("div", { className: "w-full border-t border-gray-300" }) }),
              /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-sm", children: /* @__PURE__ */ jsx("span", { className: "px-2 bg-white text-gray-500", children: "Or continue with" }) })
            ] }),
            /* @__PURE__ */ jsx(
              GoogleLoginButton,
              {
                text: activeTab === "login" ? "Sign in with Google" : "Sign up with Google",
                className: "w-full"
              }
            )
          ] }),
          activeTab === "login" && !showForgotPassword && /* @__PURE__ */ jsx("div", { className: "text-center mt-4", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "text-sm hover:opacity-80 transition-colors",
              style: { color: brandColors.primary },
              onClick: () => setShowForgotPassword(true),
              children: "Forgot your password?"
            }
          ) })
        ] })
      ] })
    }
  );
};
export {
  LoginModal as default
};
