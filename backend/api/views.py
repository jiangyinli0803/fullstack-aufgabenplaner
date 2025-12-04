
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

    @action(detail=False, methods=['get'])   # /api/tasks/by_status/?status=offen
    def by_status(self, request):
        """按状态分组返回任务"""
        status = request.query_params.get('status')
        if status:
            tasks = self.queryset.filter(status=status)
            serializer = self.get_serializer(tasks, many=True)
            return Response(serializer.data)
        return Response({'error': 'Status parameter required'}, status=400)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        task_id = self.request.query_params.get('task_id')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        return queryset