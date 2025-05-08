// 全局变量
let allTasks = []; // 存储所有任务
const API_BASE_URL = 'http://localhost:5000/api'; // API基础URL
let currentTaskId = null; // 当前正在编辑的任务ID

// 启动动画函数
function playSplashAnimation() {
    try {
        // 设置初始状态
        gsap.set('.app-container', { opacity: 0 });
        
        // 简单的启动动画时间轴
        const tl = gsap.timeline({
            onComplete: function() {
                endSplashScreen();
            }
        });
        
        // 图标动画
        tl.from('.splash-text i', {
            scale: 0,
            opacity: 0,
            rotation: 360,
            duration: 1,
            ease: "elastic.out(1, 0.6)"
        });
        
        // 标题动画
        tl.from('.splash-text h1', {
            y: -50,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out"
        }, "-=0.5");
        
        // 描述文字动画
        tl.from('.splash-text p', {
            y: 30,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out"
        }, "-=0.4");
        
        // 等待一段时间，然后自动结束
        tl.to({}, { duration: 1 });
        
        // 确保无论如何都会结束启动屏幕
        setTimeout(endSplashScreen, 5000);
    } catch (error) {
        console.error("启动动画错误:", error);
        // 如果有错误，直接结束启动屏幕
        endSplashScreen();
    }
}

// 结束启动屏幕，显示应用
function endSplashScreen() {
    const splashScreen = document.querySelector('.splash-screen');
    if (splashScreen && splashScreen.style.display !== 'none') {
        gsap.to(splashScreen, {
            opacity: 0,
            duration: 0.5,
            onComplete: function() {
                splashScreen.style.display = 'none';
                gsap.to('.app-container', {
                    opacity: 1,
                    duration: 0.5
                });
            }
        });
    } else {
        // 确保应用是可见的
        gsap.to('.app-container', {
            opacity: 1,
            duration: 0.5
        });
    }
}

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 播放启动动画
    playSplashAnimation();
    
    // 初始化加载任务
    fetchTasks();
    
    // 打开新建任务模态框
    document.getElementById('add-new-task-btn').addEventListener('click', () => {
        openTaskModal('add');
    });
    
    // 任务表单提交事件
    document.getElementById('task-form').addEventListener('submit', handleTaskFormSubmit);
    
    // 获取AI建议按钮点击事件
    document.getElementById('ai-suggest-button').addEventListener('click', getAISuggestions);
    
    // 筛选和排序事件
    document.getElementById('filter-category').addEventListener('change', applyFilters);
    document.getElementById('filter-priority').addEventListener('change', applyFilters);
    document.getElementById('sort-by').addEventListener('change', applyFilters);
    
    // 关闭模态框的点击事件
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModals();
        });
    });
    
    // 点击模态框外部关闭模态框
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // 删除确认
    document.getElementById('confirm-delete').addEventListener('click', executeDeleteTask);
    document.getElementById('cancel-delete').addEventListener('click', () => {
        closeModals();
    });
});

/**
 * 从API获取所有任务
 */
async function fetchTasks() {
    try {
        // 显示加载状态
        document.getElementById('tasks-container').innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 正在加载任务...</div>';
        
        // 发起API请求
        const response = await fetch(`${API_BASE_URL}/tasks`);
        
        // 检查HTTP响应状态
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        
        // 解析JSON响应
        const data = await response.json();
        
        // 更新全局任务数组
        allTasks = data;
        
        // 更新任务计数
        document.getElementById('task-count').textContent = allTasks.length;
        
        // 渲染任务列表
        renderTasks(allTasks);
    } catch (error) {
        // 显示错误消息
        console.error('获取任务失败:', error);
        document.getElementById('tasks-container').innerHTML = 
            `<div class="no-tasks"><i class="fas fa-exclamation-circle"></i> 加载任务失败: ${error.message}</div>`;
        showNotification('获取任务失败，请检查网络连接或服务器状态', 'error');
    }
}

/**
 * 渲染任务列表到页面
 * @param {Array} tasks - 要显示的任务数组
 */
