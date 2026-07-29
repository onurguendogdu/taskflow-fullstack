import {
    createTask,
    deleteTask,
    getCurrentUser,
    listTasks,
    updateTask
} from "./api.js";
import {
    renderStats,
    renderTasks,
    showToast,
    toDateTimeLocal
} from "./ui.js";

const state = {
    allTasks: [],
    filters: { q: "", status: "", priority: "", sort: "due", order: "asc" }
};

const elements = {
    createForm: document.querySelector("#create-form"),
    list: document.querySelector("#task-list"),
    search: document.querySelector("#search"),
    statusFilter: document.querySelector("#status-filter"),
    priorityFilter: document.querySelector("#priority-filter"),
    userChip: document.querySelector("#user-chip"),
    dialog: document.querySelector("#edit-dialog"),
    editForm: document.querySelector("#edit-form")
};

function readTaskForm(prefix = "") {
    const id = (name) => document.querySelector(`#${prefix}${name}`);
    return {
        title: id("title").value.trim(),
        description: id("description").value.trim(),
        due: new Date(id("due").value).toISOString(),
        status: prefix ? id("status").value : "open",
        priority: id("priority").value
    };
}

async function refresh() {
    try {
        const tasks = await listTasks(state.filters);
        state.allTasks = tasks;
        renderTasks(elements.list, tasks, {
            onEdit: openEditDialog,
            onDelete: removeTask
        });

        const unfiltered = await listTasks({ sort: "due", order: "asc" });
        renderStats(unfiltered);
    } catch (error) {
        showToast(error.message, "error");
    }
}

async function removeTask(task) {
    if (!window.confirm(`„${task.title}“ wirklich löschen?`)) return;

    try {
        await deleteTask(task._id);
        showToast("Aufgabe gelöscht.");
        await refresh();
    } catch (error) {
        showToast(error.message, "error");
    }
}

function openEditDialog(task) {
    document.querySelector("#edit-id").value = task._id;
    document.querySelector("#edit-title").value = task.title;
    document.querySelector("#edit-description").value = task.description || "";
    document.querySelector("#edit-due").value = toDateTimeLocal(task.due);
    document.querySelector("#edit-status").value = task.status;
    document.querySelector("#edit-priority").value = task.priority;
    elements.dialog.showModal();
}

function debounce(callback, delay = 250) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), delay);
    };
}

elements.createForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        await createTask(readTaskForm());
        elements.createForm.reset();
        document.querySelector("#priority").value = "medium";
        showToast("Aufgabe angelegt.");
        await refresh();
    } catch (error) {
        showToast(error.message, "error");
    }
});

elements.editForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const id = document.querySelector("#edit-id").value;
        await updateTask(id, readTaskForm("edit-"));
        elements.dialog.close();
        showToast("Aufgabe aktualisiert.");
        await refresh();
    } catch (error) {
        showToast(error.message, "error");
    }
});

document.querySelector("#close-dialog").addEventListener("click", () => elements.dialog.close());
document.querySelector("#cancel-edit").addEventListener("click", () => elements.dialog.close());

elements.search.addEventListener("input", debounce(async (event) => {
    state.filters.q = event.target.value.trim();
    await refresh();
}));

elements.statusFilter.addEventListener("change", async (event) => {
    state.filters.status = event.target.value;
    await refresh();
});

elements.priorityFilter.addEventListener("change", async (event) => {
    state.filters.priority = event.target.value;
    await refresh();
});

async function initialize() {
    try {
        const user = await getCurrentUser();
        elements.userChip.textContent = user.mode === "demo" ? `${user.username} · Demo` : user.username;
    } catch (error) {
        showToast(error.message, "error");
    }

    const due = document.querySelector("#due");
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    due.value = toDateTimeLocal(tomorrow);

    await refresh();
}

initialize();
