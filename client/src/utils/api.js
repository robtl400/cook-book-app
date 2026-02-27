/**
 * Thin wrapper around fetch that:
 *  - Prefixes all requests with /api
 *  - Sends credentials (session cookie) on every request
 *  - Sets Content-Type: application/json for non-GET requests
 *  - Throws on non-2xx responses so callers can catch errors uniformly
 */
const BASE = (import.meta.env.VITE_API_URL || "") + "/api";

async function request(method, path, body) {
  const options = {
    method,
    credentials: "include",
    headers: {},
  };

  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, options);
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(json.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};