function renderTasks(tasks) {
    const container = document.getElementById('tasks-container');
    
    // 如果没有任务，显示提示信息
    if (tasks.length === 0) {
        container.innerHTML = '<div class="no-tasks"><i class="fas fa-clipboard-list"></i><br>暂无任务，添加一个新任务吧！</div>';
        return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 遍历任务并创建DOM元素
    tasks.forEach((task, index) => {
        // 创建任务项容器
        const taskElement = document.createElement('div');
        taskElement.className = `task-item priority-${task.priority}`;
        taskElement.dataset.id = task.id; // 添加data-id属性
        taskElement.style.opacity = 0;
        taskElement.style.transform = 'translateY(20px)';
        
        if (task.status === '完成') {
            taskElement.classList.add('completed');
        }
        
        // 格式化日期
        const createdDate = new Date(task.created_at).toLocaleString('zh-CN');
        let dueDate = '无截止日期';
        let dueDateHTML = '';
        
        if (task.due_date) {
            const date = new Date(task.due_date);
            dueDate = date.toLocaleString('zh-CN');
            
            // 计算剩余时间
            const now = new Date();
            const diffTime = date - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let dateClass = '';
            let dateIcon = 'far fa-calendar-alt';
            
            if (diffDays < 0) {
                dateClass = 'overdue';
                dateIcon = 'fas fa-exclamation-circle';
            } else if (diffDays === 0) {
                dateClass = 'today';
                dateIcon = 'fas fa-clock';
            }
            
            dueDateHTML = `<div class="task-due-date ${dateClass}"><i class="${dateIcon}"></i> 截止时间: ${dueDate}</div>`;
        } else {
            // 无截止时间时输出透明占位
            dueDateHTML = '<div class="task-due-date placeholder"></div>';
        }
        
        // 确定优先级样式
        let priorityClass = '';
        let priorityText = '';
        
        switch(task.priority) {
            case '高':
                priorityClass = 'high';
                priorityText = '高优先级';
                break;
            case '中':
                priorityClass = 'medium';
                priorityText = '中优先级';
                break;
            case '低':
                priorityClass = 'low';
                priorityText = '低优先级';
                break;
        }
        
        // 添加任务内容
        taskElement.innerHTML = `
            <div class="task-description">${task.description}</div>
            
            ${dueDateHTML}
            
            <div class="task-meta">
                <span class="task-tag task-category"><i class="fas fa-tag"></i> ${task.category}</span>
                <span class="task-tag task-priority ${priorityClass}"><i class="fas fa-flag"></i> ${priorityText}</span>
                <span class="task-tag task-time"><i class="far fa-clock"></i> ${task.estimated_time}</span>
            </div>
            
            <div class="task-actions">
                <button class="task-btn complete-btn ${task.status === '完成' ? 'completed' : ''}" data-id="${task.id}">
                    <i class="fas ${task.status === '完成' ? 'fa-times' : 'fa-check'}"></i>
                    ${task.status === '完成' ? '取消完成' : '标记完成'}
                </button>
                <button class="task-btn edit-btn" data-id="${task.id}">
                    <i class="fas fa-edit"></i> 编辑
                </button>
                <button class="task-btn delete-btn" data-id="${task.id}">
                    <i class="fas fa-trash-alt"></i> 删除
                </button>
            </div>
        `;
        
        // 添加任务元素到容器
        container.appendChild(taskElement);
        
        // 为新添加的按钮绑定事件
        taskElement.querySelector('.complete-btn').addEventListener('click', toggleTaskCompletion);
        taskElement.querySelector('.edit-btn').addEventListener('click', (e) => {
            const taskId = e.currentTarget.getAttribute('data-id');
            openTaskModal('edit', taskId);
        });
        taskElement.querySelector('.delete-btn').addEventListener('click', (e) => {
            const taskId = e.currentTarget.getAttribute('data-id');
            openDeleteConfirmModal(taskId);
        });
        
        // 添加动画效果
        gsap.to(taskElement, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.05 * index,
            ease: "power1.out"
        });
    });
}

/**
 * 打开任务模态框（添加或编辑）
 * @param {string} mode - 'add'表示添加新任务，'edit'表示编辑现有任务
 * @param {string} taskId - 编辑模式下的任务ID
 */
