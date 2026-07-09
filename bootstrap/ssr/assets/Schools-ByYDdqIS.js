import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useForm, Head, router, Link } from "@inertiajs/react";
import { A as AdminLayout } from "./AdminLayout-CfYoZrH6.js";
import { P as PrimaryButton } from "./PrimaryButton-DDF1xnxF.js";
import { S as SecondaryButton } from "./SecondaryButton-D0HLp6wy.js";
function Schools({ auth, schools: initialSchools = [], pagination = null }) {
  const [schools, setSchools] = useState(initialSchools);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    school_type: "",
    grade_level: "",
    city: ""
  });
  const { delete: deleteSchool } = useForm();
  const fetchSchools = async (newFilters = filters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await fetch(`/api/schools?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setSchools(result.data);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchSchools(newFilters);
  };
  const handleDeleteSchool = (schoolId, schoolName) => {
    if (confirm(`Are you sure you want to delete "${schoolName}"? This action cannot be undone.`)) {
      deleteSchool(`/admin/schools/${schoolId}`, {
        onSuccess: () => {
          setSchools(schools.filter((s) => s.id !== schoolId));
        }
      });
    }
  };
  const handleBatchGeocode = async () => {
    if (confirm("This will geocode schools that don't have coordinates. Continue?")) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/schools/batch-geocode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || ""
          }
        });
        const result = await response.json();
        if (result.success) {
          alert(result.message);
          fetchSchools();
        } else {
          alert("Error: " + result.message);
        }
      } catch (error) {
        console.error("Error in batch geocoding:", error);
        alert("Error during batch geocoding");
      } finally {
        setIsLoading(false);
      }
    }
  };
  return /* @__PURE__ */ jsxs(
    AdminLayout,
    {
      user: auth.user,
      header: /* @__PURE__ */ jsx("h2", { className: "font-semibold text-xl text-gray-800 leading-tight", children: "School Management" }),
      children: [
        /* @__PURE__ */ jsx(Head, { title: "Schools - Admin" }),
        /* @__PURE__ */ jsx("div", { className: "py-12", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto sm:px-6 lg:px-8", children: /* @__PURE__ */ jsx("div", { className: "bg-white overflow-hidden shadow-sm sm:rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "p-6 text-gray-900", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Schools" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsx(
                SecondaryButton,
                {
                  onClick: handleBatchGeocode,
                  disabled: isLoading,
                  children: "Batch Geocode"
                }
              ),
              /* @__PURE__ */ jsx(
                PrimaryButton,
                {
                  onClick: () => router.visit("/admin/schools/create"),
                  children: "Add School"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: filters.search,
                  onChange: (e) => handleFilterChange("search", e.target.value),
                  placeholder: "Search schools...",
                  className: "w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "School Type" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: filters.school_type,
                  onChange: (e) => handleFilterChange("school_type", e.target.value),
                  className: "w-full border border-gray-300 rounded-md px-3 py-2 text-sm",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "All Types" }),
                    /* @__PURE__ */ jsx("option", { value: "public", children: "Public" }),
                    /* @__PURE__ */ jsx("option", { value: "catholic", children: "Catholic" }),
                    /* @__PURE__ */ jsx("option", { value: "private", children: "Private" }),
                    /* @__PURE__ */ jsx("option", { value: "charter", children: "Charter" }),
                    /* @__PURE__ */ jsx("option", { value: "french", children: "French" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Grade Level" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: filters.grade_level,
                  onChange: (e) => handleFilterChange("grade_level", e.target.value),
                  className: "w-full border border-gray-300 rounded-md px-3 py-2 text-sm",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "All Grades" }),
                    /* @__PURE__ */ jsx("option", { value: "elementary", children: "Elementary" }),
                    /* @__PURE__ */ jsx("option", { value: "secondary", children: "Secondary" }),
                    /* @__PURE__ */ jsx("option", { value: "k-12", children: "K-12" }),
                    /* @__PURE__ */ jsx("option", { value: "preschool", children: "Preschool" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "City" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: filters.city,
                  onChange: (e) => handleFilterChange("city", e.target.value),
                  placeholder: "City...",
                  className: "w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                }
              )
            ] })
          ] }),
          isLoading && /* @__PURE__ */ jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" }) }),
          !isLoading && /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "School" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Type & Level" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Location" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Contact" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Coordinates" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: schools.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: "6", className: "px-6 py-8 text-center text-gray-500", children: [
              "No schools found. ",
              /* @__PURE__ */ jsx(Link, { href: "/admin/schools/create", className: "text-indigo-600 hover:underline", children: "Add the first school" })
            ] }) }) : schools.map((school) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50", children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900", children: /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: `/admin/schools/${school.id}`,
                    className: "hover:text-indigo-600",
                    children: school.name
                  }
                ) }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: school.slug }),
                school.is_featured && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1", children: "Featured" })
              ] }) }) }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900", children: school.school_type_label }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: school.grade_level_label })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900", children: school.address }),
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500", children: [
                  school.city,
                  ", ",
                  school.province
                ] })
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [
                school.phone && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900", children: school.phone }),
                school.email && /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-500", children: school.email })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: school.latitude && school.longitude ? /* @__PURE__ */ jsxs("div", { className: "text-xs text-green-600", children: [
                "✓ ",
                Number(school.latitude).toFixed(4),
                ", ",
                Number(school.longitude).toFixed(4)
              ] }) : /* @__PURE__ */ jsx("div", { className: "text-xs text-red-600", children: "No coordinates" }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: `/admin/schools/${school.id}/edit`,
                    className: "text-indigo-600 hover:text-indigo-900",
                    children: "Edit"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDeleteSchool(school.id, school.name),
                    className: "text-red-600 hover:text-red-900",
                    children: "Delete"
                  }
                )
              ] }) })
            ] }, school.id)) })
          ] }) }),
          pagination && /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-700", children: [
              "Showing ",
              pagination.from,
              " to ",
              pagination.to,
              " of ",
              pagination.total,
              " schools"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
              pagination.current_page > 1 && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => fetchSchools({ ...filters, page: pagination.current_page - 1 }),
                  className: "px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50",
                  children: "Previous"
                }
              ),
              pagination.current_page < pagination.last_page && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => fetchSchools({ ...filters, page: pagination.current_page + 1 }),
                  className: "px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50",
                  children: "Next"
                }
              )
            ] })
          ] })
        ] }) }) }) })
      ]
    }
  );
}
export {
  Schools as default
};
