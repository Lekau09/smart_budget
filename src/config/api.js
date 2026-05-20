// Single source for backend API base URL
// Two backends:
//   API_BASE     → existing PHP/Apache backend (port 8080)
//   ML_API_BASE  → Flask SMS classification service (port 5000)

const protocol = window.location.protocol;
const hostname = window.location.hostname;
const isDev =
  window.location.port === "5173" ||
  window.location.port === "5174" ||
  window.location.port === "5175";

// ── Existing PHP backend ──────────────────────────────────────
const path = "/smart_budget/backend/api";

// In development, use the relative backend path so Vite can proxy requests
// to the local PHP/Apache backend and avoid cross-origin port mismatch.
export const API_BASE = isDev
  ? path
  : `${protocol}//${window.location.host}${path}`;

// ── New Flask ML / SMS API (always port 5000 locally) ────────
export const ML_API_BASE = `http://localhost:5000`;

// ── Helper: call the ML API ───────────────────────────────────
/**
 * Parse a single SMS and classify it.
 * @param {string} smsText
 * @returns {Promise<object>} { bank, amount, store, balance, category,
 *                              confidence, needs_manual_category, top_predictions }
 */
export async function parseSMS(smsText) {
  const res = await fetch(`${ML_API_BASE}/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sms: smsText }),
  });
  if (!res.ok) throw new Error(`SMS parse failed: ${res.status}`);
  return res.json();
}

/**
 * Parse multiple SMS messages at once (max 500).
 * @param {string[]} messages
 * @returns {Promise<{results: object[], count: number}>}
 */
export async function parseSMSBulk(messages) {
  const res = await fetch(`${ML_API_BASE}/parse_bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`Bulk SMS parse failed: ${res.status}`);
  return res.json();
}

/**
 * Confirm a category manually for an ambiguous transaction.
 * Call this when needs_manual_category === true and user picks a category.
 * @param {string} smsText
 * @param {string} category  e.g. "Shopping"
 * @param {string} store     e.g. "Footgear (pty)ltd"
 * @returns {Promise<object>}
 */
export async function confirmSMSCategory(smsText, category, store) {
  const res = await fetch(`${ML_API_BASE}/confirm_category`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sms: smsText, category, store }),
  });
  if (!res.ok) throw new Error(`Confirm category failed: ${res.status}`);
  return res.json();
}

/**
 * Check if the Flask ML API is running.
 * @returns {Promise<boolean>}
 */
export async function checkMLHealth() {
  try {
    const res = await fetch(`${ML_API_BASE}/health`);
    const data = await res.json();
    return data.status === "ok" && data.model_loaded === true;
  } catch {
    return false;
  }
}

// ── Debug logs ────────────────────────────────────────────────
console.log("API Config:");
console.log("  PHP  API_BASE:", API_BASE);
console.log("  ML   API_BASE:", ML_API_BASE);
