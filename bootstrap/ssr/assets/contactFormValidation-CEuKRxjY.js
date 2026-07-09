const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
function validateContactFields(data, { requireQuestion = false, requireMessage = false } = {}) {
  const errors = {};
  if (!String(data.name || "").trim()) {
    errors.name = "Full name is required";
  }
  if (!String(data.email || "").trim()) {
    errors.email = "Email address is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Enter a valid email address";
  }
  if (!String(data.phone || "").trim()) {
    errors.phone = "Phone number is required";
  }
  if (requireQuestion && !String(data.question || "").trim()) {
    errors.question = "Please enter your question";
  }
  if (requireMessage && !String(data.message || "").trim()) {
    errors.message = "Please enter a message";
  }
  return errors;
}
function mapServerErrors(serverErrors, keyMap) {
  const fieldErrors = {};
  const unmapped = [];
  Object.entries(serverErrors || {}).forEach(([key, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : String(messages);
    const field = keyMap[key];
    if (field) {
      fieldErrors[field] = fieldErrors[field] || message;
    } else {
      unmapped.push(message);
    }
  });
  return { fieldErrors, unmapped: unmapped.join(" ") };
}
function focusFirstError(errors, idMap = {}, order = ["name", "email", "phone", "question", "message"]) {
  const first = order.find((field) => errors[field]);
  if (!first) return;
  const el = document.getElementById(idMap[first] || first);
  if (el && typeof el.focus === "function") {
    el.focus();
  }
}
export {
  focusFirstError as f,
  mapServerErrors as m,
  validateContactFields as v
};
