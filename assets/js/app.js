const initialTasks = [
  {
    id: 1,
    title: "Revisar backlog del sprint",
    priority: "Alta",
    completed: false,
    createdAt: "2026-02-10T09:00:00.000Z",
  },
  {
    id: 2,
    title: "Ajustar panel de métricas",
    priority: "Media",
    completed: true,
    createdAt: "2026-02-11T14:30:00.000Z",
  },
  {
    id: 3,
    title: "Documentar proceso de despliegue",
    priority: "Baja",
    completed: false,
    createdAt: "2026-02-12T16:00:00.000Z",
  },
];

const state = {
  tasks: [...initialTasks],
  filter: "all",
};

let nextTaskId = initialTasks.length
  ? Math.max(...initialTasks.map((task) => task.id)) + 1
  : 1;

const dom = {
  taskList: document.querySelector("#taskList"),
  taskForm: document.querySelector("#taskForm"),
  taskTitle: document.querySelector("#taskTitle"),
  taskPriority: document.querySelector("#taskPriority"),
  addTaskModal: document.querySelector("#addTaskModal"),
  summaryTotal: document.querySelector("#summaryTotal"),
  summaryPending: document.querySelector("#summaryPending"),
  summaryCompleted: document.querySelector("#summaryCompleted"),
  filterButtons: {
    all: document.querySelector("#filterAll"),
    pending: document.querySelector("#filterPending"),
    completed: document.querySelector("#filterCompleted"),
  },
};

function getFilteredTasks() {
  if (state.filter === "pending") {
    return state.tasks.filter((task) => !task.completed);
  }

  if (state.filter === "completed") {
    return state.tasks.filter((task) => task.completed);
  }

  return state.tasks;
}

function renderTasks() {
  const tasks = getFilteredTasks();
  dom.taskList.innerHTML = "";

  if (!tasks.length) {
    const empty = document.createElement("div");
    empty.className = "task-empty";
    empty.textContent = "No hay tareas para este filtro.";
    dom.taskList.append(empty);
    updateSummary();
    return;
  }

  const fragment = document.createDocumentFragment();

  tasks.forEach((task) => {
    fragment.append(createTaskElement(task));
  });

  dom.taskList.append(fragment);
  updateSummary();
}

function createTaskElement(task) {
  const article = document.createElement("article");
  article.className = `task-item${task.completed ? " is-completed" : ""}`;
  article.dataset.taskId = task.id;

  const top = document.createElement("div");
  top.className = "task-item__top";

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const status = document.createElement("span");
  status.className = `status-pill ${task.completed ? "completed" : "pending"}`;
  status.textContent = task.completed ? "Completada" : "Pendiente";

  top.append(title, status);

  const meta = document.createElement("p");
  meta.className = "task-meta mb-0";
  meta.textContent = `${formatDate(task.createdAt)} · Prioridad `;

  const priority = document.createElement("span");
  priority.className = `badge-priority ${task.priority.toLowerCase()}`;
  priority.textContent = task.priority;
  meta.append(priority);

  const actions = document.createElement("div");
  actions.className = "task-actions mt-3";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = `btn btn-sm ${task.completed ? "btn-soft" : "btn-brand"}`;
  toggleBtn.dataset.action = "toggle";
  toggleBtn.textContent = task.completed ? "Reabrir" : "Completar";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn-sm btn-outline-danger";
  deleteBtn.dataset.action = "delete";
  deleteBtn.textContent = "Eliminar";

  actions.append(toggleBtn, deleteBtn);

  article.append(top, meta, actions);
  return article;
}

function updateSummary() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  dom.summaryTotal.textContent = total;
  dom.summaryPending.textContent = pending;
  dom.summaryCompleted.textContent = completed;
}

function setFilter(filter) {
  state.filter = filter;
  Object.entries(dom.filterButtons).forEach(([key, button]) => {
    button.classList.toggle("is-active", key === filter);
    button.setAttribute("aria-pressed", String(key === filter));
  });
  renderTasks();
}

function addTask({ title, priority }) {
  state.tasks.unshift({
    id: nextTaskId++,
    title,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  });
  renderTasks();
}

function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) {
    return;
  }

  task.completed = !task.completed;
  renderTasks();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  renderTasks();
}

function validateForm() {
  const title = dom.taskTitle.value.trim().replace(/\s+/g, " ");
  const priority = dom.taskPriority.value;
  let isValid = true;

  if (!title || title.length > 80) {
    dom.taskTitle.classList.add("is-invalid");
    isValid = false;
  } else {
    dom.taskTitle.classList.remove("is-invalid");
  }

  if (!priority) {
    dom.taskPriority.classList.add("is-invalid");
    isValid = false;
  } else {
    dom.taskPriority.classList.remove("is-invalid");
  }

  return { isValid, title, priority };
}

function resetForm() {
  dom.taskForm.reset();
  dom.taskTitle.classList.remove("is-invalid");
  dom.taskPriority.classList.remove("is-invalid");
}

function bindEvents() {
  dom.filterButtons.all.addEventListener("click", () => setFilter("all"));
  dom.filterButtons.pending.addEventListener("click", () => setFilter("pending"));
  dom.filterButtons.completed.addEventListener("click", () => setFilter("completed"));

  dom.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const { isValid, title, priority } = validateForm();

    if (!isValid) {
      return;
    }

    addTask({ title, priority });

    if (window.bootstrap?.Modal) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(dom.addTaskModal);
      modalInstance.hide();
    }

    resetForm();
  });

  dom.addTaskModal.addEventListener("hidden.bs.modal", () => {
    resetForm();
  });

  dom.taskList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) {
      return;
    }

    const item = actionButton.closest(".task-item");
    if (!item) {
      return;
    }

    const taskId = Number(item.dataset.taskId);
    const action = actionButton.dataset.action;

    if (action === "toggle") {
      toggleTask(taskId);
      return;
    }

    if (action === "delete") {
      deleteTask(taskId);
    }
  });
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  setFilter("all");
});
