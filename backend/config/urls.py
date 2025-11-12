from django.contrib import admin
from django.urls import path, include

# --- Import ส่วนของ DRF-YASG (Swagger) ---
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
# ----------------------------------------

# --- Import ส่วนของ SIMPLEJWT (Token) ---
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
# ----------------------------------------

# --- ตั้งค่าหน้าตาของ Swagger ---
schema_view = get_schema_view(
   openapi.Info(
      title="Student Service API",
      default_version='v1',
      description="API Documentation for Student Service System (Project V3)",
      contact=openapi.Contact(email="contact@student.service.local"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)
# ----------------------------------------


urlpatterns = [
    # 1. หน้า Admin ของ Django
    path('admin/', admin.site.urls),

    # 2. API หลักของเรา (โอนสายไปที่ api/urls.py)
    path('api/', include('api.urls')),

    # 3. API สำหรับ JWT (Login/Refresh Token) (ตามโจทย์)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 4. API Docs (Swagger) (ตามโจทย์)
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]