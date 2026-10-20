/**
 * ==============================================================================
 * TASKFLOW - DYNAMIC TO-DO APPLICATION JAVASCRIPT
 * Modern, accessible, LocalStorage-backed Task Manager
 * Features: CRUD, Filtering, Real-time Search, Sorting, Custom Modals & Toasts
 * ==============================================================================
 */

// Strict Mode for cleaner code and catching silent errors
'use strict';

/* ==============================================================================
   1. Application State & LocalStorage Configuration
   ============================================================================== */
const STORAGE_KEY = 'taskflow_tasks_v1';

// Initial state
let tasks = [];
let currentFilter = 'all'; // 'all' | 'active' | 'completed'
let searchQuery = '';
let currentSort = 'newest'; // 'newest' | 'oldest' | 'priority' | 'alphabetical'

// Pending action holders for custom confirmation modals
let taskPendingDeletionId = null;

/* Default starter tasks for a delightful first-time user experience */
const DEFAULT_TASKS = [
  {
    id: 'sample-task-1',
    title: 'Explore TaskFlow dashboard features',
    description: 'Test filtering, search, priority tags, and editing tasks.',
    priority: 'high',
    completed: false,
    createdAt: Date.now() - 3600000 * 4
  },
  {
    id: 'sample-task-2',
    title: 'Review Frontend Internship deliverables',
    description: 'Ensure HTML5, CSS3, and JavaScript requirements are satisfied.',
    priority: 'medium',
    completed: true,
    createdAt: Date.now() - 3600000 * 24
  },
  {
    id: 'sample-task-3',
    title: 'Plan tomorrow’s development schedule',
    description: 'Prioritize feature backlog and clean up code comments.',
    priority: 'low',
    completed: false,
    createdAt: Date.now() - 3600000 * 2
  }
];

/* ==============================================================================
   2. DOM Element Selectors
   ============================================================================== */
// Stats & Header
const currentDateText = document.getElementById('currentDateText');
const totalTasksCount = document.getElementById('totalTasksCount');
const pendingTasksCount = document.getElementById('pendingTasksCount');
const completedTasksCount = document.getElementById('completedTasksCount');
const completionPercentage = document.getElementById('completionPercentage');
const progressFill = document.getElementById('progressFill');

// Creation Form Elements
const taskForm = document.getElementById('taskForm');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskDescInput = document.getElementById('taskDescInput');
const titleCharCount = document.getElementById('titleCharCount');
const titleErrorMsg = document.getElementById('titleErrorMsg');

// Filter & Search Controls
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const filterCountAll = document.getElementById('filterCountAll');
const filterCountActive = document.getElementById('filterCountActive');
const filterCountCompleted = document.getElementById('filterCountCompleted');
const sortSelect = document.getElementById('sortSelect');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// Task List & Empty State
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const emptyStateTitle = document.getElementById('emptyStateTitle');
const emptyStateDesc = document.getElementById('emptyStateDesc');
const emptyStateActionBtn = document.getElementById('emptyStateActionBtn');

// Edit Task Modal Elements
const editModal = document.getElementById('editModal');
const editTaskForm = document.getElementById('editTaskForm');
const editTaskId = document.getElementById('editTaskId');
const editTaskTitle = document.getElementById('editTaskTitle');
const editTaskDesc = document.getElementById('editTaskDesc');
const editTitleErrorMsg = document.getElementById('editTitleErrorMsg');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Delete Confirmation Modal Elements
const deleteModal = document.getElementById('deleteModal');
const deleteTaskPreview = document.getElementById('deleteTaskPreview');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// Clear All Completed Modal Elements
const clearCompletedModal = document.getElementById('clearCompletedModal');
const confirmClearCompletedBtn = document.getElementById('confirmClearCompletedBtn');
const cancelClearCompletedBtn = document.getElementById('cancelClearCompletedBtn');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

/* ==============================================================================
   3. Initialization & LocalStorage Helpers
   ============================================================================== */

/**
 * Initializes application on page load
 */
function initApp() {
  loadTasksFromStorage();
  displayCurrentDate();
  bindEventListeners();
  renderApp();
}

/**
 * Safely loads tasks from localStorage or defaults
 */
function loadTasksFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      tasks = JSON.parse(stored);
    } else {
      // First visit: provide sample starter tasks
      tasks = [...DEFAULT_TASKS];
      saveTasksToStorage();
    }
  } catch (error) {
    console.error('Error loading tasks from LocalStorage:', error);
    tasks = [];
    showToast('Failed to load saved tasks from storage.', 'danger');
  }
}

/**
 * Saves current tasks array to browser LocalStorage
 */
function saveTasksToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to LocalStorage:', error);
    showToast('Storage limit reached or LocalStorage unavailable.', 'danger');
  }
}

/**
 * Displays formatted current date in the header
 */
function displayCurrentDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const today = new Date();
  if (currentDateText) {
    currentDateText.textContent = today.toLocaleDateString('en-US', options);
  }
}

/* ==============================================================================
   4. Event Listeners Setup
   ============================================================================== */
function bindEventListeners() {
  // Add task form submission
  taskForm.addEventListener('submit', handleAddTask);

  // Character counter for task title input
  taskTitleInput.addEventListener('input', () => {
    const length = taskTitleInput.value.length;
    titleCharCount.textContent = `${length}/120`;
    if (length > 0) {
      taskTitleInput.classList.remove('input-error');
      titleErrorMsg.classList.remove('active');
    }
  });

  // Empty state call-to-action button
  emptyStateActionBtn.addEventListener('click', () => {
    taskTitleInput.focus();
    taskTitleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Search input handling
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    searchClearBtn.classList.toggle('visible', searchQuery.length > 0);
    renderTasksList();
  });

  // Clear search input
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClearBtn.classList.remove('visible');
    searchInput.focus();
    renderTasksList();
  });

  // Filter tabs click handling
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentFilter = btn.getAttribute('data-filter');
      renderTasksList();
    });
  });

  // Sort select change handling
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTasksList();
  });

  // Clear completed tasks trigger
  clearCompletedBtn.addEventListener('click', () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear.', 'info');
      return;
    }
    openModal(clearCompletedModal);
  });

  // Confirm Clear Completed
  confirmClearCompletedBtn.addEventListener('click', () => {
    const completedCount = tasks.filter(t => t.completed).length;
    tasks = tasks.filter(t => !t.completed);
    saveTasksToStorage();
    closeModal(clearCompletedModal);
    renderApp();
    showToast(`Removed ${completedCount} completed task${completedCount > 1 ? 's' : ''}.`, 'info');
  });

  cancelClearCompletedBtn.addEventListener('click', () => {
    closeModal(clearCompletedModal);
  });

  // Delete modal buttons
  confirmDeleteBtn.addEventListener('click', confirmDeleteTask);
  cancelDeleteBtn.addEventListener('click', () => closeModal(deleteModal));

  // Edit task modal form submission & cancel
  editTaskForm.addEventListener('submit', handleSaveEditedTask);
  closeEditModalBtn.addEventListener('click', () => closeModal(editModal));
  cancelEditBtn.addEventListener('click', () => closeModal(editModal));

  // Global Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // Escape key closes open modals
    if (e.key === 'Escape') {
      closeAllModals();
    }
    // Quick search shortcut: '/' key focuses search bar (if not already in an input)
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Backdrop click to close modals
  [editModal, deleteModal, clearCompletedModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });
}

/* ==============================================================================
   5. Task CRUD Operations
   ============================================================================== */

/**
 * Handles adding a new task from the main input form
 */
function handleAddTask(e) {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();
  const selectedPriorityRadio = document.querySelector('input[name="taskPriority"]:checked');
  const priority = selectedPriorityRadio ? selectedPriorityRadio.value : 'low';

  // Validation: Check for empty title
  if (!title) {
    taskTitleInput.classList.add('input-error');
    titleErrorMsg.classList.add('active');
    taskTitleInput.focus();
    showToast('Task title cannot be empty!', 'danger');
    return;
  }

  // Create new task object
  const newTask = {
    id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title: title,
    description: description,
    priority: priority,
    completed: false,
    createdAt: Date.now()
  };

  // Add to tasks list (prepend to front for immediate visibility)
  tasks.unshift(newTask);
  saveTasksToStorage();

  // Reset form
  taskForm.reset();
  titleCharCount.textContent = '0/120';
  taskTitleInput.classList.remove('input-error');
  titleErrorMsg.classList.remove('active');

  // Update UI & feedback
  renderApp();
  showToast('Task added successfully!', 'success');
}

