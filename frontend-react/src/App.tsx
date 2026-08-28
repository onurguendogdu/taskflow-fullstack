import { useEffect, useState } from "react"
import "./App.css"

import { getTasks } from "./services/taskApi"
import type { Task } from "./types/Task"

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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

  return (
    <main>
      <h1>TaskFlow</h1>
      <p>React + TypeScript migration</p>

      {loading && <p>Tasks werden geladen...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p>Keine Aufgaben vorhanden.</p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <ul>
          {tasks.map((task) => (
            <li key={task._id}>
              <strong>{task.title}</strong>
              <span> · {task.status}</span>
              <span> · {task.priority}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App