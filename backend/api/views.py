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


from .permissions import IsStudent, IsStaff 


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



class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in self.permission_classes]
class RequestTypeViewSet(viewsets.ModelViewSet):
    queryset = RequestType.objects.all()
    serializer_class = RequestTypeSerializer
    
  
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


class RequestViewSet(viewsets.ModelViewSet):
    queryset = Request.objects.all()
    permission_classes = [permissions.IsAuthenticated] 

    def get_serializer_class(self):
    
        if self.action == 'create':
            return RequestCreateSerializer
        if self.action == 'retrieve':
            return RequestDetailSerializer
        if self.action == 'partial_update': 
            
            if getattr(self.request.user, 'profile', None) and self.request.user.profile.role != Profile.Role.STUDENT:
                return RequestStatusUpdateSerializer
        return RequestSerializer 


    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Request.objects.none()
        
        profile = getattr(user, 'profile', None)
        if not profile:
             return Request.objects.none()

    
        role = profile.role

        if role == Profile.Role.STUDENT:
       
            return Request.objects.filter(student=user).order_by('-created_at')
        
     
        elif role != Profile.Role.STUDENT: 
           
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
    

    @transaction.atomic 
    def partial_update(self, request, *args, **kwargs):
        request_obj = self.get_object()
        new_status = request.data.get('status') 

        response = super().partial_update(request, *args, **kwargs)

        if response.status_code == 200 and new_status:
            
           
            RequestHistory.objects.create(
                request=request_obj,
                user=request.user, 
                action=f"Status changed to {new_status}"
            )

          
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