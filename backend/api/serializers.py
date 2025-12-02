from rest_framework import serializers
from .models import Task, Employee, Comment

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'name', 'department']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'text', 'author', 'timestamp', 'author_id']
        read_only_fields = ['timestamp']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # 将snake_case转为camelCase,匹配前端
        return {
            'id': data['id'],
            'text': data['text'],
            'author': data['author'],
            'timestamp': data['timestamp'],
            'authorId': data['author_id'],
        }
    
    def to_internal_value(self, data):
        # 将camelCase转为snake_case
        converted_data = {
            'text': data.get('text'),
            'author': data.get('author'),
            'author_id': data.get('authorId'),
        }
        return super().to_internal_value(converted_data)
    
    
class TaskSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 
            'title', 
            'description', 
            'status', 
            'start_date', 
            'end_date', 
            'color', 
            'employee_id', 
            'tester_id', 
            'version',
            'comments',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # 将snake_case转为camelCase
        return {
            'id': data['id'],
            'title': data['title'],
            'description': data['description'],
            'status': data['status'],
            'startDate': data['start_date'],
            'endDate': data['end_date'],
            'color': data['color'],
            'employeeId': data['employee_id'],
            'testerId': data['tester_id'],
            'version': data['version'],
            'comments': data['comments'],
        }
    
    def to_internal_value(self, data):
        # 将camelCase转为snake_case
        converted_data = {
            'title': data.get('title'),
            'description': data.get('description'),
            'status': data.get('status'),
            'start_date': data.get('startDate'),
            'end_date': data.get('endDate'),
            'color': data.get('color', '#3b82f6'),
            'employee_id': data.get('employeeId'),
            'tester_id': data.get('testerId'),
            'version': data.get('version'),
        }
        return super().to_internal_value(converted_data)