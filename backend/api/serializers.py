from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, Category, RequestType, Request, 
    RequestHistory, Attachment, Notification
)
from django.db import transaction
from .models import Profile

from .models import Profile
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class RequestTypeSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all()
    )
    class Meta:
        model = RequestType
        fields = ['id', 'name', 'description', 'category']


class ProfileSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='get_role_display') 
    class Meta:
        model = Profile
        fields = ['role']


class RequestHistorySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    class Meta:
        model = RequestHistory
        fields = ['user', 'action', 'timestamp']


class AttachmentSerializer(serializers.ModelSerializer):
    file_name = serializers.CharField(source='file.name', read_only=True)
    
 
    request = serializers.PrimaryKeyRelatedField(
        queryset=Request.objects.all(), write_only=True
    )

    class Meta:
        model = Attachment
        fields = ['id', 'file', 'file_name', 'uploaded_at', 'request']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']


class SimpleUserSerializer(serializers.ModelSerializer):
    """
    Serializer ย่อย: สำหรับแสดงข้อมูล User (เฉพาะชื่อ)
    """
    class Meta:
        model = User
        fields = ['first_name', 'last_name']

class SimpleRequestTypeSerializer(serializers.ModelSerializer):
    """
    Serializer ย่อย: สำหรับแสดงข้อมูล RequestType (เฉพาะชื่อ)
    """
    class Meta:
        model = RequestType
        fields = ['name']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True) 
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']


class StudentRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Profile.objects.filter(user=user).update(role=Profile.Role.STUDENT)
        return user


class StaffRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    role = serializers.ChoiceField(choices=Profile.Role.choices, write_only=True)
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'role')

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop('role')
        user = User.objects.create_user(**validated_data)
        Profile.objects.filter(user=user).update(role=role)
        return user



class RequestSerializer(serializers.ModelSerializer):
    """
    Serializer หลักสำหรับ 'Request' (สำหรับแสดงรายการ)
    [ แก้ไข ] เปลี่ยน 'student' และ 'request_type' ให้เป็น Nested Object
    """
    
    # 1. "ทับ" field 'request_type' (จาก Model) ด้วย Serializer ย่อย
    request_type = SimpleRequestTypeSerializer(read_only=True)
    
    # 2. "ทับ" field 'student' (จาก Model) แต่เปลี่ยนชื่อเป็น 'user' (ตามที่ React ต้องการ)
    user = SimpleUserSerializer(read_only=True, source='student') 
    
    # 3. 'status' ยังคงเหมือนเดิม (สำหรับ Read)
    status = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Request
        fields = [
            'id', 
            'user', 
            'request_type', 
            'details', 'status', 'created_at', 'updated_at'
        ]

class RequestStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer พิเศษสำหรับ Advisor/Staff ใช้อัปเดต "สถานะ" เท่านั้น
    (รับค่าดิบ เช่น 'Approved', 'Rejected')
    """
    # status field นี้ จะเป็นแบบ "เขียนได้" (Writable)
    status = serializers.ChoiceField(choices=Request.Status.choices)

    class Meta:
        model = Request
        fields = ['status']



class RequestCreateSerializer(serializers.ModelSerializer):
    request_type_id = serializers.PrimaryKeyRelatedField(
        queryset=RequestType.objects.all(), source='request_type', write_only=True
    )
    class Meta:
        model = Request
        fields = ['id', 'request_type_id', 'details']
        
        
        read_only_fields = ['id']


class RequestDetailSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True) 
    request_type = RequestTypeSerializer(read_only=True) 
    status = serializers.CharField(source='get_status_display', read_only=True)
    history = RequestHistorySerializer(many=True, read_only=True) 
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Request
        fields = [
            'id', 'student', 'request_type', 'details', 'status', 
            'created_at', 'updated_at', 'history', 'attachments'
        ]

class AdminUserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer สำหรับ Admin ในการสร้าง User ใหม่ (พร้อม Role)
    """
    
    role = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    @transaction.atomic
    def create(self, validated_data):
       
        role_data = validated_data.pop('role', 'Student') 
        
        user = User.objects.create_user(**validated_data)
        
        
        Profile.objects.update_or_create(
            user=user, 
            defaults={'role': role_data}
        )
        return user
    
class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer สำหรับ Admin ในการ "แก้ไข" ข้อมูล User
    (อนุญาตเฉพาะ username และ email)
    """
    class Meta:
        model = User
        fields = ['username', 'email'] # 👈 อนุญาตแค่ 2 field นี้
        extra_kwargs = {
            'username': {'required': True},
        }

    def validate_username(self, value):
        
        if self.instance and self.instance.username == value:
            return value 
        
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        
        if self.instance and self.instance.email == value:
            return value 
            
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
class AdminUserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer สำหรับ Admin ในการสร้าง User ใหม่ (พร้อม Role)
    """
    role = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    @transaction.atomic
    def create(self, validated_data):
        role_data = validated_data.pop('role', 'Student')
        user = User.objects.create_user(**validated_data)
        Profile.objects.update_or_create(
            user=user, 
            defaults={'role': role_data}
        )
        return user