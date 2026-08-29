export type TaskStatus = "open" | "doing" | "done"

export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  _id: string
  title: string
  description?: string
  due: string
  status: TaskStatus
  priority: TaskPriority
}

export interface CreateTaskInput {
  title: string
  description?: string
  due: string
  status: TaskStatus
  priority: TaskPriority
}