function openTaskModal(mode, taskId = null) {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const title = document.getElementById('modal-title');
    const submitButtonText = document.getElementById('submit-button-text');
    const statusField = document.getElementById('status-field');
    
    // 重置表单
    form.reset();
    
    if (mode === 'add') {
        // 添加模式
        title.textContent = '添加新任务';
        submitButtonText.textContent = '添加任务';
        statusField.style.display = 'none';
        currentTaskId = null;
    } else if (mode === 'edit' && taskId) {
        // 编辑模式
        title.textContent = '编辑任务';
        submitButtonText.textContent = '保存修改';
        statusField.style.display = 'block';
        currentTaskId = taskId;
        
        // 查找任务并填充表单
        const task = allTasks.find(t => t.id === taskId);
        if (task) {
            fillTaskForm(task);
        } else {
            showNotification('找不到要编辑的任务', 'error');
            return;
        }
    }
    
    // 显示模态框
    modal.style.display = 'block';
    
    // 添加模态框打开动画
    const modalContent = modal.querySelector('.modal-content');
    gsap.fromTo(modalContent, 
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
    );
    
    // 确保模态框始终居中显示
    setTimeout(() => {
        if (modal.style.display === 'block') {
            modal.style.display = 'block';
        }
    }, 10);
}

/**
 * 填充任务表单
 * @param {Object} task - 要编辑的任务对象
 */
