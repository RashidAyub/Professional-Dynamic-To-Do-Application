# TaskFlow – Professional Dynamic To-Do Application

A modern, responsive, and aesthetic **Dynamic To-Do Dashboard Application** built with semantic **HTML5**, modern **CSS3**, and pure **Vanilla JavaScript**. Designed and developed for the **Frontend Developer Internship** (Task 3).

![TaskFlow Preview](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🌟 Key Features

- **Full Task Lifecycle (CRUD):**
  - Add tasks with a mandatory title, optional description, and priority level (**Low**, **Medium**, **High**).
  - Edit existing tasks in place via a sleek modal dialog.
  - Mark tasks as completed or pending with animated checkboxes.
  - Delete individual tasks with custom confirmation dialogs.
  - Bulk action to clear all completed tasks.
- **Analytics & Real-time Metrics:**
  - Live counter cards for **Total Tasks**, **Pending Tasks**, and **Completed Tasks**.
  - Dynamic completion percentage progress bar.
- **Filtering & Search:**
  - Filter tasks quickly by **All**, **Active**, and **Completed** with live count badges.
  - Real-time search bar that filters tasks across both titles and descriptions.
  - Sorting options: *Newest First*, *Oldest First*, *By Priority*, and *Alphabetical (A-Z)*.
- **Data Persistence (LocalStorage):**
  - All tasks, completion statuses, priorities, and descriptions are stored persistently in the browser's `localStorage`.
  - Data remains intact across page refreshes and browser restarts.
- **Design & UI/UX Excellence:**
  - Modern light dashboard theme with soft background gradients and purple/indigo accents.
  - Professional typography using Google Font **Plus Jakarta Sans**.
  - Smooth micro-animations, hover effects, and feedback toasts.
  - Responsive design optimized for desktop, tablet, and mobile screens.
  - Accessible forms and keyboard shortcuts (`Enter` to submit, `/` to focus search, `Esc` to close modals).

---

## 📁 Project Structure

```text
├── index.html     # Semantic HTML5 structure, SVGs, and modal templates
├── style.css      # Design tokens, light theme, animations, and media queries
├── script.js      # Application state, CRUD operations, and LocalStorage logic
└── README.md      # Project documentation and setup guide
```

---

## 🚀 Getting Started

No build tools or external package dependencies required.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RashidAyub/Professional-Dynamic-To-Do-Application.git
   cd Professional-Dynamic-To-Do-Application
   ```

2. **Open the application:**
   - Simply double-click `index.html` to open it in any web browser.
   - Or run a local development server using VS Code's **Live Server** extension.

---

## 🛠️ Technologies Used

- **HTML5:** Semantic markup, accessibility attributes (`aria-*`), and modern form controls.
- **CSS3:** Custom properties (CSS variables), Flexbox, CSS Grid, keyframe animations, and media queries.
- **JavaScript (ES6+):** Pure Vanilla JavaScript, DOM manipulation, event delegation, and Web Storage API (`localStorage`).

---

## 📄 License

This project was developed for educational and internship demonstration purposes.
