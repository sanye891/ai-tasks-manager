 🌐 [English](README.md) | [中文](README_CN.md)
# AI 辅助的任务管理工具

一个简单而强大的Web应用程序，允许用户管理任务并利用AI自动分类任务和估计完成时间。

## 作者介绍
这是本人的第一个github项目，经验不是很熟练，还没有进行数据库链接，所以数据只能存在本地，以及重启后端后，数据就会消失。

## 功能特点

- 添加、编辑、删除任务
- 设置任务截止日期和优先级
- AI自动分类任务（工作、学习、生活等）
- AI智能推荐完成任务所需时间
- 按分类、优先级筛选任务
- 多种排序选项（创建时间、截止日期、优先级）

## 技术栈

- **前端**: HTML, CSS, JavaScript（原生，无框架）
- **后端**: Python Flask
- **AI**: 简单关键词匹配（先去open router去注册一个api key，然后输入到.env文件里面 OPENROUTER_API_KEY，就可以正常使用了）
- **数据存储**: 内存存储（可升级为SQLite）

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://your-repo-url/ai-task-manager.git
cd ai-task-manager
```

### 2. 设置Python虚拟环境

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
```

### 3. 安装依赖

```bash
cd backend
pip install -r requirements.txt
创建.env文件（YOUR_SITE_URL=http://localhost:5000，OPENROUTER_API_KEY）
```

### 4. 启动后端服务器

```bash
# 在backend目录中
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

MIT许可 # AI 辅助的任务管理工具

一个简单而强大的Web应用程序，允许用户管理任务并利用AI自动分类任务和估计完成时间。

## 作者介绍
这是本人的第一个github项目，经验不是很熟练，还没有进行数据库链接，所以数据只能存在本地，以及重启后端后，数据就会消失。

## 功能特点

- 添加、编辑、删除任务
- 设置任务截止日期和优先级
- AI自动分类任务（工作、学习、生活等）
- AI智能推荐完成任务所需时间
- 按分类、优先级筛选任务
- 多种排序选项（创建时间、截止日期、优先级）

## 技术栈

- **前端**: HTML, CSS, JavaScript（原生，无框架）
- **后端**: Python Flask
- **AI**: 简单关键词匹配（先去open router去注册一个api key，然后输入到.env文件里面 OPENROUTER_API_KEY，就可以正常使用了）
- **数据存储**: 内存存储（可升级为SQLite）

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://your-repo-url/ai-task-manager.git
cd ai-task-manager
```

### 2. 设置Python虚拟环境

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
```

### 3. 安装依赖

```bash
cd backend
pip install -r requirements.txt
创建.env文件（YOUR_SITE_URL=http://localhost:5000，OPENROUTER_API_KEY）
```

### 4. 启动后端服务器

```bash
# 在backend目录中
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