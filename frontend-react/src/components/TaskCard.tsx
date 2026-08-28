import type { Task } from "../types/Task"

interface TaskCardProps {
  task: Task
}

function TaskCard({ task }: TaskCardProps) {
  return (
    <li>
      <strong>{task.title}</strong>
      <span> · {task.status}</span>
      <span> · {task.priority}</span>
    </li>
  )
}

export default TaskCard