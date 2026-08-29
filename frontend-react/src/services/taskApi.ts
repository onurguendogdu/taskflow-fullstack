import type { CreateTaskInput, Task } from "../types/Task"

const BASE_URL = "/api/tasks"

async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data = await response.json()

    if (typeof data.message === "string") {
      return data.message
    }
  } catch {
    // Falls keine JSON-Fehlermeldung vorhanden ist,
    // verwenden wir die allgemeine Meldung.
  }

  return fallbackMessage
}

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(BASE_URL)

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Tasks konnten nicht geladen werden.",
    )

    throw new Error(message)
  }

  return response.json()
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "Task konnte nicht erstellt werden.",
    )

    throw new Error(message)
  }

  return response.json()
}