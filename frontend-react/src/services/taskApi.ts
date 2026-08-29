import type { CreateTaskInput, Task } from "../types/Task"

const BASE_URL = "/api/tasks"

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(BASE_URL)

  if (!response.ok) {
    throw new Error("Tasks konnten nicht geladen werden.")
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
    throw new Error("Task konnte nicht erstellt werden.")
  }

  return response.json()
}