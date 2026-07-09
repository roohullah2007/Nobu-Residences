import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { v as validateContactFields, f as focusFirstError, m as mapServerErrors } from "./contactFormValidation-CEuKRxjY.js";
const TourSchedulingComponent = ({ website, propertyData }) => {
  const { globalWebsite, auth } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};
  const isLoggedIn = !!auth?.user;
  const profileName = (auth?.user?.name || "").trim();
  const profileEmail = (auth?.user?.email || "").trim();
  const profilePhone = (auth?.user?.phone || "").trim();
  const hideName = isLoggedIn && profileName !== "";
  const hideEmail = isLoggedIn && profileEmail !== "";
  const hidePhone = isLoggedIn && profilePhone !== "";
  const buttonTertiaryBg = brandColors.button_tertiary_bg || "#000000";
  const buttonTertiaryText = brandColors.button_tertiary_text || "#FFFFFF";
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [selectedDateSlot, setSelectedDateSlot] = useState(0);
  const [selectedTime, setSelectedTime] = useState("morning");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState("tour");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const rightColumnRef = useRef(null);
  const contentRef = useRef(null);
  const placeholderRef = useRef(null);
  const [formData, setFormData] = useState({
    name: profileName,
    email: profileEmail,
    phone: profilePhone,
    message: ""
  });
  const [questionFormData, setQuestionFormData] = useState({
    name: profileName,
    email: profileEmail,
    phone: profilePhone,
    question: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [formServerError, setFormServerError] = useState("");
  const [questionErrors, setQuestionErrors] = useState({});
  const [questionServerError, setQuestionServerError] = useState("");
  const inputClass = (hasError) => `w-full py-2 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 ${hasError ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"}`;
  const FieldError = ({ message }) => message ? /* @__PURE__ */ jsx("p", { className: "text-red-600 text-sm mt-1", children: message }) : null;
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: prev.name || profileName,
      email: prev.email || profileEmail,
      phone: prev.phone || profilePhone
    }));
    setQuestionFormData((prev) => ({
      ...prev,
      name: prev.name || profileName,
      email: prev.email || profileEmail,
      phone: prev.phone || profilePhone
    }));
  }, [profileName, profileEmail, profilePhone]);
  const generateDates = () => {
    const dates2 = [];
    const today = /* @__PURE__ */ new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates2.push({
        date,
        day: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()],
        dayNum: date.getDate(),
        month: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][date.getMonth()]
      });
    }
    return dates2;
  };
  const dates = generateDates();
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) return;
      const contentElement = contentRef.current;
      const placeholderElement = placeholderRef.current;
      if (!contentElement || !placeholderElement) return;
      const rect = rightColumnRef.current?.getBoundingClientRect();
      const scrollPosition = window.pageYOffset;
      const initialTop = rect ? rect.top + scrollPosition : 0;
      const descriptionElement = document.querySelector(".description");
      let realEstateSectionTop = 0;
      if (descriptionElement) {
        realEstateSectionTop = descriptionElement.getBoundingClientRect().top + scrollPosition;
      }
      const componentHeight = contentElement.offsetHeight;
      const stopPosition = realEstateSectionTop - componentHeight - 20;
      if (scrollPosition > initialTop && scrollPosition < stopPosition) {
        if (!isFixed) {
          setIsFixed(true);
        }
      } else {
        if (isFixed) {
          setIsFixed(false);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isFixed]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setFormErrors((prev) => prev[name] ? { ...prev, [name]: void 0 } : prev);
  };
  const handleQuestionInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setQuestionErrors((prev) => prev[name] ? { ...prev, [name]: void 0 } : prev);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const clientErrors = validateContactFields(formData);
    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      setFormServerError("");
      focusFirstError(clientErrors);
      return;
    }
    setFormErrors({});
    setFormServerError("");
    setIsSubmitting(true);
    const selectedDate = dates[currentDateIndex + selectedDateSlot];
    const formattedDate = `${selectedDate.day}, ${selectedDate.month} ${selectedDate.dayNum}`;
    const timeRanges = {
      morning: "9AM to 12PM",
      afternoon: "12PM to 4PM",
      evening: "4PM to 8PM"
    };
    try {
      const response = await fetch("/api/tour-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          selected_date: formattedDate,
          selected_time: timeRanges[selectedTime],
          property_type: "property",
          property_id: propertyData?.listingKey || propertyData?.ListingKey || null,
          property_address: propertyData?.address || propertyData?.Property?.Address?.AddressText || propertyData?.StreetAddress || "Property Address Not Available"
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setFormData({ name: "", email: "", phone: "", message: "" });
        setIsModalOpen(false);
        setSuccessType("tour");
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 5e3);
      } else {
        if (result.errors) {
          const { fieldErrors, unmapped } = mapServerErrors(result.errors, {
            full_name: "name",
            name: "name",
            email: "email",
            phone: "phone",
            message: "message"
          });
          setFormErrors(fieldErrors);
          setFormServerError(unmapped);
          focusFirstError(fieldErrors);
        } else {
          setFormServerError(result.message || "Failed to submit tour request. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error submitting tour request:", error);
      setFormServerError("An error occurred while submitting your request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const clientErrors = validateContactFields(questionFormData, { requireQuestion: true });
    if (Object.keys(clientErrors).length > 0) {
      setQuestionErrors(clientErrors);
      setQuestionServerError("");
      focusFirstError(clientErrors, { name: "questionName", email: "questionEmail", phone: "questionPhone" });
      return;
    }
    setQuestionErrors({});
    setQuestionServerError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/property-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: questionFormData.name,
          email: questionFormData.email,
          phone: questionFormData.phone,
          question: questionFormData.question,
          property_listing_key: propertyData?.listingKey || propertyData?.ListingKey || null,
          property_address: propertyData?.address || propertyData?.Property?.Address?.AddressText || propertyData?.StreetAddress || "Property Address Not Available",
          property_type: "property"
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setQuestionFormData({ name: "", email: "", phone: "", question: "" });
        setIsQuestionModalOpen(false);
        setSuccessType("question");
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 5e3);
      } else {
        if (result.errors) {
          const { fieldErrors, unmapped } = mapServerErrors(result.errors, {
            name: "name",
            email: "email",
            phone: "phone",
            question: "question"
          });
          setQuestionErrors(fieldErrors);
          setQuestionServerError(unmapped);
          focusFirstError(fieldErrors, { name: "questionName", email: "questionEmail", phone: "questionPhone" });
        } else {
          setQuestionServerError(result.message || "Failed to submit question. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      setQuestionServerError("An error occurred while submitting your question. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const getSelectedDateTime = () => {
    const selectedDate = dates[currentDateIndex + selectedDateSlot];
    const timeRanges = {
      morning: "9AM to 12PM",
      afternoon: "12PM to 4PM",
      evening: "4PM to 8PM"
    };
    return `${selectedDate.day}, ${selectedDate.month} ${selectedDate.dayNum} (${timeRanges[selectedTime]})`;
  };
  const goToPrevDate = () => {
    if (currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1);
    }
  };
  const goToNextDate = () => {
    if (currentDateIndex < dates.length - 2) {
      setCurrentDateIndex(currentDateIndex + 1);
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
    setFormServerError("");
  };
  const closeQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setQuestionErrors({});
    setQuestionServerError("");
  };
  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };
  const handleQuestionModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeQuestionModal();
    }
  };
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        if (isModalOpen) {
          closeModal();
        }
        if (isQuestionModalOpen) {
          closeQuestionModal();
        }
      }
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isModalOpen, isQuestionModalOpen]);
  const currentDates = [
    dates[currentDateIndex],
    dates[currentDateIndex + 1]
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    showSuccess && /* @__PURE__ */ jsx("div", { className: "fixed top-4 right-4 z-[1000000] animate-slide-in-right", children: /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 flex items-start shadow-lg max-w-sm", children: [
      /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-green-800", children: successType === "question" ? "Question Submitted!" : "Tour Request Submitted!" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-green-700 mt-1", children: successType === "question" ? "We'll get back to you within 24 hours." : "We'll contact you shortly to confirm your tour." })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowSuccess(false),
          className: "ml-3 text-green-400 hover:text-green-600",
          children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: rightColumnRef,
        className: "flex flex-col gap-2 relative max-w-[309px]",
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              ref: placeholderRef,
              className: `w-full flex-shrink-0 ${isFixed && window.innerWidth >= 768 ? "block" : "hidden"}`,
              style: { height: contentRef.current?.offsetHeight || "auto" }
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              ref: contentRef,
              className: `flex flex-col gap-2 w-full max-w-[309px] min-w-[309px] ${isFixed && window.innerWidth >= 768 ? "fixed top-[100px] z-10" : ""}`,
              style: {
                left: isFixed && window.innerWidth >= 768 ? rightColumnRef.current?.getBoundingClientRect().left || 0 : "auto"
              },
              children: /* @__PURE__ */ jsxs("div", { className: "bg-white text-center flex flex-col p-4 items-center justify-center w-full mx-auto shadow-lg rounded-lg border border-gray-300", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-xl font-space-grotesk font-extrabold mb-1", style: { color: "#293056" }, children: "Schedule a tour" }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-sm mt-1 mb-2", children: "Tour with a buyer's agent" }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-3", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: goToPrevDate,
                      disabled: currentDateIndex === 0,
                      className: "p-3 rounded-lg border border-gray-400 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ jsx("svg", { width: "26px", height: "26px", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("polyline", { points: "15,18 9,12 15,6" }) })
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: "flex-1 flex justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-2", children: [
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        onClick: () => setSelectedDateSlot(0),
                        className: `w-[77px] h-[108px] shadow-lg p-2 rounded-lg text-center border-2 cursor-pointer ${selectedDateSlot === 0 ? "bg-blue-50 border-blue-500" : "bg-gray-50 border-transparent hover:bg-gray-100"}`,
                        children: [
                          /* @__PURE__ */ jsx("p", { className: "uppercase text-sm text-gray-500", children: currentDates[0]?.day }),
                          /* @__PURE__ */ jsx("p", { className: "text-xl font-bold my-1", children: currentDates[0]?.dayNum }),
                          /* @__PURE__ */ jsx("p", { className: "uppercase text-sm text-gray-500", children: currentDates[0]?.month })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        onClick: () => setSelectedDateSlot(1),
                        className: `w-[77px] h-[108px] shadow-lg p-2 rounded-lg text-center border-2 cursor-pointer ${selectedDateSlot === 1 ? "bg-blue-50 border-blue-500" : "bg-gray-50 border-transparent hover:bg-gray-100"}`,
                        children: [
                          /* @__PURE__ */ jsx("p", { className: "uppercase text-sm text-gray-500", children: currentDates[1]?.day }),
                          /* @__PURE__ */ jsx("p", { className: "text-xl font-bold my-1", children: currentDates[1]?.dayNum }),
                          /* @__PURE__ */ jsx("p", { className: "uppercase text-sm text-gray-500", children: currentDates[1]?.month })
                        ]
                      }
                    )
                  ] }) }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: goToNextDate,
                      disabled: currentDateIndex >= dates.length - 2,
                      className: "p-3 rounded-lg border border-gray-400 bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      children: /* @__PURE__ */ jsx("svg", { width: "26px", height: "26px", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("polyline", { points: "9,18 15,12 9,6" }) })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 my-3 gap-2", children: [
                  { key: "morning", label: "Morning", range: "9AM TO 12PM" },
                  { key: "afternoon", label: "Afternoon", range: "12PM TO 4PM" },
                  { key: "evening", label: "Evening", range: "4PM TO 8PM" }
                ].map((timeSlot) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    onClick: () => setSelectedTime(timeSlot.key),
                    className: `w-[91px] h-[55px] shadow-lg p-1 rounded-lg cursor-pointer border-2 ${selectedTime === timeSlot.key ? "bg-blue-50 border-blue-500" : "bg-gray-50 border-transparent hover:bg-gray-100"}`,
                    children: [
                      /* @__PURE__ */ jsx("p", { className: "text-center font-medium", style: { fontSize: "12px" }, children: timeSlot.label }),
                      /* @__PURE__ */ jsx("p", { className: "text-center mt-1 text-gray-500", style: { fontSize: "10px" }, children: timeSlot.range })
                    ]
                  },
                  timeSlot.key
                )) }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setIsModalOpen(true),
                    className: "w-full py-2.5 px-4 rounded-lg mb-4 font-medium border-none cursor-pointer transition-opacity hover:opacity-90",
                    style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
                    children: "Request A Tour"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "text-center text-gray-500", children: /* @__PURE__ */ jsx("p", { children: "OR" }) }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setIsQuestionModalOpen(true),
                    className: "w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium mt-3 cursor-pointer hover:bg-gray-50",
                    children: "Ask A Question"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "mt-6 pt-6 border-t border-gray-200 w-full", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center mb-4", children: [
                  (website?.agent_info?.profile_image || website?.contact_info?.agent?.image) && /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: website?.agent_info?.profile_image || website?.contact_info?.agent?.image,
                      alt: website?.agent_info?.agent_name || website?.contact_info?.agent?.name || "Agent",
                      className: "w-14 h-14 rounded-full mr-4 object-cover flex-shrink-0"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "text-left", children: [
                    (website?.agent_info?.agent_name || website?.contact_info?.agent?.name) && /* @__PURE__ */ jsx("h3", { className: "font-bold mb-1 text-left", style: { color: "#293056" }, children: website?.agent_info?.agent_name || website?.contact_info?.agent?.name }),
                    (website?.agent_info?.agent_title || website?.contact_info?.agent?.title) && /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm text-left", children: website?.agent_info?.agent_title || website?.contact_info?.agent?.title }),
                    (website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage) && /* @__PURE__ */ jsx("p", { className: "text-gray-500 text-sm text-left", children: website?.agent_info?.brokerage || website?.contact_info?.agent?.brokerage }),
                    (website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone) && (() => {
                      const phone = website?.agent_info?.agent_phone || website?.contact_info?.agent?.phone;
                      const telHref = `tel:${String(phone).replace(/[^+\d]/g, "")}`;
                      return /* @__PURE__ */ jsx(
                        "a",
                        {
                          href: telHref,
                          className: "text-gray-700 text-sm font-semibold text-left hover:text-[#293056] hover:underline",
                          children: phone
                        }
                      );
                    })()
                  ] })
                ] }) })
              ] })
            }
          )
        ]
      }
    ),
    isModalOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[999999] flex items-center justify-center", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-black bg-opacity-50",
          onClick: handleModalClick
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold", style: { color: "#293056" }, children: "Request a Tour" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: closeModal,
              className: "text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer absolute top-4 right-6 w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2",
              "aria-label": "Close",
              children: "×"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4 space-y-2", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-gray-500", children: [
            "You've selected: ",
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: getSelectedDateTime() })
          ] }),
          propertyData && /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-sm", children: [
            "Property: ",
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: propertyData?.address || propertyData?.Property?.Address?.AddressText || propertyData?.StreetAddress || "Property" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          !hideName && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-gray-700 mb-1 font-medium", children: "Full Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                value: formData.name,
                onChange: handleInputChange,
                className: inputClass(formErrors.name),
                "aria-invalid": !!formErrors.name
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: formErrors.name })
          ] }),
          !hideEmail && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-gray-700 mb-1 font-medium", children: "Email Address" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                id: "email",
                name: "email",
                value: formData.email,
                onChange: handleInputChange,
                className: inputClass(formErrors.email),
                "aria-invalid": !!formErrors.email
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: formErrors.email })
          ] }),
          !hidePhone && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "phone", className: "block text-gray-700 mb-1 font-medium", children: "Phone Number" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                id: "phone",
                name: "phone",
                value: formData.phone,
                onChange: handleInputChange,
                className: inputClass(formErrors.phone),
                "aria-invalid": !!formErrors.phone
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: formErrors.phone })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "message", className: "block text-gray-700 mb-1 font-medium", children: "Additional Notes (Optional)" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "message",
                name: "message",
                value: formData.message,
                onChange: handleInputChange,
                className: "w-full py-2 px-3 border border-gray-300 rounded-lg text-sm resize-y min-h-[80px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
                placeholder: "Any specific requirements or questions..."
              }
            )
          ] }),
          formServerError && /* @__PURE__ */ jsx("p", { className: "text-red-600 text-sm mb-3", role: "alert", children: formServerError }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSubmit,
              disabled: isSubmitting,
              className: `w-full py-3 px-4 rounded-lg font-medium border-none cursor-pointer transition-opacity ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`,
              style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
              children: isSubmitting ? /* @__PURE__ */ jsxs("span", { className: "flex items-center justify-center", children: [
                /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-5 w-5 mr-2", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none" }),
                  /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" })
                ] }),
                "Submitting..."
              ] }) : "Confirm Tour Request"
            }
          )
        ] })
      ] })
    ] }),
    isQuestionModalOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[999999] flex items-center justify-center", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-black bg-opacity-50",
          onClick: handleQuestionModalClick
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold", style: { color: "#293056" }, children: "Ask A Question" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: closeQuestionModal,
              className: "text-gray-500 bg-transparent border-none text-2xl font-bold cursor-pointer absolute top-4 right-6 w-8 h-8 rounded flex items-center justify-center p-0 leading-none transition-colors hover:text-gray-800 hover:bg-gray-100 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2",
              "aria-label": "Close",
              children: "×"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mb-4 text-gray-500", children: "Have questions about this property? Our agent will get back to you within 24 hours." }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleQuestionSubmit, noValidate: true, children: [
          !hideName && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "questionName", className: "block text-gray-700 mb-1 font-medium", children: "Full Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "questionName",
                name: "name",
                value: questionFormData.name,
                onChange: handleQuestionInputChange,
                className: inputClass(questionErrors.name),
                "aria-invalid": !!questionErrors.name
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: questionErrors.name })
          ] }),
          !hideEmail && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "questionEmail", className: "block text-gray-700 mb-1 font-medium", children: "Email Address" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                id: "questionEmail",
                name: "email",
                value: questionFormData.email,
                onChange: handleQuestionInputChange,
                className: inputClass(questionErrors.email),
                "aria-invalid": !!questionErrors.email
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: questionErrors.email })
          ] }),
          !hidePhone && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "questionPhone", className: "block text-gray-700 mb-1 font-medium", children: "Phone Number" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "tel",
                id: "questionPhone",
                name: "phone",
                value: questionFormData.phone,
                onChange: handleQuestionInputChange,
                className: inputClass(questionErrors.phone),
                "aria-invalid": !!questionErrors.phone
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: questionErrors.phone })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "question", className: "block text-gray-700 mb-1 font-medium", children: "Your Question" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "question",
                name: "question",
                value: questionFormData.question,
                onChange: handleQuestionInputChange,
                className: `${inputClass(questionErrors.question)} resize-y min-h-[100px]`,
                placeholder: "What would you like to know about this property?",
                "aria-invalid": !!questionErrors.question
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: questionErrors.question })
          ] }),
          questionServerError && /* @__PURE__ */ jsx("p", { className: "text-red-600 text-sm mb-3", role: "alert", children: questionServerError }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "w-full py-3 px-4 rounded-lg font-medium border-none cursor-pointer transition-opacity hover:opacity-90",
              style: { backgroundColor: buttonTertiaryBg, color: buttonTertiaryText },
              children: "Send Question"
            }
          )
        ] })
      ] })
    ] })
  ] });
};
export {
  TourSchedulingComponent as default
};
