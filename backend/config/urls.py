# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# ⭐️ 1. Import เฉพาะ 'drf-spectacular'
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# ⭐️ 2. Import แค่ 'simplejwt'
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # 1. หน้า Admin ของ Django
    path('admin/', admin.site.urls),

    # 2. API หลักของเรา (โอนสายไปที่ api/urls.py)
    path('api/', include('api.urls')),

    # 3. API สำหรับ JWT (Login/Refresh Token)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 4. API Docs (Swagger - drf-spectacular)
    # (เราลบ drf-yasg ที่ชื่อ 'swagger/' และ 'redoc/' ออกไปแล้ว)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# 5. (สำคัญ) สำหรับแสดงไฟล์ Media (ที่เราทำไว้)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)