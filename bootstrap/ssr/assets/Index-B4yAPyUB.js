import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { A as AdminLayout } from "./AdminLayout-CaxbTFCB.js";
import { Head } from "@inertiajs/react";
function PropertyQuestions({ auth }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, "0")}, ${date.getFullYear()}`;
  };
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };
  useEffect(() => {
    fetchQuestions();
  }, [currentPage, statusFilter, searchTerm]);
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage);
      if (statusFilter) params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      const response = await fetch(`/admin/property-questions/data?${params.toString()}`, {
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "same-origin"
      });
      const result = await response.json();
      if (result.success) {
        setQuestions(result.data.data);
        setTotalPages(result.data.last_page);
        setTotalQuestions(result.data.total);
      }
    } catch (error) {
      console.error("Error fetching property questions:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(`/admin/property-questions/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNotes
        })
      });
      const result = await response.json();
      if (result.success) {
        fetchQuestions();
        setIsModalOpen(false);
        setSelectedQuestion(null);
        setAdminNotes("");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const response = await fetch(`/admin/property-questions/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "same-origin"
      });
      const result = await response.json();
      if (result.success) {
        fetchQuestions();
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question");
    }
  };
  const openModal = (question) => {
    setSelectedQuestion(question);
    setAdminNotes(question.admin_notes || "");
    setIsModalOpen(true);
  };
  const getStatusBadge = (status) => {
    const colors = {
      new: "bg-[#eff6ff] text-[#1e40af]",
      contacted: "bg-[#fefce8] text-[#ca8a04]",
      resolved: "bg-[#f0fdf4] text-[#16a34a]"
    };
    return colors[status] || "bg-[#f1f5f9] text-[#64748b]";
  };
  const newQuestions = questions.filter((q) => q.status === "new").length;
  return /* @__PURE__ */ jsxs(AdminLayout, { title: "Property Questions", children: [
    /* @__PURE__ */ jsx(Head, { title: "Property Questions" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-[#0f172a]", children: "Property Questions" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b] mt-1", children: "Manage questions from potential buyers" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#f1f5f9] flex items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: totalQuestions }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "Total Questions" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1e40af]", children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-[#0f172a]", children: newQuestions }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-[#64748b]", children: "New" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg border border-[#e2e8f0] p-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1.5", children: "Search" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Search...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "w-full pl-9 pr-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1.5", children: "Status" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All Status" }),
                /* @__PURE__ */ jsx("option", { value: "new", children: "New" }),
                /* @__PURE__ */ jsx("option", { value: "contacted", children: "Contacted" }),
                /* @__PURE__ */ jsx("option", { value: "resolved", children: "Resolved" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              setSearchTerm("");
              setStatusFilter("");
              setCurrentPage(1);
            },
            className: "px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors",
            children: "Clear Filters"
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg border border-[#e2e8f0]", children: [
        loading ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f172a]" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-[#64748b]", children: "Loading..." })
        ] }) : questions.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-[#f1f5f9] flex items-center justify-center mx-auto mb-3", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-[#94a3b8]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[#0f172a]", children: "No questions" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-[#94a3b8] mt-1", children: "No property questions found" })
        ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-[#e2e8f0]", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-[#f8fafc]", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Date" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Contact" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Property" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Question" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "bg-white divide-y divide-[#e2e8f0]", children: questions.map((question) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-[#f8fafc] transition-colors", children: [
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-4 whitespace-nowrap", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-[#0f172a]", children: formatDate(question.created_at) }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-[#64748b]", children: formatTime(question.created_at) })
            ] }),
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-4 whitespace-nowrap", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-[#0f172a]", children: question.name }),
              /* @__PURE__ */ jsx("a", { href: `mailto:${question.email}`, className: "text-xs text-[#3b82f6] hover:underline", children: question.email }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-[#64748b]", children: question.phone })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4", children: question.property_address && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm text-[#0f172a]", children: question.property_address }),
              question.property_listing_key && /* @__PURE__ */ jsxs("div", { className: "text-xs text-[#64748b]", children: [
                "MLS: ",
                question.property_listing_key
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsx("div", { className: "text-sm text-[#64748b] max-w-xs truncate", title: question.question, children: question.question }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(question.status)}`, children: question.status }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4 whitespace-nowrap text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => openModal(question),
                  className: "inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#3b82f6] bg-[#eff6ff] rounded-md hover:bg-[#dbeafe] transition-colors",
                  children: "View"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDelete(question.id),
                  className: "inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-[#dc2626] bg-[#fef2f2] rounded-md hover:bg-[#fee2e2] transition-colors",
                  children: "Delete"
                }
              )
            ] }) })
          ] }, question.id)) })
        ] }) }),
        totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 border-t border-[#e2e8f0] flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setCurrentPage(Math.max(1, currentPage - 1)),
              disabled: currentPage === 1,
              className: "px-3 py-1.5 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: "Previous"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "px-3 py-1.5 text-sm text-[#64748b]", children: [
            "Page ",
            currentPage,
            " of ",
            totalPages
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setCurrentPage(Math.min(totalPages, currentPage + 1)),
              disabled: currentPage === totalPages,
              className: "px-3 py-1.5 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: "Next"
            }
          )
        ] })
      ] })
    ] }),
    isModalOpen && selectedQuestion && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-[#0f172a] mb-4", children: "Question Details" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1", children: "Name" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#0f172a]", children: selectedQuestion.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1", children: "Email" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#0f172a]", children: selectedQuestion.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1", children: "Phone" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#0f172a]", children: selectedQuestion.phone })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1", children: "Status" }),
          /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(selectedQuestion.status)}`, children: selectedQuestion.status })
        ] })
      ] }),
      selectedQuestion.property_address && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1", children: "Property" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-[#0f172a]", children: [
          selectedQuestion.property_address,
          selectedQuestion.property_listing_key && ` (MLS: ${selectedQuestion.property_listing_key})`
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1", children: "Question" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-[#0f172a] whitespace-pre-wrap bg-[#f8fafc] p-3 rounded-lg", children: selectedQuestion.question })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-1.5", children: "Admin Notes" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: adminNotes,
            onChange: (e) => setAdminNotes(e.target.value),
            rows: 3,
            className: "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]",
            placeholder: "Add notes..."
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs font-medium text-[#64748b] mb-2", children: "Update Status" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleStatusUpdate(selectedQuestion.id, "new"),
              className: `px-4 py-2 text-sm rounded-lg transition-colors ${selectedQuestion.status === "new" ? "bg-[#1e40af] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`,
              children: "New"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleStatusUpdate(selectedQuestion.id, "contacted"),
              className: `px-4 py-2 text-sm rounded-lg transition-colors ${selectedQuestion.status === "contacted" ? "bg-[#ca8a04] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`,
              children: "Contacted"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleStatusUpdate(selectedQuestion.id, "resolved"),
              className: `px-4 py-2 text-sm rounded-lg transition-colors ${selectedQuestion.status === "resolved" ? "bg-[#16a34a] text-white" : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"}`,
              children: "Resolved"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setIsModalOpen(false);
            setSelectedQuestion(null);
            setAdminNotes("");
          },
          className: "px-4 py-2 text-sm font-medium text-[#64748b] bg-[#f1f5f9] rounded-lg hover:bg-[#e2e8f0] transition-colors",
          children: "Close"
        }
      ) })
    ] }) })
  ] });
}
export {
  PropertyQuestions as default
};
