import type {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskStatus,
} from "../types/Task";

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

export async function updateTaskStatus(
  task: Task,
  status: TaskStatus
): Promise<Task> {
  const response = await fetch(`${BASE_URL}/${task._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      due: task.due,
      status,
      priority: task.priority,
    }),
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Status konnte nicht geändert werden"
    );

    throw new Error(message);
  }

  return response.json();
}

export async function updateTaskPriority(
  task: Task,
  priority: TaskPriority
): Promise<Task> {
  const response = await fetch(`${BASE_URL}/${task._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      due: task.due,
      status: task.status,
      priority,
    }),
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Priorität konnte nicht geändert werden"
    );

    throw new Error(message);
  }

  return response.json();
}