from django.contrib import admin
from .models import Task, Employee, Comment
# Register your models here.

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['firstname', 'lastname','department', 'role','created_at']
    search_fields = ['firstname', 'lastname', 'department']
    list_filter = ['department', 'created_at', 'role']
    ordering = ['lastname']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):  # 列表显示的字段
    list_display = ['title', 'status','priority', 'description','start_date', 'end_date', 'employee', 'version','created_by', 'created_at']
    search_fields = ['title', 'employee__firstname', 'employee__lastname']
    list_filter = ['status', 'priority', 'start_date', 'end_date', 'created_at']
    list_editable = ['status', 'priority']  # 可以在列表页直接修改状态
    date_hierarchy = 'start_date'  # 按日期分层浏览
   

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['get_short_text', 'author', 'task', 'created_at']
    search_fields = ['text', 'author__firstname', 'task__title']
    list_filter = ['created_at', 'author']
    readonly_fields = ['created_at', 'updated_at']
    
    # 显示评论的前50个字符
    def get_short_text(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    get_short_text.short_description = 'Kommentar'

