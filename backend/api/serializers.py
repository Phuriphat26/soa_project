from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, Category, RequestType, Request, 
    RequestHistory, Attachment, Notification
)
from django.db import transaction
from .models import Profile
# [ 1 ] Serializers สำหรับแสดงข้อมูลพื้นฐาน (ส่วนใหญ่ Read-Only)
# -----------------------------------------------------------

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class RequestTypeSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField()
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
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'file_name', 'uploaded_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']


# ⭐️⭐️⭐️ [ 1b ] เพิ่มส่วนนี้ ⭐️⭐️⭐️
# Serializers ย่อยสำหรับ Nested Data (แก้ปัญหาหน้าขาว)
# -----------------------------------------------------------
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
# ⭐️⭐️⭐️ [ สิ้นสุดส่วนที่เพิ่ม ] ⭐️⭐️⭐️


# [ 2 ] Serializers สำหรับ User (Login/Register)
# -----------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True) 
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

# ... (StudentRegisterSerializer และ StaffRegisterSerializer เหมือนเดิม) ...
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


# [ 3 ] Serializer หลัก (Request)
# -----------------------------------------------------------

# ⭐️⭐️⭐️ [ แก้ไขส่วนนี้ ] ⭐️⭐️⭐️
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
            'user', # ⭐️ 4. เปลี่ยน 'student' เป็น 'user' ใน list
            'request_type', 
            'details', 'status', 'created_at', 'updated_at'
        ]
# ⭐️⭐️⭐️ [ สิ้นสุดส่วนที่แก้ไข ] ⭐️⭐️⭐️


# ⭐️⭐️⭐️ [ เพิ่มส่วนนี้ ] ⭐️⭐️⭐️
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
# ⭐️⭐️⭐️ [ สิ้นสุดส่วนที่เพิ่ม ] ⭐️⭐️⭐️


class RequestCreateSerializer(serializers.ModelSerializer):
    request_type_id = serializers.PrimaryKeyRelatedField(
        queryset=RequestType.objects.all(), source='request_type', write_only=True
    )
    class Meta:
        model = Request
        fields = ['request_type_id', 'details']


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