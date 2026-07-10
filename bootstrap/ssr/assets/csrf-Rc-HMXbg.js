function csrfHeaders() {
  const row = document.cookie.split("; ").find((c) => c.startsWith("XSRF-TOKEN="));
  if (row) {
    return { "X-XSRF-TOKEN": decodeURIComponent(row.slice("XSRF-TOKEN=".length)) };
  }
  const meta = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  return meta ? { "X-CSRF-TOKEN": meta } : {};
}
export {
  csrfHeaders as c
};
