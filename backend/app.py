#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid
from datetime import datetime, timedelta
from utils import (
    categorize_task_by_rules, 
    estimate_time_by_rules,
    categorize_task_with_ai,
    estimate_time_with_ai,
    get_ai_suggestions
)

# 创建Flask应用实例
app = Flask(__name__)
# 配置CORS，允许前端页面发送跨域请求
CORS(app)

# 内存中的任务列表（临时存储）
tasks = []

# 定义任务分类列表
categories = ['工作', '学习', '生活', '锻炼', '购物', '其他']

# 首页路由 - 测试服务器是否正常运行
@app.route('/')
def home():
    return "AI 辅助的任务管理工具 API 运行正常!"

# 获取所有任务
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """
    返回所有任务的列表
    """
    return jsonify(tasks)

# 添加新任务
@app.route('/api/tasks', methods=['POST'])
def add_task():
    """
    添加新任务到列表中
    请求体应包含任务描述、截止日期(可选)、优先级(可选)
    自动生成唯一ID和创建时间
    """
    # 从请求中获取数据
    data = request.get_json()
    
    # 提取任务信息，使用get方法设置默认值
    description = data.get('description', '')
    due_date = data.get('due_date', None)
    priority = data.get('priority', '中')  # 默认优先级为'中'
    
    # 使用用户提供的分类和时间估计，如果没有提供，则使用AI功能
    category = data.get('category', None)
    if category is None or category == '其他':
        # 使用AI分类
        category = categorize_task_with_ai(description)
    
    estimated_time = data.get('estimated_time', None)
    if estimated_time is None:
        # 使用AI时间估计
        estimated_time = estimate_time_with_ai(description)
    
    # 创建新任务对象
    new_task = {
        'id': str(uuid.uuid4()),  # 生成唯一ID
        'description': description,
        'created_at': datetime.now().isoformat(),  # ISO格式的创建时间
        'due_date': due_date,
        'priority': priority,
        'status': '待办',  # 新任务默认状态为'待办'
        'category': category,
        'estimated_time': estimated_time
    }
    
    # 添加到任务列表
    tasks.append(new_task)
    
    # 返回新创建的任务
    return jsonify(new_task), 201  # HTTP 201表示资源已创建

# 更新任务
@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    """
    更新指定ID的任务
    可以更新描述、截止日期、优先级、状态等
    """
    # 获取请求数据
    data = request.get_json()
    
    # 查找任务
    for task in tasks:
        if task['id'] == task_id:
            # 如果描述更新了，可能需要重新分类和估计时间
            if 'description' in data and data['description'] != task['description']:
                # 除非用户明确提供了分类和时间，否则重新计算
                if 'category' not in data:
                    data['category'] = categorize_task_with_ai(data['description'])
                if 'estimated_time' not in data:
                    data['estimated_time'] = estimate_time_with_ai(data['description'])
            
            # 只更新请求中包含的字段
            for key in data:
                if key in task and key != 'id' and key != 'created_at':  # 不允许修改ID和创建时间
                    task[key] = data[key]
            return jsonify(task)
    
    # 如果找不到任务，返回404错误
    return jsonify({'error': '找不到指定ID的任务'}), 404

# 删除任务
@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    """
    删除指定ID的任务
    """
    global tasks
    # 查找任务
    for i, task in enumerate(tasks):
        if task['id'] == task_id:
            # 删除任务
            tasks.pop(i)
            return jsonify({'message': '任务已删除'})
    
    # 如果找不到任务，返回404错误
    return jsonify({'error': '找不到指定ID的任务'}), 404

# 获取所有任务分类
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """
    返回所有预定义的任务分类
    """
    return jsonify(categories)

# AI任务分类
@app.route('/api/tasks/categorize', methods=['POST'])
def categorize_task():
    """
    根据任务描述推荐分类
    """
    data = request.get_json()
    description = data.get('description', '')
    
    # 使用AI进行分类
    category = categorize_task_with_ai(description)
    
    return jsonify({'category': category})

# AI时间估计
@app.route('/api/tasks/estimate_time', methods=['POST'])
def estimate_time():
    """
    根据任务描述推荐所需时间
    """
    data = request.get_json()
    description = data.get('description', '')
    
    # 使用AI进行时间估计
    time = estimate_time_with_ai(description)
    
    return jsonify({'estimated_time': time})

# AI任务建议
@app.route('/api/tasks/suggest', methods=['POST'])
def suggest_task():
    """
    根据任务描述同时获取分类和时间估计建议
    """
    data = request.get_json()
    description = data.get('description', '')
    
    # 使用AI获取建议
    category, estimated_time = get_ai_suggestions(description)
    
    return jsonify({
        'category': category,
        'estimated_time': estimated_time
    })

# 启动应用
if __name__ == '__main__':

    
    # 启动Flask应用
    app.run(debug=True, port=5000) 