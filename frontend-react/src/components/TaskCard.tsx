import type { Task } from "../types/Task";

interface Props {
  task: Task;
  onDelete: (id: string) => void;
}

function TaskCard({ task, onDelete }: Props) {
  return (
    <li>
      <strong>{task.title}</strong>
      <span> · {task.status}</span>
      <span> · {task.priority}</span>

      <button
        type="button"
        onClick={() => onDelete(task._id)}
      >
        Löschen
      </button>
    </li>
  );
}

export default TaskCard;