const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `API request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function withJsonBody(method) {
  return (path, body) => api(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

api.post = withJsonBody("POST");
api.patch = withJsonBody("PATCH");
api.put = withJsonBody("PUT");
api.delete = (path) => api(path, { method: "DELETE" });
