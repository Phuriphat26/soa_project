# api/views.py

from django.db import transaction
from django.contrib.auth.models import User
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Profile 
from .models import (
    Category, RequestType, Request, RequestHistory, 
    Attachment, Notification
)
from rest_framework.views import APIView
import sys 

# --- (1) Import Serializer ทั้งหมด ---
from .serializers import (
    UserSerializer, CategorySerializer, 
    RequestTypeSerializer, RequestSerializer, RequestDetailSerializer, 
    NotificationSerializer, RequestHistorySerializer,
    AttachmentSerializer,
    StudentRegisterSerializer,
    StaffRegisterSerializer,
    RequestCreateSerializer,
    RequestStatusUpdateSerializer 
)
from .serializers import AdminUserCreateSerializer, AdminUserUpdateSerializer 

# ⭐️ (แนะนำ) Import Permission ของคุณมาใช้
from .permissions import IsStudent, IsStaff 

# [ 1 ] Views สำหรับ User และ Authentication
# (ส่วนนี้ถูกต้องอยู่แล้ว)
class StudentRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny] 
    serializer_class = StudentRegisterSerializer

class StaffRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAdminUser] 
    serializer_class = StaffRegisterSerializer

class UserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user

# [ 2 ] Views สำหรับข้อมูลหลัก
# ----------------------------------------
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    # ⭐️ [แก้ไข Bug 2]
    # ⭐️ ต้องเป็น Admin เท่านั้นที่สร้าง/แก้ไข/ลบ Category ได้
    # ⭐️ (ถ้าต้องการให้ Staff อ่านได้อย่างเดียว ให้ใช้วิธีเดียวกับ RequestTypeViewSet)
    permission_classes = [permissions.IsAdminUser] 

class RequestTypeViewSet(viewsets.ModelViewSet):
    queryset = RequestType.objects.all()
    serializer_class = RequestTypeSerializer
    
    # (ส่วนนี้ถูกต้องอยู่แล้ว)
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.IsAdminUser]
        return super().get_permissions() 
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category')
        if category_id and category_id.isdigit():
            queryset = queryset.filter(category_id=category_id)
        return queryset

class NotificationViewSet(viewsets.ModelViewSet):
    # (ส่วนนี้ถูกต้องอยู่แล้ว)
    queryset = Notification.objects.all() 
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return user.notifications.all() 
        return Notification.objects.none()
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

# (Views ของ Admin - ถูกต้องอยู่แล้ว)
class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserCreateSerializer
    permission_classes = [permissions.IsAdminUser] 

class SetUserRoleView(APIView):
    permission_classes = [permissions.IsAdminUser] 
    def post(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        new_role = request.data.get('role')
        if not new_role:
            return Response({'error': 'Role not provided'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            profile, created = Profile.objects.get_or_create(user=user)
            if created:
                print(f"Created new profile for user: {user.username}")
            
            # (ตรวจสอบว่า Role ที่ส่งมา ถูกต้องตาม Model หรือไม่)
            if new_role not in Profile.Role.values:
                 return Response({'error': f'Invalid role. Must be one of {Profile.Role.labels}'}, status=status.HTTP_400_BAD_REQUEST)

            profile.role = new_role
            profile.save()
            return Response({
                'status': f'Role updated to {new_role}',
                'user_id': user.id,
                'new_role': new_role
            }, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error updating/creating profile: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# [ 3 ] ViewSet หลัก: Request
# ----------------------------------------
class RequestViewSet(viewsets.ModelViewSet):
    queryset = Request.objects.all()
    permission_classes = [permissions.IsAuthenticated] 

    def get_serializer_class(self):
        # (ส่วนนี้ถูกต้องอยู่แล้ว)
        if self.action == 'create':
            return RequestCreateSerializer
        if self.action == 'retrieve':
            return RequestDetailSerializer
        if self.action == 'partial_update': 
            # (ใช้ getattr ป้องกัน User ที่ไม่มี profile)
            if getattr(self.request.user, 'profile', None) and self.request.user.profile.role != Profile.Role.STUDENT:
                return RequestStatusUpdateSerializer
        return RequestSerializer 

    # ⭐️ [แก้ไข Bug 3]
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Request.objects.none()
        
        profile = getattr(user, 'profile', None)
        if not profile:
             return Request.objects.none()

        # ⭐️ ใช้ Role จาก Model (ตัวพิมพ์ใหญ่)
        role = profile.role

        if role == Profile.Role.STUDENT:
            # นักเรียน: เห็นเฉพาะของตัวเอง
            return Request.objects.filter(student=user).order_by('-created_at')
        
        # ⭐️ ถ้า Role "ไม่ใช่" Student (จะเป็น Admin, Advisor, Staff, Staff (Finance) ฯลฯ)
        elif role != Profile.Role.STUDENT: 
            # ให้เห็นทั้งหมด
            return Request.objects.all().order_by('-created_at')
        
        return Request.objects.none()

    # ⭐️ [แก้ไข Bug 4]
    @transaction.atomic
    def perform_create(self, serializer):
        # ⭐️ ให้ Serializer (RequestCreateSerializer)
        # ⭐️ จัดการการ Save เอง และเราแค่ "ยัด" student (คนที่ login) เข้าไป
        request_obj = serializer.save(student=self.request.user)

        # 2. สร้าง History (โค้ดเดิมของคุณ)
        RequestHistory.objects.create(
            request=request_obj,
            user=self.request.user,
            action="Submitted"
        )
    
    # (ส่วน partial_update และ Notification - ถูกต้องอยู่แล้ว)
    @transaction.atomic 
    def partial_update(self, request, *args, **kwargs):
        request_obj = self.get_object()
        new_status = request.data.get('status') 

        response = super().partial_update(request, *args, **kwargs)

        if response.status_code == 200 and new_status:
            
            # --- 1. สร้าง History ---
            RequestHistory.objects.create(
                request=request_obj,
                user=request.user, 
                action=f"Status changed to {new_status}"
            )

            # --- 2. สร้าง Notification ---
            try:
                request_type_name = request_obj.request_type.name if request_obj.request_type else "ไม่ระบุประเภท"
                
                message_text = f"คำร้อง ID #{request_obj.id} ({request_type_name}) ของคุณ ถูกอัปเดตสถานะเป็น '{new_status}'"
                
                Notification.objects.create(
                    user=request_obj.student, 
                    message=message_text,
                    request=request_obj 
                )
                
                print(f"✅ Notification created for {request_obj.student.username}: {message_text}")

            except Exception as e:
                print(f"‼️ ERROR creating notification: {str(e)}", file=sys.stderr)
                sys.stderr.flush()

        return response


# [ 4 ] ViewSets สำหรับส่วนประกอบย่อย
# (ส่วนนี้ถูกต้องอยู่แล้ว)
class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class RequestHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RequestHistory.objects.all()
    serializer_class = RequestHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all().order_by('id')
    serializer_class = AdminUserUpdateSerializer 
    permission_classes = [permissions.IsAdminUser]