from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, EmployeeViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet) #没有 queryset → Router 不知道 URL name 的前缀, 所以在urls.py使用 basename
router.register(r'employees', EmployeeViewSet) #r'employees'--URL path 的前缀，如 /employees/
router.register(r'comments', CommentViewSet)

urlpatterns = [
     # 🔥 自定义路径必须放在 router 之前（更具体的路由优先）
    path('tasks/status/<str:status>/', TaskViewSet.as_view({'get': 'list_by_status'}), name='tasks-by-status'),
    path('tasks/department/<str:department>/', TaskViewSet.as_view({'get': 'list_by_department'}), name='tasks-by-department'),

    path('', include(router.urls)),
    
]