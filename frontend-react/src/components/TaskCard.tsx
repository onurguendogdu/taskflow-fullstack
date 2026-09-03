import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "../types/Task";

interface Props {
  task: Task;
  onDelete: (id: string) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onPriorityChange: (task: Task, priority: TaskPriority) => void;
}

function TaskCard({
  task,
  onDelete,
  onStatusChange,
  onPriorityChange,
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

      <span> · </span>

      <select
        value={task.priority}
        onChange={(event) =>
          onPriorityChange(
            task,
            event.target.value as TaskPriority
          )
        }
      >
        <option value="low">Niedrig</option>
        <option value="medium">Mittel</option>
        <option value="high">Hoch</option>
      </select>

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