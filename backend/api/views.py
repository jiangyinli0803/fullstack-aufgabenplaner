
from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response

from rest_framework import viewsets, filters
from .models import Task, Employee, Comment
from .serializers import TaskSerializer, EmployeeSerializer, CommentSerializer



class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()   #没有 queryset → Router 不知道 URL 名, 所以在urls.py使用 basename
    serializer_class = EmployeeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['firstname', 'lastname', 'department']
    ordering_fields = ['lastname', 'firstname', 'role']


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]   
    search_fields = ['title', 'department', 'employee']
    ordering_fields = ['created_at', 'start_date', 'priority']
    ordering = ['-created_at']  # 默认排序

    # 可选：支持前端通过 URL 参数过滤
    def get_queryset(self):
        queryset = Task.objects.all()
        
        # 支持 ?status=open
        status = self.request.query_params.get('status', None)
        department = self.request.query_params.get('department', None)
        if status:
            queryset = queryset.filter(status=status)
        if department:
            queryset = queryset.filter(department=department)            
        return queryset

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        task_id = self.request.query_params.get('task_id')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        return queryset