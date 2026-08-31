import type { CreateTaskInput, Task } from "../types/Task";

const BASE_URL = "/api/tasks";

async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data.message === "string") {
      return data.message;
    }
  } catch {
    // Response hatte keinen lesbaren JSON-Body
  }

  return fallback;
}

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Tasks konnten nicht geladen werden"
    );

    throw new Error(message);
  }

  return response.json();
}

export async function createTask(
  task: CreateTaskInput
): Promise<Task> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Task konnte nicht erstellt werden"
    );

    throw new Error(message);
  }

  return response.json();
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Task konnte nicht gelöscht werden"
    );

    throw new Error(message);
  }
}