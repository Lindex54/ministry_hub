const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

