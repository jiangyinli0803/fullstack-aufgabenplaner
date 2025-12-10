from collections import namedtuple
from django.db import models
from django.contrib.auth.models import User
from django.forms import ValidationError
from django.core.exceptions import ValidationError

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

PRIORITY_CHOICES = [
    ('low', 'Niedrig'),
    ('medium', 'Mittel'),
    ('high', 'Hoch'),
    ('urgent', 'Dringend'),
]

class Employee(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='employee',  # 方便通过 user.employee 访问
        null=True,
        blank=True
    )
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100, default='Unbekannt')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="staff")    
    department = models.CharField(max_length=100, blank=True, db_index=True)
    is_active = models.BooleanField(default=True)  # 可用来禁用员工账户
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # 自动记录修改时间
    
    class Meta:
        ordering = ['lastname']
        verbose_name = "Mitarbeiter" # 界面显示名称
        verbose_name_plural = "Mitarbeiter"
        indexes = [
            models.Index(fields=['role', 'is_active']),  # 常用查询组合 使用索引快速定位行
            models.Index(fields=['department']),
        ]
    
    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.role})"
    
    @property
    def full_name(self):
        return f"{self.firstname} {self.lastname}"
    
    @property
    def email(self):
        """通过user获取email"""
        return self.user.email if self.user else None

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
        default='nicht_zugewiesen',
        db_index=True
    )
    start_date = models.DateField()
    end_date = models.DateField()  
    employee = models.ForeignKey(
        Employee, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_tasks',
        verbose_name='Employee'
    )   
    tester = models.ForeignKey(
        Employee, 
        on_delete=models.SET_NULL,  #不会因为员工被删除导致任务也被删除
        null=True, 
        blank=True,
        related_name='testing_tasks',
        verbose_name='Tester'
    )
    created_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tasks',       
    )
    updated_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_tasks',       
    )    
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    version = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
        
    class Meta:
        ordering = ['-created_at']   # - 减号表示降序(从新到旧), '-name'降序 (Z→A)
        verbose_name = "Aufgabe"
        verbose_name_plural = "Aufgaben"
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return self.title
    
   
    
    @property
    def status_color(self):
        for s in STATUS_CHOICES:
            if s.key == self.status:
                return s.color
        return '#ffffff'

    @property
    def is_overdue(self):
        """是否已过期"""
        from django.utils import timezone
        if self.status not in ['abgeschlossen', 'archiviert']:
            return self.end_date < timezone.now().date()
        return False
    
    def clean(self):
        if self.end_date < self.start_date:
            raise ValidationError("Enddatum darf nicht vor Startdatum liegen")

    
class Comment(models.Model):
    task = models.ForeignKey(
        Task, 
        related_name='comments',  # 反向查询用 task.comments.all()
        on_delete=models.CASCADE  # 如果 task 删除，相关 comment 也删除
    )
    author = models.ForeignKey(
        Employee, 
        on_delete=models.SET_NULL,
        related_name='comments',
        null=True,  # 允许为空
        blank=True
    )
    text = models.TextField()
    is_edited = models.BooleanField(default=False)   
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Kommentar"
        verbose_name_plural = "Kommentare"
        indexes = [
            models.Index(fields=['task', '-created_at']),
        ]
    
    def __str__(self):
        return f"Comment by {self.author.full_name} on {self.task.title}"
    
    @property
    def author_name(self):
        return self.author.full_name if self.author else "Unbekannt"
    
    def save(self, *args, **kwargs):
        """保存时检查是否编辑过"""
        if self.pk:
            old = Comment.objects.get(pk=self.pk)
            if old.text != self.text:  #只在 text 修改时
                self.is_edited = True
        super().save(*args, **kwargs)