import { jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
function formatPhone(value) {
  if (value == null) return "";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 0) return "";
  let countryCode = "";
  let local = digits;
  if (digits.length === 11 && digits.startsWith("1")) {
    countryCode = "+1 ";
    local = digits.slice(1);
  } else if (digits.length > 11) {
    return "+" + digits;
  }
  if (local.length <= 3) return `${countryCode}(${local}`;
  if (local.length <= 6) return `${countryCode}(${local.slice(0, 3)}) ${local.slice(3)}`;
  return `${countryCode}(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 10)}`;
}
const PhoneInput = forwardRef(function PhoneInput2({ value = "", onChange, className = "", placeholder = "(437) 998-1795", ...rest }, ref) {
  const handleChange = (e) => {
    const formatted = formatPhone(e.target.value);
    const synthetic = {
      ...e,
      target: { ...e.target, value: formatted, name: e.target.name }
    };
    onChange?.(synthetic);
  };
  return /* @__PURE__ */ jsx(
    "input",
    {
      type: "tel",
      ref,
      value: formatPhone(value),
      onChange: handleChange,
      placeholder,
      className,
      inputMode: "tel",
      autoComplete: "tel",
      ...rest
    }
  );
});
export {
  PhoneInput as P
};
