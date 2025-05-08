#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import re
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

# 加载环境变量
load_dotenv()

# 初始化OpenAI客户端
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

# 如果找不到OPENROUTER_API_KEY环境变量，则打印提示信息
if not os.getenv("OPENROUTER_API_KEY"):
    print("警告: 未找到OPENROUTER_API_KEY环境变量。请确保.env文件存在并包含此变量。")

# 简单关键词匹配的分类规则
CATEGORY_RULES = [
    (r'工作|会议|项目|报告|客户|提案|演示|计划|邮件|文档|办公', '工作'),
    (r'学习|读书|课程|培训|学校|考试|论文|研究|笔记|知识|教育|查询|搜索', '学习'),
    (r'购物|买|订购|商店|超市|网购|电商|支付|价格|优惠|打折', '购物'),
    (r'锻炼|健身|跑步|瑜伽|游泳|健康|运动|步行|训练|体育', '锻炼'),
    (r'家庭|孩子|父母|亲戚|家人|朋友|聚会|约会|社交|拜访', '生活'),
    # 默认分类为"其他"
]

# 简单关键词匹配的时间估计规则
TIME_RULES = [
    (r'快速|简单|速度|立即|马上|短|少', '15分钟'),
    (r'电话|邮件|消息|提醒|回复|检查', '30分钟'),
    (r'准备|整理|收集|汇总|分析|讨论|会议|面试', '1小时'),
    (r'报告|文档|计划|设计|研究|学习|阅读|长|多|详细|复杂', '2小时'),
    (r'项目|开发|编写|创建|完成|实现|制作', '4小时'),
    # 默认时间估计为"30分钟"
]

# 添加缓存字典
task_suggestion_cache = {}

def get_ai_suggestions(description):
    """
    使用AI同时获取任务分类和时间估计
    
    Args:
        description (str): 任务描述文本
        
    Returns:
        tuple: (category, estimated_time)
    """
    # 检查缓存
    cache_key = description.lower().strip()
    if cache_key in task_suggestion_cache:
        return task_suggestion_cache[cache_key]
    
    # 如果没有API密钥，使用规则匹配
    if not os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENROUTER_API_KEY") == "your_api_key_here":
        print("未找到有效的API密钥，使用规则匹配")
        return (
            categorize_task_by_rules(description),
            estimate_time_by_rules(description)
        )
    
    try:
        # 构建优化的提示词
        prompt = f"""请分析以下任务描述，并给出两个建议：
1. 任务分类（从以下选项中选择一个：工作、学习、生活、锻炼、购物、其他）
2. 预估完成时间（格式：XX分钟 或 XX小时）

请按以下格式返回：
分类：XXX
时间：XXX

任务描述：{description}"""
        
        # 调用API
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": os.getenv("YOUR_SITE_URL", "http://localhost:5000"),
                "X-Title": os.getenv("YOUR_SITE_NAME", "AI Task Manager"),
            },
            model="deepseek/deepseek-chat-v3-0324:free",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        # 解析响应
        response = completion.choices[0].message.content.strip()
        
        # 提取分类和时间
        category_match = re.search(r'分类：(.+)', response)
        time_match = re.search(r'时间：(.+)', response)
        
        if category_match and time_match:
            category = category_match.group(1).strip()
            time_estimate = time_match.group(1).strip()
            
            # 验证分类
            valid_categories = ['工作', '学习', '生活', '锻炼', '购物', '其他']
            if category not in valid_categories:
                category = categorize_task_by_rules(description)
            
            # 验证时间格式
            if not re.match(r'^[0-9]+(分钟|小时)$', time_estimate):
                time_estimate = estimate_time_by_rules(description)
            
            # 缓存结果
            task_suggestion_cache[cache_key] = (category, time_estimate)
            return category, time_estimate
        else:
            # 如果解析失败，使用规则匹配
            return (
                categorize_task_by_rules(description),
                estimate_time_by_rules(description)
            )
            
    except Exception as e:
        print(f"AI建议失败: {e}")
        # 出错时使用规则匹配
        return (
            categorize_task_by_rules(description),
            estimate_time_by_rules(description)
        )

def categorize_task_with_ai(description):
    """
    使用AI获取任务分类
    """
    category, _ = get_ai_suggestions(description)
    return category

def estimate_time_with_ai(description):
    """
    使用AI获取时间估计
    """
    _, time_estimate = get_ai_suggestions(description)
    return time_estimate

def categorize_task_by_rules(description):
    """
    使用简单的关键词规则对任务描述进行分类
    
    Args:
        description (str): 任务描述文本
        
    Returns:
        str: 推荐的任务分类
    """
    # 将描述转换为小写以进行不区分大小写的匹配
    description_lower = description.lower()
    
    # 遍历规则并检查匹配
    for pattern, category in CATEGORY_RULES:
        if re.search(pattern, description_lower):
            return category
    
    # 如果没有匹配的规则，返回默认分类
    return '其他'

def estimate_time_by_rules(description):
    """
    使用简单的关键词规则估计任务完成时间
    
    Args:
        description (str): 任务描述文本
        
    Returns:
        str: 推荐的任务完成时间
    """
    # 将描述转换为小写以进行不区分大小写的匹配
    description_lower = description.lower()
    
    # 遍历规则并检查匹配
    for pattern, time in TIME_RULES:
        if re.search(pattern, description_lower):
            return time
    
    # 如果没有匹配的规则，返回默认时间
    return '30分钟'

