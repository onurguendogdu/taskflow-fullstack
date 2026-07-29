const statusLabels = {
    open: "Offen",
    doing: "In Arbeit",
    done: "Erledigt"
};

const priorityLabels = {
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch"
};

export function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Kein Datum";
    return new Intl.DateTimeFormat("de-DE", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

export function toDateTimeLocal(value) {
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function renderStats(tasks) {
    for (const status of ["open", "doing", "done"]) {
        const element = document.querySelector(`#stat-${status}`);
        element.textContent = tasks.filter((task) => task.status === status).length;
    }
}

function badge(text, className) {
    const element = document.createElement("span");
    element.className = `badge ${className}`;
    element.textContent = text;
    return element;
}

function createTaskCard(task, actions) {
    const article = document.createElement("article");
    article.className = `task-card status-${task.status}`;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.append(
        badge(statusLabels[task.status] || task.status, `status-badge status-${task.status}`),
        badge(priorityLabels[task.priority] || task.priority, `priority-badge priority-${task.priority}`)
    );

    const title = document.createElement("h3");
    title.textContent = task.title;

    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description || "Keine Beschreibung hinterlegt.";

    const due = document.createElement("p");
    due.className = "task-due";
    due.textContent = `Fällig: ${formatDate(task.due)}`;

    const controls = document.createElement("div");
    controls.className = "task-actions";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "secondary-button compact";
    edit.textContent = "Bearbeiten";
    edit.addEventListener("click", () => actions.onEdit(task));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger-button compact";
    remove.textContent = "Löschen";
    remove.addEventListener("click", () => actions.onDelete(task));

    controls.append(edit, remove);
    article.append(meta, title, description, due, controls);
    return article;
}

export function renderTasks(container, tasks, actions) {
    container.replaceChildren();

    if (!tasks.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.innerHTML = "<strong>Keine Aufgaben gefunden.</strong><span>Lege eine neue Aufgabe an oder passe die Filter an.</span>";
        container.append(empty);
        return;
    }

    for (const task of tasks) {
        container.append(createTaskCard(task, actions));
    }
}

let toastTimer;
export function showToast(message, type = "success") {
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.dataset.type = type;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2800);
}
