from django.db import transaction
from django.contrib.auth.models import User
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Profile # 👈 สมมติว่า Role อยู่ใน Profile นะครับ (ถ้าไม่ ให้แก้ตรงนี้)
from .models import (
    Category, RequestType, Request, RequestHistory, 
    Attachment, Notification
)
from rest_framework.views import APIView
# --- (1) Import Serializer ทั้งหมดที่ "จำเป็น" ---
from .serializers import (
    UserSerializer, CategorySerializer, 
    RequestTypeSerializer, RequestSerializer, RequestDetailSerializer, 
    NotificationSerializer, RequestHistorySerializer,
    AttachmentSerializer,
    StudentRegisterSerializer,
    StaffRegisterSerializer,
    RequestCreateSerializer,
    RequestStatusUpdateSerializer  # ⭐️ 1. Import ตัวใหม่เข้ามา
)
from .serializers import AdminUserCreateSerializer, AdminUserUpdateSerializer 
from .permissions import IsStudent, IsStaff 

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

class UserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    def get_object(self):
        return self.request.user

# [ 2 ] Views สำหรับข้อมูลหลัก
# ----------------------------------------
# ... (CategoryViewSet, RequestTypeViewSet, NotificationViewSet เหมือนเดิม) ...
class CategoryViewSet(viewsets.ModelViewSet):
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

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    
    # ⭐️ 2. ตั้งสิทธิ์: เฉพาะ Admin (is_staff=True) ที่ดึงได้ ⭐️
    permission_classes = [permissions.IsAdminUser]

class UserCreateView(generics.CreateAPIView):
    """
    API View สำหรับ Admin ในการสร้าง User ใหม่
    """
    queryset = User.objects.all()
    serializer_class = AdminUserCreateSerializer
    permission_classes = [permissions.IsAdminUser] # 👈 ล็อกเฉพาะ Admin

class SetUserRoleView(APIView):
    """
    View สำหรับอัปเดต Role (เวอร์ชันอัปเกรด: สร้าง Profile ถ้ายังไม่มี)
    """
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
            # ⭐️ 1. นี่คือส่วนที่แก้ไข: ⭐️
            # ลองหา Profile, หรือ "สร้างใหม่" ถ้ายังไม่มี
            # (get_or_create จะคืนค่า (object, created_boolean))
            profile, created = Profile.objects.get_or_create(user=user)
            
            if created:
                # ถ้าเพิ่งสร้าง Profile (เช่น user ที่เพิ่ง register)
                print(f"Created new profile for user: {user.username}")

            # 2. ตั้งค่า Role ใหม่
            profile.role = new_role
            profile.save()
            
            # 3. ส่งข้อมูล User ที่อัปเดตแล้วกลับไป
            # (เราอาจจะต้องใช้ UserSerializer ที่นี่ แต่ส่งแบบง่ายไปก่อน)
            return Response({
                'status': f'Role updated to {new_role}',
                'user_id': user.id,
                'new_role': new_role
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            # ดักจับ Error อื่นๆ
            print(f"Error updating/creating profile: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ... (โค้ด View อื่นๆ ของคุณ) ...
# [ 3 ] ViewSet หลัก: Request
# ----------------------------------------
class RequestViewSet(viewsets.ModelViewSet):
    queryset = Request.objects.all()
    permission_classes = [permissions.IsAuthenticated] 

    # ⭐️ 2. แก้ไข get_serializer_class ⭐️
    def get_serializer_class(self):
        if self.action == 'create':
            return RequestCreateSerializer
            
        if self.action == 'retrieve':
            return RequestDetailSerializer
            
        # ⭐️ เพิ่มเงื่อนไขนี้: ถ้า action คือ 'partial_update' (PATCH)
        if self.action == 'partial_update': 
            # (ตรวจสอบสิทธิ์คนอัปเดต)
            if self.request.user.profile.role != 'Student':
                # ให้ใช้ Serializer ตัวใหม่ที่รับ 'status' ได้
                return RequestStatusUpdateSerializer
            # (ถ้าเป็น Student พยายาม PATCH, จะโดน Permission Denied)
        
        # (Default) ถ้าเป็น 'list' หรืออื่นๆ
        # ให้ใช้ Serializer ตัวใหม่ที่แก้ปัญหา null แล้ว
        return RequestSerializer 

    # ... (get_queryset(self) เหมือนเดิม) ...
    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return Request.objects.none()
            
        if user.profile.role == 'Student':
            return Request.objects.filter(student=user).order_by('-created_at')
        elif user.profile.role != 'Student':
            return Request.objects.all().order_by('-created_at')
        
        return Request.objects.none()

    # ... (perform_create(self, serializer) เหมือนเดิม) ...
    @transaction.atomic
    def perform_create(self, serializer):
        request_obj = serializer.save(student=self.request.user)
        RequestHistory.objects.create(
            request=request_obj,
            user=self.request.user,
            action="Submitted"
        )

    # ⭐️ 3. เพิ่ม (Override) เมธอดนี้ ⭐️
    @transaction.atomic # ใช้ transaction เพื่อความปลอดภัย
    def partial_update(self, request, *args, **kwargs):
        """
        Override เมธอดนี้เพื่อ "ดัก" การอัปเดตสถานะ
        และสร้าง RequestHistory
        """
        request_obj = self.get_object()
        new_status = request.data.get('status') # (เช่น 'Approved')

        # เรียกใช้ partial_update "ของเดิม" (จาก ModelViewSet)
        # เพื่อให้มันทำการ Validate (ด้วย RequestStatusUpdateSerializer)
        # และ Save ข้อมูล
        response = super().partial_update(request, *args, **kwargs)

        # "หลังจาก" Save สำเร็จ (ถ้าไม่ Error)
        if response.status_code == 200 and new_status:
            # สร้าง History
            RequestHistory.objects.create(
                request=request_obj,
                user=request.user, # คนที่กดอนุมัติ/ปฏิเสธ
                action=f"Status changed to {new_status}"
            )

        return response


# [ 4 ] ViewSets สำหรับส่วนประกอบย่อย
# ----------------------------------------
# ... (AttachmentViewSet และ RequestHistoryViewSet เหมือนเดิม) ...
class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class RequestHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RequestHistory.objects.all()
    serializer_class = RequestHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API View สำหรับ Admin ในการ
    - ดึงข้อมูล (GET)
    - แก้ไข (PUT/PATCH)
    - ลบ (DELETE)
    ... ผู้ใช้ตาม ID
    """
    queryset = User.objects.all().order_by('id')
    serializer_class = AdminUserUpdateSerializer # 👈 ใช้ Serializer แก้ไข
    permission_classes = [permissions.IsAdminUser] # 👈 ล็อกเฉพาะ Admin
