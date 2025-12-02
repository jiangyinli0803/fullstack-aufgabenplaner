from collections import namedtuple
from django.db import models
from django.contrib.auth.models import User

# 定义在类外部
Status = namedtuple('Status', ['key', 'label', 'color'])
STATUS_CHOICES = [
    Status('nicht_zugewiesen', 'Nicht zugewiesen', '#EAB308'),
    Status('offen', 'Offen', '#3B82F6'),
    Status('abgeschlossen', 'Abgeschlossen', '#22C55E'),
    Status('archiviert', 'Archiviert', '#64748B'),
]

ROLE_CHOICES = [
        ("admin", "Admin"),
        ("manager", "Manager"),
        ("staff", "Staff"),
]

class Employee(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='employee'  # 方便通过 user.employee 访问
    )
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="staff")
    email = models.EmailField(unique=True)  # 用 EmailField，保证唯一性并可用于登录/通知
    department = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)  # 可用来禁用员工账户
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # 自动记录修改时间
    
    class Meta:
        ordering = ['lastname']
        verbose_name = "Mitarbeiter" # 界面显示名称
        
    
    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.role})"
    
    @property
    def full_name(self):
        return f"{self.firstname} {self.lastname}"

    def is_admin(self):
        return self.role == "admin"
    
    def is_manager(self):
        return self.role == "manager"
    
# Create your models here.
class Task(models.Model):  
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20, 
        choices=[(s.key, s.label) for s in STATUS_CHOICES], 
        default='nicht_zugewiesen'
    )
    start_date = models.DateField()
    end_date = models.DateField()    
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_tasks'
    )
    tester = models.ForeignKey(
        Employee, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='testing_tasks'
    )
    tester_id = models.IntegerField(blank=True, null=True)
    version = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
        
    class Meta:
        ordering = ['-created_at']   # - 减号表示降序(从新到旧), '-name'降序 (Z→A)

    def __str__(self):
        return self.title
    
    @property
    def status_color(self):
        for s in STATUS_CHOICES:
            if s.key == self.status:
                return s.color
        return '#ffffff'



    
class Comment(models.Model):
    task = models.ForeignKey(
        Task, 
        related_name='comments',  # 反向查询用 task.comments.all()
        on_delete=models.CASCADE  # 如果 task 删除，相关 comment 也删除
    )
    user = models.ForeignKey(
        Employee, 
        on_delete=models.CASCADE,
        related_name='comments'
    )
    text = models.TextField()   
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.full_name} on {self.task.title}"
    
    @property
    def author_name(self):
        return self.user.full_name if self.user else "Unknown"