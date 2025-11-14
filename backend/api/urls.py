from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()


router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'request-types', views.RequestTypeViewSet, basename='requesttype')
router.register(r'requests', views.RequestViewSet, basename='request')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

router.register(r'attachments', views.AttachmentViewSet)



urlpatterns = [

    path('register/student/', views.StudentRegisterView.as_view(), name='register-student'),
    path('register/staff/', views.StaffRegisterView.as_view(), name='register-staff'),
    # -------------------------------
    path('users/<int:user_id>/set_role/', views.SetUserRoleView.as_view(), name='set-user-role'),
    path('users/me/', views.UserView.as_view(), name='user-me'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/create/', views.UserCreateView.as_view(), name='user-create'),
    
    
    path('', include(router.urls)),
]