function fillTaskForm(task) {
    document.getElementById('task-description').value = task.description;
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-category').value = task.category;
    document.getElementById('task-estimated-time').value = task.estimated_time;
    
    // 设置优先级单选按钮
    const priorityRadio = document.querySelector(`input[name="priority"][value="${task.priority}"]`);
    if (priorityRadio) {
        priorityRadio.checked = true;
    }
    
    // 如果有截止日期，需要格式化为HTML datetime-local支持的格式
    if (task.due_date) {
        // 示例格式: 2023-10-31T15:30
        const date = new Date(task.due_date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        document.getElementById('task-due-date').value = `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
        document.getElementById('task-due-date').value = '';
    }
}

/**
 * 关闭所有模态框
 */
function closeModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        if (modal.style.display === 'block') {
            const modalContent = modal.querySelector('.modal-content');
            
            // 添加关闭动画
            gsap.to(modalContent, {
                opacity: 0,
                y: 20,
                duration: 0.2,
                onComplete: () => {
                    modal.style.display = 'none';
                    // 重置样式以便下次打开
                    gsap.set(modalContent, { opacity: 1, y: 0 });
                }
            });
        } else {
            modal.style.display = 'none';
        }
    });
}

/**
 * 打开删除确认模态框
 * @param {string} taskId - 要删除的任务ID
 */
function openDeleteConfirmModal(taskId) {
    currentTaskId = taskId;
    const confirmModal = document.getElementById('confirm-modal');
    confirmModal.style.display = 'block';
    
    // 添加模态框打开动画
    const modalContent = confirmModal.querySelector('.modal-content');
    gsap.fromTo(modalContent, 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
    );
    
    // 确保模态框始终居中显示
    setTimeout(() => {
        if (confirmModal.style.display === 'block') {
            confirmModal.style.display = 'block';
        }
    }, 10);
}

// 添加一个变量来跟踪表单提交状态
let isSubmitting = false;

/**
 * 处理任务表单提交
 * @param {Event} e - 表单提交事件
 */
async function handleTaskFormSubmit(e) {
    e.preventDefault();
    
    // 如果正在提交中，直接返回
    if (isSubmitting) {
        return;
    }
    
    // 设置提交状态
    isSubmitting = true;
    
    // 禁用提交按钮
    const submitButton = document.getElementById('submit-task-button');
    submitButton.disabled = true;
    
    try {
        // 获取表单数据
        const description = document.getElementById('task-description').value.trim();
        const dueDate = document.getElementById('task-due-date').value;
        const priorityRadio = document.querySelector('input[name="priority"]:checked');
        const priority = priorityRadio ? priorityRadio.value : '中';
        const category = document.getElementById('task-category').value;
        const estimatedTime = document.getElementById('task-estimated-time').value;
        
        // 简单验证
        if (!description) {
            showNotification('任务描述不能为空', 'error');
            return;
        }
        
        // 构建请求数据
        const taskData = {
            description,
            priority,
            category,
            estimated_time: estimatedTime
        };
        
        // 如果设置了截止日期，添加到数据中
        if (dueDate) {
            taskData.due_date = dueDate;
        }
        
        // 如果是编辑模式，添加状态字段
        if (currentTaskId) {
            taskData.status = document.getElementById('task-status').value;
        }
        
        let response;
        let successMessage;
        
        if (currentTaskId) {
            // 编辑任务 - 发送PUT请求
            response = await fetch(`${API_BASE_URL}/tasks/${currentTaskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
            successMessage = '任务更新成功';
        } else {
            // 添加任务 - 发送POST请求
            response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
            successMessage = '任务添加成功';
        }
        
        // 检查响应状态
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        
        // 解析响应数据
        const responseData = await response.json();
        
        if (currentTaskId) {
            // 更新本地任务列表
            allTasks = allTasks.map(task => {
                if (task.id === currentTaskId) {
                    return responseData;
                }
                return task;
            });
        } else {
            // 添加到本地任务列表
            allTasks.push(responseData);
        }
        
        // 更新任务计数
        document.getElementById('task-count').textContent = allTasks.length;
        
        // 重新渲染任务列表
        renderTasks(allTasks);
        
        // 如果是新添加的任务，添加特殊动画效果
        if (!currentTaskId) {
            // 给一点时间让DOM更新
            setTimeout(() => {
                const newTaskElement = document.querySelector(`.task-item[data-id="${responseData.id}"]`);
                if (newTaskElement) {
                    // 添加强调动画
                    gsap.fromTo(newTaskElement, 
                        { boxShadow: '0 0 0 4px rgba(58, 123, 253, 0.6)' },
                        { 
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', 
                            duration: 1.5,
                            ease: 'power2.out'
                        }
                    );
                }
            }, 300);
        }
        
        // 关闭模态框
        closeModals();
        
        // 显示成功消息
        showNotification(successMessage, 'success');
    } catch (error) {
        console.error('操作失败:', error);
        showNotification('操作失败: ' + error.message, 'error');
    } finally {
        // 重置提交状态
        isSubmitting = false;
        // 重新启用提交按钮
        submitButton.disabled = false;
    }
}

/**
 * 切换任务完成状态
 * @param {Event} e - 点击事件
 */
async function toggleTaskCompletion(e) {
    const taskId = e.currentTarget.getAttribute('data-id');
    const task = allTasks.find(t => t.id === taskId);
    
    if (!task) {
        showNotification('未找到任务', 'error');
        return;
    }
    
    // 切换状态
    const newStatus = task.status === '完成' ? '待办' : '完成';
    
    try {
        // 发送PUT请求
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        // 检查响应状态
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        
        // 解析响应数据
        const responseData = await response.json();
        
        // 更新本地任务列表
        allTasks = allTasks.map(task => {
            if (task.id === taskId) {
                return responseData;
            }
            return task;
        });
        
        // 重新渲染任务列表
        renderTasks(allTasks);
        
        // 显示成功消息
        showNotification('任务状态更新成功', 'success');
    } catch (error) {
        console.error('操作失败:', error);
        showNotification('操作失败: ' + error.message, 'error');
    }
}

/**
 * 执行删除任务操作
 */
async function executeDeleteTask() {
    if (!currentTaskId) {
        closeModals();
        return;
    }
    
    try {
        // 查找要删除的任务元素
        const taskElement = document.querySelector(`.task-item[data-id="${currentTaskId}"]`);
        
        if (taskElement) {
            // 添加删除动画
            gsap.to(taskElement, {
                opacity: 0,
                x: 100,
                height: 0,
                marginBottom: 0,
                padding: 0,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                    if (taskElement.parentNode) {
                        taskElement.parentNode.removeChild(taskElement);
                    }
                }
            });
        }
        
        // 发送DELETE请求
        const response = await fetch(`${API_BASE_URL}/tasks/${currentTaskId}`, {
            method: 'DELETE'
        });
        
        // 检查响应状态
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        
        // 从本地任务列表中移除
        allTasks = allTasks.filter(task => task.id !== currentTaskId);
        
        // 更新任务计数
        document.getElementById('task-count').textContent = allTasks.length;
        
        // 如果没有更多任务，显示空状态
        if (allTasks.length === 0) {
            setTimeout(() => {
                renderTasks([]);
            }, 500);
        }
        
        // 关闭模态框
        closeModals();
        
        // 显示成功消息
        showNotification('任务已成功删除', 'success');
    } catch (error) {
        console.error('删除任务失败:', error);
        showNotification('删除任务失败: ' + error.message, 'error');
    }
}