/**
 * Toggles completed status of a task
 */
function toggleTaskCompletion(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  saveTasksToStorage();
  renderApp();

  if (task.completed) {
    showToast('Task completed! Keep up the momentum 🎉', 'success');
  } else {
    showToast('Task marked as pending.', 'info');
  }
}

/**
 * Opens confirmation modal before deleting a task
 */
function requestDeleteTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  taskPendingDeletionId = taskId;
  deleteTaskPreview.textContent = `"${task.title}"`;
  openModal(deleteModal);
}

/**
 * Executes deletion after user confirms in modal
 */
function confirmDeleteTask() {
  if (!taskPendingDeletionId) return;

  const taskIndex = tasks.findIndex(t => t.id === taskPendingDeletionId);
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    saveTasksToStorage();
    renderApp();
    showToast('Task deleted successfully.', 'info');
  }

  taskPendingDeletionId = null;
  closeModal(deleteModal);
}

/**
 * Opens edit modal with task data loaded
 */
function requestEditTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  editTaskId.value = task.id;
  editTaskTitle.value = task.title;
  editTaskDesc.value = task.description || '';

  // Select priority radio
  const priorityRadio = document.querySelector(`input[name="editPriority"][value="${task.priority}"]`);
  if (priorityRadio) priorityRadio.checked = true;

  editTaskTitle.classList.remove('input-error');
  editTitleErrorMsg.classList.remove('active');

  openModal(editModal);
  setTimeout(() => editTaskTitle.focus(), 150);
}

/**
 * Handles saving changes from edit modal
 */
function handleSaveEditedTask(e) {
  e.preventDefault();

  const id = editTaskId.value;
  const newTitle = editTaskTitle.value.trim();
  const newDesc = editTaskDesc.value.trim();
  const selectedPriorityRadio = document.querySelector('input[name="editPriority"]:checked');
  const newPriority = selectedPriorityRadio ? selectedPriorityRadio.value : 'low';

  // Validation
  if (!newTitle) {
    editTaskTitle.classList.add('input-error');
    editTitleErrorMsg.classList.add('active');
    editTaskTitle.focus();
    return;
  }

  const task = tasks.find(t => t.id === id);
  if (task) {
    task.title = newTitle;
    task.description = newDesc;
    task.priority = newPriority;

    saveTasksToStorage();
    closeModal(editModal);
    renderApp();
    showToast('Task updated successfully!', 'success');
  }
}

/* ==============================================================================
   6. Filtering, Sorting, and Search Logic
   ============================================================================= */

/**
 * Filters and sorts tasks based on active criteria
 */
function getFilteredAndSortedTasks() {
  return tasks
    // 1. Filter by status (All, Active, Completed)
    .filter(task => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true; // 'all'
    })
    // 2. Filter by Search Query
    .filter(task => {
      if (!searchQuery) return true;
      const titleMatch = task.title.toLowerCase().includes(searchQuery);
      const descMatch = (task.description || '').toLowerCase().includes(searchQuery);
      return titleMatch || descMatch;
    })
    // 3. Sort tasks
    .sort((a, b) => {
      if (currentSort === 'newest') {
        return b.createdAt - a.createdAt;
      }
      if (currentSort === 'oldest') {
        return a.createdAt - b.createdAt;
      }
      if (currentSort === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      if (currentSort === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
      }
      return 0;
    });
}

/* ==============================================================================
   7. Rendering & DOM Updates
   ============================================================================== */

/**
 * Re-renders both statistics and task list items
 */
function renderApp() {
  updateDashboardStats();
  renderTasksList();
}

/**
 * Calculates and updates all metrics, badges, and progress bar
 */
function updateDashboardStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Stat numbers
  totalTasksCount.textContent = total;
  pendingTasksCount.textContent = pending;
  completedTasksCount.textContent = completed;

  // Progress Bar
  completionPercentage.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;
  document.getElementById('progressTrack').setAttribute('aria-valuenow', percentage);

  // Tab Badge counts
  filterCountAll.textContent = total;
  filterCountActive.textContent = pending;
  filterCountCompleted.textContent = completed;
}

