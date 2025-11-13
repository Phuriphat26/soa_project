from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# สร้าง Router (ตัวจัดการ ViewSet อัตโนมัติ)
router = DefaultRouter()

# ลงทะเบียน ViewSets ของเรากับ Router
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'request-types', views.RequestTypeViewSet, basename='requesttype')
router.register(r'requests', views.RequestViewSet, basename='request')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
# (เราเพิ่ม 'basename' เข้าไป เพื่อความปลอดภัย กัน Error ในอนาคต)


# นี่คือ URL ที่เราสร้างเอง (ที่ไม่ใช่ ViewSet)
urlpatterns = [
    # --- นี่คือส่วนที่แก้ไข Error ---
    # เราลบบรรทัด 'register/' เก่าทิ้ง
    
    # เราเพิ่ม 2 บรรทัดนี้แทน (ตามแผน V3)
    path('register/student/', views.StudentRegisterView.as_view(), name='register-student'),
    path('register/staff/', views.StaffRegisterView.as_view(), name='register-staff'),
    # -------------------------------
    path('users/<int:user_id>/set_role/', views.SetUserRoleView.as_view(), name='set-user-role'),
    path('users/me/', views.UserView.as_view(), name='user-me'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/create/', views.UserCreateView.as_view(), name='user-create'),
    # รวม URL ทั้งหมดที่ Router สร้างขึ้น
    path('', include(router.urls)),
]