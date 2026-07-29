const BASE_URL = "/api/tasks";

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (response.status === 401) {
        window.location.assign("/login");
        throw new Error("Anmeldung erforderlich.");
    }

    if (!response.ok) {
        let message = `Request failed (${response.status}).`;
        try {
            const data = await response.json();
            if (data.message) message = data.message;
        } catch {
            // Non-JSON error response.
        }
        throw new Error(message);
    }

    if (response.status === 204) return null;
    return response.json();
}

export async function getCurrentUser() {
    return request("/auth/me");
}

export async function listTasks(filters = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value) params.set(key, value);
    }
    const query = params.toString();
    return request(`${BASE_URL}${query ? `?${query}` : ""}`);
}

export function createTask(task) {
    return request(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });
}

export function updateTask(id, task) {
    return request(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });
}

export function deleteTask(id) {
    return request(`${BASE_URL}/${id}`, { method: "DELETE" });
}
