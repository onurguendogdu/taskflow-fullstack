import type {
  Task,
  TaskStatus,
} from "../types/Task";

interface Props {
  task: Task;
  onDelete: (id: string) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

function TaskCard({
  task,
  onDelete,
  onStatusChange,
}: Props) {
  return (
    <li>
      <strong>{task.title}</strong>

      <span> · </span>

      <select
        value={task.status}
        onChange={(event) =>
          onStatusChange(
            task,
            event.target.value as TaskStatus
          )
        }
      >
        <option value="open">Offen</option>
        <option value="doing">In Bearbeitung</option>
        <option value="done">Erledigt</option>
      </select>

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