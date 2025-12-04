from rest_framework import serializers
from .models import Task, Employee, Comment

class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()  # 使用定义的 property
    class Meta:
        model = Employee
        fields = ['id', 'firstname', 'lastname', 'full_name', 'role', 'department', 'is_active']

class CommentSerializer(serializers.ModelSerializer):
# 方法：使用库自动转换 - 全部用 snake_case
    task_title = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'task_title', 'text', 'author_name', 'is_edited', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_task_title(self, obj):     # 方法名：snake_case
        return obj.task.title

    def get_author_name(self, obj):    # 方法名：snake_case
        return obj.author.full_name if obj.author else "Unbekannt" 
    
        
class TaskSerializer(serializers.ModelSerializer):
    # 嵌套序列化 - 读取时返回完整对象
    employee = EmployeeSerializer(read_only=True)  # 用于读取（GET）
    tester = EmployeeSerializer(read_only=True)
    created_by = EmployeeSerializer(read_only=True)
    updated_by = EmployeeSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    # 写入时只接收 ID
    employee_id = serializers.IntegerField(write_only=True, required=False, allow_null=True) # 用于写入（POST/PUT/PATCH）
    tester_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    created_by_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    updated_by_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # 计算属性字段
    status_color = serializers.CharField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 
            'title', 
            'description', 
            'status',
            'priority', 
            'start_date', 
            'end_date',             
            'employee',
            'employee_id',
            'tester', 
            'tester_id',
            'created_by',
            'created_by_id',
            'updated_by',
            'updated_by_id',
            'version',
            'comments',
            'status_color',
            'is_overdue',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at','status_color', 'is_overdue']
    
    