import { useEffect, useState } from "react"
import "./App.css"

import TaskCard from "./components/TaskCard"
import TaskForm from "./components/TaskForm"
import {
  deleteTask,
  getTasks,
  updateTaskStatus,
} from "./services/taskApi"
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "./types/Task"

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("")
  const [priorityFilter, setPriorityFilter] =
    useState<TaskPriority | "">("")

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getTasks()
        setTasks(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Tasks konnten nicht geladen werden.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  function handleTaskCreated(task: Task) {
    setTasks((currentTasks) => [...currentTasks, task])
  }

  async function handleTaskDelete(id: string) {
    try {
      setError("")

      await deleteTask(id)

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== id)
      )
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Task konnte nicht gelöscht werden.")
      }
    }
  }

  async function handleStatusChange(
    task: Task,
    status: TaskStatus
  ) {
    try {
      setError("")

      const updatedTask = await updateTaskStatus(
        task,
        status
      )

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask._id === updatedTask._id
            ? updatedTask
            : currentTask
        )
      )
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Status konnte nicht geändert werden.")
      }
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === "" || task.status === statusFilter

    const matchesPriority =
      priorityFilter === "" || task.priority === priorityFilter

    return matchesStatus && matchesPriority
  })

  return (
    <main>
      <h1>TaskFlow</h1>
      <p>React + TypeScript migration</p>

      <TaskForm onTaskCreated={handleTaskCreated} />

      <h2>Aufgaben</h2>

      <div>
        <label htmlFor="statusFilter">Status filtern</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as TaskStatus | "")
          }
        >
          <option value="">Alle</option>
          <option value="open">Offen</option>
          <option value="doing">In Bearbeitung</option>
          <option value="done">Erledigt</option>
        </select>
      </div>

      <div>
        <label htmlFor="priorityFilter">Priorität filtern</label>
        <select
          id="priorityFilter"
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value as TaskPriority | "")
          }
        >
          <option value="">Alle</option>
          <option value="low">Niedrig</option>
          <option value="medium">Mittel</option>
          <option value="high">Hoch</option>
        </select>
      </div>

      {loading && <p>Tasks werden geladen...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && filteredTasks.length === 0 && (
        <p>Keine passenden Aufgaben vorhanden.</p>
      )}

      {!loading && !error && filteredTasks.length > 0 && (
        <ul>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={handleTaskDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </ul>
      )}
    </main>
  )
}

export default App