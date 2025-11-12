from django.db import transaction
from django.contrib.auth.models import User
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import (
    Category, RequestType, Request, RequestHistory, 
    Attachment, Notification
)

# --- (1) Import Serializer ทั้งหมดที่ "จำเป็น" ---
from .serializers import (
    UserSerializer, CategorySerializer, 
    RequestTypeSerializer, RequestSerializer, RequestDetailSerializer, 
    NotificationSerializer, RequestHistorySerializer,
    AttachmentSerializer,
    StudentRegisterSerializer, # <-- ตัวใหม่
    StaffRegisterSerializer,   # <-- ตัวใหม่
    RequestCreateSerializer  # <-- ตัวสำคัญที่เกือบลืม
)

from .permissions import IsStudent, IsStaff # Import "ยาม"

# [ 1 ] Views สำหรับ User และ Authentication
# ----------------------------------------
class StudentRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny] 
    serializer_class = StudentRegisterSerializer

class StaffRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser] 
    serializer_class = StaffRegisterSerializer

class UserView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user

# [ 2 ] Views สำหรับข้อมูลหลัก
# ----------------------------------------
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated] 

class RequestTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RequestType.objects.all()
    serializer_class = RequestTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all() 
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return user.notifications.filter(user=user)
        return Notification.objects.none()
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

# [ 3 ] ViewSet หลัก: Request
# ----------------------------------------
class RequestViewSet(viewsets.ModelViewSet):
    queryset = Request.objects.all()
    permission_classes = [permissions.IsAuthenticated] 

    # --- (2) นี่คือ get_serializer_class ที่ถูกต้อง ---
    def get_serializer_class(self):
        if self.action == 'create':
            return RequestCreateSerializer
        if self.action == 'retrieve':
            return RequestDetailSerializer
        return RequestSerializer # (Default)

    def get_queryset(self):
        """
        เลือก QuerySet ให้อัตโนมัติ (เวอร์ชันปลอดภัย)
        """
        user = self.request.user
        
        # --- นี่คือบรรทัดที่เราเพิ่ม (Safe Check) ---
        # ถ้า User ไม่ได้ Login (เป็น Anonymous)
        # ให้คืนค่าว่างทันที ห้ามไปยุ่งกับ .profile
        if not user.is_authenticated:
            return Request.objects.none()
        # ------------------------------------------
            
        # ถ้าผ่าน
        if user.profile.role == 'STUDENT':
            return Request.objects.filter(student=user).order_by('-created_at')
        elif user.profile.role != 'STUDENT':
            return Request.objects.all().order_by('-created_at')
        
        return Request.objects.none()

    @transaction.atomic
    def perform_create(self, serializer):
        request_obj = serializer.save(student=self.request.user)
        RequestHistory.objects.create(
            request=request_obj,
            user=self.request.user,
            action="Submitted"
        )

# [ 4 ] ViewSets สำหรับส่วนประกอบย่อย
# ----------------------------------------
class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class RequestHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RequestHistory.objects.all()
    serializer_class = RequestHistorySerializer
    permission_classes = [permissions.IsAuthenticated]