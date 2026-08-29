import { useState } from "react"
import type { FormEvent } from "react"

import { createTask } from "../services/taskApi"
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "../types/Task"

interface TaskFormProps {
  onTaskCreated: (task: Task) => void
}

function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [due, setDue] = useState("")
  const [status, setStatus] = useState<TaskStatus>("open")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const newTask = await createTask({
        title,
        description,
        due: new Date(due).toISOString(),
        status,
        priority,
      })

      onTaskCreated(newTask)

      setTitle("")
      setDescription("")
      setDue("")
      setStatus("open")
      setPriority("medium")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Task konnte nicht erstellt werden.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Neue Aufgabe</h2>

      <div>
        <label htmlFor="title">Titel</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          minLength={3}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Beschreibung</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="due">Fällig am</label>
        <input
          id="due"
          type="datetime-local"
          value={due}
          onChange={(event) => setDue(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as TaskStatus)
          }
        >
          <option value="open">Offen</option>
          <option value="doing">In Bearbeitung</option>
          <option value="done">Erledigt</option>
        </select>
      </div>

      <div>
        <label htmlFor="priority">Priorität</label>
        <select
          id="priority"
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as TaskPriority)
          }
        >
          <option value="low">Niedrig</option>
          <option value="medium">Mittel</option>
          <option value="high">Hoch</option>
        </select>
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? "Wird erstellt..." : "Aufgabe erstellen"}
      </button>

      {error && <p>{error}</p>}
    </form>
  )
}

export default TaskForm