// 添加防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 添加自动获取AI建议的功能
document.getElementById('task-description').addEventListener('input', debounce(async function(e) {
    const description = e.target.value.trim();
    if (description.length > 10) {  // 只有当描述长度超过10个字符时才自动获取建议
        await getAISuggestions();
    }
}, 1000));  // 1秒的防抖延迟

/**
 * 获取AI建议
 */
async function getAISuggestions() {
    try {
        // 获取当前任务描述
        const description = document.getElementById('task-description').value.trim();
        
        if (!description) {
            showNotification('请先输入任务描述', 'warning');
            return;
        }
        
        // 显示加载状态
        const suggestButton = document.getElementById('ai-suggest-button');
        const originalText = suggestButton.innerHTML;
        suggestButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在获取建议...';
        suggestButton.disabled = true;
        
        // 获取AI建议（分类和时间估计）
        const response = await fetch(`${API_BASE_URL}/tasks/suggest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 更新表单字段
        document.getElementById('task-category').value = data.category;
        document.getElementById('task-estimated-time').value = data.estimated_time;
        
        // 恢复按钮状态
        suggestButton.innerHTML = originalText;
        suggestButton.disabled = false;
        
        // 显示成功消息
        showNotification('AI建议已应用', 'success');
        
    } catch (error) {
        // 显示错误消息
        console.error('获取AI建议失败:', error);
        showNotification('获取AI建议失败: ' + error.message, 'error');
        
        // 恢复按钮状态
        const suggestButton = document.getElementById('ai-suggest-button');
        suggestButton.innerHTML = '<i class="fas fa-robot"></i> 获取AI建议';
        suggestButton.disabled = false;
    }
}

/**
 * 应用过滤和排序
 * @param {Event} e - 事件对象
 */
function applyFilters(e) {
    e.preventDefault();
    
    const filterCategory = document.getElementById('filter-category').value;
    const filterPriority = document.getElementById('filter-priority').value;
    const sortBy = document.getElementById('sort-by').value;
    
    let filteredTasks = [...allTasks];  // 创建任务数组的副本
    
    // 只有当筛选值不是"all"时才应用筛选
    if (filterCategory && filterCategory !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === filterCategory);
    }
    
    if (filterPriority && filterPriority !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
    }
    
    if (sortBy) {
        filteredTasks = filteredTasks.sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityOrder = { '高': 3, '中': 2, '低': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            } else if (sortBy === 'dueDate') {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            } else if (sortBy === 'estimatedTime') {
                return a.estimated_time.localeCompare(b.estimated_time);
            }
            return 0;
        });
    }
    
    renderTasks(filteredTasks);
}

/**
 * 显示通知消息
 * @param {string} message - 要显示的消息
 * @param {string} type - 消息类型 (success, error, info, warning)
 */
function showNotification(message, type = 'success') {
    // 图标匹配
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'info':
            icon = '<i class="fas fa-info-circle"></i>';
            break;
    }
    
    // 检查是否已存在通知元素
    let notification = document.querySelector('.notification');
    
    // 如果存在，先移除之前的通知
    if (notification) {
        // 如果有正在显示的通知，先移除它
        gsap.to(notification, {
            x: 400,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                createAndShowNotification();
            }
        });
    } else {
        createAndShowNotification();
    }
    
    // 创建并显示新通知
    function createAndShowNotification() {
        notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `${icon} ${message}`;
        document.body.appendChild(notification);
        
        // 使用GSAP添加动画
        gsap.fromTo(notification, 
            { x: 400, opacity: 0 },
            { 
                x: 0, 
                opacity: 1, 
                duration: 0.5, 
                ease: "power2.out",
                onComplete: () => {
                    // 3秒后自动消失
                    gsap.to(notification, {
                        x: 400,
                        opacity: 0,
                        delay: 3,
                        duration: 0.5,
                        ease: "power2.in",
                        onComplete: () => {
                            if (notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        }
                    });
                }
            }
        );
    }
}