from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, EmployeeViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet) #没有 queryset → Router 不知道 URL name 的前缀, 所以在urls.py使用 basename
router.register(r'employees', EmployeeViewSet) #r'employees'--URL path 的前缀，如 /employees/
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]