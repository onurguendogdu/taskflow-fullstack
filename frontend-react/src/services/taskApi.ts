import type { Task } from "../types/Task"

const BASE_URL = "/api/tasks"

export async function getTasks(): Promise<Task[]> {
  const response = await fetch(BASE_URL)

  if (!response.ok) {
    throw new Error("Tasks konnten nicht geladen werden.")
  }

  return response.json()
}