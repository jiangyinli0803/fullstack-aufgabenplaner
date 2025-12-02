from django.contrib import admin
from .models import Task, Employee, Comment
# Register your models here.

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'created_at']
    search_fields = ['name', 'department']
    list_filter = ['department', 'created_at']
    ordering = ['name']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'description','start_date', 'end_date', 'employee_id', 'version', 'created_at']
    search_fields = ['title']
    list_filter = ['status', 'start_date', 'end_date', 'created_at']
    list_editable = ['status']  # 可以在列表页直接修改状态
    date_hierarchy = 'start_date'  # 按日期分层浏览
  



@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['get_short_text', 'author', 'task', 'timestamp']
    search_fields = ['text', 'author', 'task__title']
    list_filter = ['timestamp', 'author']
    readonly_fields = ['timestamp']
    
    # 显示评论的前50个字符
    def get_short_text(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    get_short_text.short_description = 'Kommentar'

