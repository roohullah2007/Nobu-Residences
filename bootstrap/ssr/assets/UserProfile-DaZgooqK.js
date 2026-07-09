import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { useForm, Head, router } from "@inertiajs/react";
import { I as InputError } from "./InputError-CBvD_6aD.js";
import "./TextInput-D0qTZeQv.js";
import { Transition } from "@headlessui/react";
import MainLayout from "./MainLayout-B3DCp-WI.js";
import "./Footer-BjazYOa4.js";
import "./ContactAgentModal-Bc8CTpfm.js";
import "./Navbar-Cf7RY0yN.js";
import "./PluginStyleImageLoader-Rq93vDmq.js";
import "./LoginModal-C-0W-anf.js";
import "./GoogleLoginButton-wrwag0eM.js";
import "./PropertyDetailIcons-3huqvWqW.js";
function UserProfile({ auth, mustVerifyEmail, status, website, siteName, siteUrl, year }) {
  const user = auth.user;
  const [photoPreview, setPhotoPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const photoInput = useRef();
  const EyeIcon = ({ open }) => open ? /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" })
  ] }) : /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
    /* @__PURE__ */ jsx("path", { d: "M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.77 19.77 0 0 1 5.06-5.94" }),
    /* @__PURE__ */ jsx("path", { d: "M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-3.17 4.19" }),
    /* @__PURE__ */ jsx("path", { d: "M14.12 14.12A3 3 0 1 1 9.88 9.88" }),
    /* @__PURE__ */ jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })
  ] });
  const profileForm = useForm({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    bio: user.bio || "",
    photo: null
  });
  const passwordForm = useForm({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      profileForm.setData("photo", file);
      const reader = new FileReader();
      reader.onload = (e2) => {
        setPhotoPreview(e2.target.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const removePhoto = () => {
    profileForm.setData("photo", null);
    setPhotoPreview(null);
    if (photoInput.current) {
      photoInput.current.value = "";
    }
  };
  const submitProfile = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", profileForm.data.name);
    formData.append("email", profileForm.data.email);
    formData.append("phone", profileForm.data.phone || "");
    formData.append("bio", profileForm.data.bio || "");
    if (profileForm.data.photo) {
      formData.append("photo", profileForm.data.photo);
    }
    router.post(route("profile.update"), formData, {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => {
        setPhotoPreview(null);
        if (photoInput.current) {
          photoInput.current.value = "";
        }
        profileForm.setData("photo", null);
      },
      onError: (errors) => {
        console.error("Profile update errors:", errors);
        profileForm.setErrors(errors);
      }
    });
  };
  const submitPassword = (e) => {
    e.preventDefault();
    passwordForm.put(route("password.update"), {
      preserveScroll: true,
      onSuccess: () => passwordForm.reset(),
      onError: (errors) => {
        if (errors.current_password) {
          passwordForm.reset("current_password");
        }
        if (errors.password) {
          passwordForm.reset("password", "password_confirmation");
        }
      }
    });
  };
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const deleteAccount = () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm deletion.");
      return;
    }
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      router.delete(route("profile.destroy"), {
        data: { password: deletePassword },
        preserveScroll: true,
        onSuccess: () => window.location.href = "/",
        onError: (errors) => {
          setDeleteError(errors.password || "Failed to delete account.");
          setDeletePassword("");
        }
      });
    }
  };
  const brandColors = website?.brand_colors || {
    primary: "#912018"
  };
  return /* @__PURE__ */ jsxs(MainLayout, { auth, website, siteName, siteUrl, year, blueHeader: true, children: [
    /* @__PURE__ */ jsx(Head, { title: "Profile Settings" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-gray-200", children: /* @__PURE__ */ jsxs("nav", { className: "flex", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("profile"),
              className: `px-8 py-4 text-sm font-medium font-work-sans border-b-3 transition-all ${activeTab === "profile" ? "border-b-3 text-white" : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"}`,
              style: {
                borderBottomColor: activeTab === "profile" ? brandColors.primary : "transparent",
                borderBottomWidth: activeTab === "profile" ? "3px" : "0",
                backgroundColor: activeTab === "profile" ? brandColors.primary : "transparent"
              },
              children: [
                /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 inline-block mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }),
                "Profile Information"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("password"),
              className: `px-8 py-4 text-sm font-medium font-work-sans border-b-3 transition-all ${activeTab === "password" ? "border-b-3 text-white" : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"}`,
              style: {
                borderBottomColor: activeTab === "password" ? brandColors.primary : "transparent",
                borderBottomWidth: activeTab === "password" ? "3px" : "0",
                backgroundColor: activeTab === "password" ? brandColors.primary : "transparent"
              },
              children: [
                /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 inline-block mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }),
                "Security"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("danger"),
              className: `px-8 py-4 text-sm font-medium font-work-sans border-b-3 transition-all ${activeTab === "danger" ? "border-b-3 text-white bg-red-600" : "border-transparent text-gray-600 hover:text-red-600 hover:bg-red-50"}`,
              style: {
                borderBottomColor: activeTab === "danger" ? "#dc2626" : "transparent",
                borderBottomWidth: activeTab === "danger" ? "3px" : "0"
              },
              children: [
                /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 inline-block mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
                "Danger Zone"
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-8", children: [
          activeTab === "profile" && /* @__PURE__ */ jsxs("form", { onSubmit: submitProfile, className: "space-y-8", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 font-space-grotesk mb-2", children: "Profile Information" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 font-work-sans", children: "Update your account's profile information and email address." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 rounded-xl p-6", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 font-work-sans mb-4", children: "Profile Photo" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-32 h-32 rounded-full bg-white p-1 shadow-xl", children: photoPreview || user.avatar ? /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: photoPreview || user.avatar,
                      alt: user.name,
                      className: "w-full h-full rounded-full object-cover"
                    }
                  ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full rounded-full bg-gradient-to-br from-[#912018] to-[#d42f24] flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold text-white font-space-grotesk", children: user.name?.charAt(0).toUpperCase() || "U" }) }) }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => photoInput.current?.click(),
                      className: "absolute bottom-0 right-0 bg-white rounded-full p-2.5 shadow-lg hover:shadow-xl transition-shadow",
                      style: { backgroundColor: brandColors.primary },
                      children: /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                        /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" }),
                        /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 13a3 3 0 11-6 0 3 3 0 016 0z" })
                      ] })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      ref: photoInput,
                      type: "file",
                      className: "hidden",
                      accept: "image/*",
                      onChange: handlePhotoChange
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 font-work-sans mb-2", children: photoPreview ? "New photo selected" : "Click the camera icon to upload a new photo" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 font-work-sans", children: "JPG, PNG or GIF. Max size 2MB." }),
                  photoPreview && /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: removePhoto,
                      className: "mt-3 text-red-600 hover:text-red-700 font-work-sans font-medium text-sm",
                      children: "Remove new photo"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 font-work-sans mb-2", children: "Name" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "name",
                    type: "text",
                    className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans",
                    value: profileForm.data.name,
                    onChange: (e) => profileForm.setData("name", e.target.value),
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: profileForm.errors.name })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 font-work-sans mb-2", children: "Email" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "email",
                    type: "email",
                    className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans",
                    value: profileForm.data.email,
                    onChange: (e) => profileForm.setData("email", e.target.value),
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: profileForm.errors.email })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "block text-sm font-medium text-gray-700 font-work-sans mb-2", children: "Phone Number" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "phone",
                    type: "tel",
                    className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans",
                    value: profileForm.data.phone,
                    onChange: (e) => profileForm.setData("phone", e.target.value),
                    placeholder: "+1 (555) 000-0000"
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: profileForm.errors.phone })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "bio", className: "block text-sm font-medium text-gray-700 font-work-sans mb-2", children: "Bio" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    id: "bio",
                    className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans",
                    rows: "4",
                    value: profileForm.data.bio,
                    onChange: (e) => profileForm.setData("bio", e.target.value),
                    placeholder: "Tell us about yourself..."
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: profileForm.errors.bio })
              ] })
            ] }),
            mustVerifyEmail && user.email_verified_at === null && /* @__PURE__ */ jsx("div", { className: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-yellow-800 font-work-sans", children: [
              "Your email address is unverified.",
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => router.post(route("verification.send")),
                  className: "ml-2 text-yellow-600 underline hover:text-yellow-700 font-medium",
                  children: "Click here to re-send the verification email."
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: profileForm.processing,
                  className: "px-6 py-3 text-white font-work-sans font-medium rounded-lg transition-all hover:shadow-lg disabled:opacity-50",
                  style: { backgroundColor: brandColors.primary },
                  children: "Save Changes"
                }
              ),
              /* @__PURE__ */ jsx(
                Transition,
                {
                  show: profileForm.recentlySuccessful,
                  enter: "transition ease-in-out",
                  enterFrom: "opacity-0",
                  leave: "transition ease-in-out",
                  leaveTo: "opacity-0",
                  children: /* @__PURE__ */ jsx("p", { className: "text-sm text-green-600 font-work-sans", children: "Saved successfully." })
                }
              )
            ] })
          ] }),
          activeTab === "password" && /* @__PURE__ */ jsxs("form", { onSubmit: submitPassword, className: "space-y-8", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 font-space-grotesk mb-2", children: "Update Password" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 font-work-sans", children: "Ensure your account is using a long, random password to stay secure." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-xl", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "current_password", className: "block text-sm font-medium text-gray-700 font-work-sans mb-2", children: "Current Password" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      id: "current_password",
                      type: showCurrentPassword ? "text" : "password",
                      className: "w-full px-4 py-3 pr-11 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans",
                      value: passwordForm.data.current_password,
                      onChange: (e) => passwordForm.setData("current_password", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowCurrentPassword((prev) => !prev),
                      className: "absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700",
                      "aria-label": showCurrentPassword ? "Hide password" : "Show password",
                      tabIndex: -1,
                      children: /* @__PURE__ */ jsx(EyeIcon, { open: showCurrentPassword })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: passwordForm.errors.current_password })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 font-work-sans mb-2", children: "New Password" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      id: "password",
                      type: showNewPassword ? "text" : "password",
                      className: "w-full px-4 py-3 pr-11 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans",
                      value: passwordForm.data.password,
                      onChange: (e) => passwordForm.setData("password", e.target.value)
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setShowNewPassword((prev) => !prev),
                      className: "absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700",
                      "aria-label": showNewPassword ? "Hide password" : "Show password",
                      tabIndex: -1,
                      children: /* @__PURE__ */ jsx(EyeIcon, { open: showNewPassword })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: passwordForm.errors.password })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "password_confirmation", className: "block text-sm font-medium text-gray-700 font-work-sans mb-2", children: "Confirm Password" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      id: "password_confirmation",
                      type: showConfirmPassword ? "text" : "password",
                      className: "w-full px-4 py-3 pr-11 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#912018] focus:border-transparent transition-all font-work-sans",
                      value: passwordForm.data.password_confirmation,
                      onChange: (e) => passwordForm.setData("password_confirmation", e.target.value)
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
                /* @__PURE__ */ jsx(InputError, { className: "mt-2", message: passwordForm.errors.password_confirmation })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: passwordForm.processing,
                  className: "px-6 py-3 text-white font-work-sans font-medium rounded-lg transition-all hover:shadow-lg disabled:opacity-50",
                  style: { backgroundColor: brandColors.primary },
                  children: "Update Password"
                }
              ),
              /* @__PURE__ */ jsx(
                Transition,
                {
                  show: passwordForm.recentlySuccessful,
                  enter: "transition ease-in-out",
                  enterFrom: "opacity-0",
                  leave: "transition ease-in-out",
                  leaveTo: "opacity-0",
                  children: /* @__PURE__ */ jsx("p", { className: "text-sm text-green-600 font-work-sans", children: "Password updated successfully." })
                }
              )
            ] })
          ] }),
          activeTab === "danger" && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 font-space-grotesk mb-2", children: "Delete Account" }),
              /* @__PURE__ */ jsx("p", { className: "text-gray-600 font-work-sans", children: "Once your account is deleted, all of its resources and data will be permanently deleted." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-2xl space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-3", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-red-600 mt-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-red-800 font-space-grotesk mb-2", children: "This action is irreversible" }),
                  /* @__PURE__ */ jsx("p", { className: "text-red-700 font-work-sans", children: "All your data including saved properties, searches, and preferences will be permanently removed." })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "delete_password", className: "block text-sm font-medium text-red-700 font-work-sans mb-2", children: "Enter your password to confirm" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      id: "delete_password",
                      type: "password",
                      className: "w-full max-w-sm px-4 py-3 rounded-lg border-2 border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-work-sans",
                      value: deletePassword,
                      onChange: (e) => {
                        setDeletePassword(e.target.value);
                        setDeleteError("");
                      },
                      placeholder: "Your current password"
                    }
                  ),
                  deleteError && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-600 font-work-sans", children: deleteError })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: deleteAccount,
                    className: "px-6 py-3 bg-red-600 text-white font-work-sans font-medium rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                    disabled: !deletePassword,
                    children: "Delete My Account Permanently"
                  }
                )
              ] })
            ] })
          ] })
        ] })
      ] }),
      status && /* @__PURE__ */ jsx("div", { className: "mt-6 p-4 bg-green-50 border border-green-200 rounded-lg", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-green-800 font-work-sans", children: status }) })
    ] }) })
  ] });
}
export {
  UserProfile as default
};
