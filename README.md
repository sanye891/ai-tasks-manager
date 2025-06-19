 🌐 [English](README.md) | [中文](README.zh-CN.md)
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

服务器将在 http://localhost:5000 运行

### 5. 打开前端页面

直接在浏览器中打开 `frontend/index.html` 文件



## 使用说明

1. 在表单中填写任务描述
2. 可选填写截止日期和选择优先级
3. 点击"获取AI建议"按钮自动获取任务分类和预估时间建议
4. 点击"添加任务"按钮提交任务
5. 使用筛选和排序选项管理任务列表
6. 点击任务上的按钮标记完成、编辑或删除任务



## 贡献

欢迎提交问题和改进建议！

## 许可

MIT许可 