/**
 * Renders the filtered tasks list into the DOM
 */
function renderTasksList() {
  const visibleTasks = getFilteredAndSortedTasks();

  // Clear current list
  taskList.innerHTML = '';

  // Handle Empty State
  if (visibleTasks.length === 0) {
    emptyState.classList.add('active');

    if (tasks.length === 0) {
      emptyStateTitle.textContent = 'No tasks yet';
      emptyStateDesc.textContent = 'Add your first task above to start organizing your day efficiently.';
      emptyStateActionBtn.style.display = 'inline-flex';
    } else if (searchQuery) {
      emptyStateTitle.textContent = 'No matching tasks';
      emptyStateDesc.textContent = `No tasks match your search query "${escapeHTML(searchQuery)}".`;
      emptyStateActionBtn.style.display = 'none';
    } else if (currentFilter === 'active') {
      emptyStateTitle.textContent = 'All caught up!';
      emptyStateDesc.textContent = 'You have no pending tasks right now. Great job!';
      emptyStateActionBtn.style.display = 'none';
    } else if (currentFilter === 'completed') {
      emptyStateTitle.textContent = 'No completed tasks';
      emptyStateDesc.textContent = 'Complete some of your active tasks to view them here.';
      emptyStateActionBtn.style.display = 'none';
    }
    return;
  }

  // Hide empty state when tasks are present
  emptyState.classList.remove('active');

  // Render each task card
  const fragment = document.createDocumentFragment();

  visibleTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', task.id);

    // Format human-readable creation date
    const formattedDate = formatTimeAgo(task.createdAt);

    li.innerHTML = `
      <label class="checkbox-container" title="${task.completed ? 'Mark as pending' : 'Mark as completed'}">
        <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Toggle completed for ${escapeHTML(task.title)}">
        <span class="checkmark">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      </label>

      <div class="task-content">
        <div class="task-header-row">
          <h3 class="task-title">${escapeHTML(task.title)}</h3>
          <span class="task-priority-tag tag-${task.priority}">${task.priority}</span>
        </div>
        ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}
        <div class="task-meta">
          <span class="task-date">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${formattedDate}
          </span>
        </div>
      </div>

      <div class="task-actions">
        <button type="button" class="action-btn action-btn-edit" aria-label="Edit task" title="Edit task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button type="button" class="action-btn action-btn-delete" aria-label="Delete task" title="Delete task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;

    // Bind event listeners to this task's controls
    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

    const editBtn = li.querySelector('.action-btn-edit');
    editBtn.addEventListener('click', () => requestEditTask(task.id));

    const deleteBtn = li.querySelector('.action-btn-delete');
    deleteBtn.addEventListener('click', () => requestDeleteTask(task.id));

    fragment.appendChild(li);
  });

  taskList.appendChild(fragment);
}

/* ==============================================================================
   8. Modal Helpers
   ============================================================================== */
function openModal(modalElement) {
  modalElement.classList.add('open');
  modalElement.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal(modalElement) {
  modalElement.classList.remove('open');
  modalElement.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function closeAllModals() {
  [editModal, deleteModal, clearCompletedModal].forEach(modal => closeModal(modal));
}

/* ==============================================================================
   9. Modern Toast Notification System
   ============================================================================== */

/**
 * Spawns a non-intrusive floating toast notification
 * @param {string} message - Message to display
 * @param {'success' | 'info' | 'danger'} type - Variant type
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
  } else if (type === 'danger') {
    iconSvg = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `;
  } else {
    iconSvg = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <span class="toast-message">${escapeHTML(message)}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }, 3200);
}

/* ==============================================================================
   10. Utility Functions
   ============================================================================== */

/**
 * Escapes unsafe HTML characters to prevent XSS attacks
 */
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates relative time string (e.g. "Just now", "2h ago", "Yesterday")
 */
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Recently';

  const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);

  if (elapsedSeconds < 60) return 'Just now';
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* Run initialization once DOM is ready */
document.addEventListener('DOMContentLoaded', initApp);
