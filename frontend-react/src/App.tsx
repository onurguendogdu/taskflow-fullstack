import { useEffect, useState } from "react"
import "./App.css"

import TaskCard from "./components/TaskCard"
import TaskForm from "./components/TaskForm"
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

  function handleTaskCreated(task: Task) {
    setTasks((currentTasks) => [...currentTasks, task])
  }

  return (
    <main>
      <h1>TaskFlow</h1>
      <p>React + TypeScript migration</p>

      <TaskForm onTaskCreated={handleTaskCreated} />

      <h2>Aufgaben</h2>

      {loading && <p>Tasks werden geladen...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && tasks.length === 0 && (
        <p>Keine Aufgaben vorhanden.</p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <ul>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default App