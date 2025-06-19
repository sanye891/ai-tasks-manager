 🌐 [English](README.md) | [中文](README_CN.md)
# AI-powered Task Manager

A simple yet powerful web application that allows users to manage tasks, automatically categorize them with AI, and estimate completion time.

## About the Author
This is my first GitHub project. I am not very experienced yet, and there is no database connection for now, so data is only stored in memory. After restarting the backend, all data will be lost.

## Features

- Add, edit, and delete tasks
- Set task deadlines and priorities
- AI auto-categorization (work, study, life, etc.)
- AI smart recommendation for estimated completion time
- Filter tasks by category and priority
- Multiple sorting options (creation time, deadline, priority)

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla, no framework)
- **Backend**: Python Flask
- **AI**: Simple keyword matching (register an API key at openrouter, then put it in the .env file as OPENROUTER_API_KEY)
- **Data Storage**: In-memory (can be upgraded to SQLite)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/sanye891/ai-tasks-manager.git
cd ai-task-manager
```

### 2. Set up Python virtual environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
```

### 3. Install dependencies

```bash
cd backend
pip install -r requirements.txt
Create a .env file (YOUR_SITE_URL=http://localhost:5000, OPENROUTER_API_KEY)
```

### 4. Start the backend server

```bash
# In the backend directory
python app.py
```

The server will run at http://localhost:5000

### 5. Open the frontend page

Open `frontend/index.html` directly in your browser.

## Usage

1. Fill in the task description in the form
2. Optionally set a deadline and priority
3. Click the "Get AI Suggestion" button to automatically get task category and estimated time
4. Click the "Add Task" button to submit the task
5. Use filter and sort options to manage the task list
6. Click the buttons on each task to mark as complete, edit, or delete

## Contribution

Issues and suggestions are welcome!

## License

MIT License
