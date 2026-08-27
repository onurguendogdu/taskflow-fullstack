export interface Task {
  _id: string
  title: string
  description?: string
  due: string
  status: "open" | "doing" | "done"
  priority: "low" | "medium" | "high"
}