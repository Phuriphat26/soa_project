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
    """
    สำหรับ Dropdown 1: แสดงหมวดหมู่หลัก (เช่น งานวิชาการ)
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class RequestTypeSerializer(serializers.ModelSerializer):
    """
    สำหรับ Dropdown 2: แสดงประเภทย่อย (เช่น ขอถอนรายวิชา)
    เราจะแสดงชื่อ Category ที่มันสังกัดอยู่ด้วย (แบบอ่านอย่างเดียว)
    """
    category = serializers.StringRelatedField()

    class Meta:
        model = RequestType
        fields = ['id', 'name', 'description', 'category']


class ProfileSerializer(serializers.ModelSerializer):
    """
    แสดง Role ของผู้ใช้ (Student, Advisor, ฯลฯ)
    """
    # ใช้ source='get_role_display' เพื่อให้มันส่งชื่อเต็ม (เช่น "Student") 
    # แทนรหัส (เช่น "STUDENT")
    role = serializers.CharField(source='get_role_display') 
    class Meta:
        model = Profile
        fields = ['role']


class RequestHistorySerializer(serializers.ModelSerializer):
    """
    สำหรับแสดง Timeline ประวัติ
    """
    user = serializers.StringRelatedField() # แสดง username แทน ID
    class Meta:
        model = RequestHistory
        fields = ['user', 'action', 'timestamp']


class AttachmentSerializer(serializers.ModelSerializer):
    """
    สำหรับแสดง/อัปโหลดไฟล์แนบ
    """
    # แสดงชื่อไฟล์ (เพื่อให้ Frontend รู้ว่าไฟล์ชื่ออะไร)
    file_name = serializers.CharField(source='file.name', read_only=True)
    
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'file_name', 'uploaded_at']


class NotificationSerializer(serializers.ModelSerializer):
    """
    สำหรับ "กระดิ่ง" แจ้งเตือน
    """
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']


# [ 2 ] Serializers สำหรับ User (Login/Register)
# -----------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    """
    สำหรับแสดงข้อมูล User (เช่น หน้า /me)
    """
    profile = ProfileSerializer(read_only=True) 
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']


class StudentRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer สำหรับ "นักศึกษา" สมัครสมาชิก (ช่องทาง Public)
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')

    @transaction.atomic # ทำให้ทำงานพร้อมกัน ถ้าพังจะ Rollback
    def create(self, validated_data):
        # 1. สร้าง User ก่อน
        user = User.objects.create_user(**validated_data)
        
        # 2. (นี่คือโค้ดใหม่!) บังคับกำหนด Role ให้ Profile เป็น 'STUDENT'
        #    เราไม่สนค่า Default ใน Model อีกต่อไป
        Profile.objects.filter(user=user).update(role=Profile.Role.STUDENT)
        
        return user


class StaffRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer สำหรับ "Admin" ใช้สร้าง "เจ้าหน้าที่/อาจารย์" (ช่องทาง Admin-Only)
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    # รับ Role มาจาก JSON
    role = serializers.ChoiceField(choices=Profile.Role.choices, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'role')

    @transaction.atomic
    def create(self, validated_data):
        # 1. ดึง Role ที่ Admin ส่งมา ออกจาก Data
        role = validated_data.pop('role')
        
        # 2. สร้าง User ด้วย Data ที่เหลือ
        user = User.objects.create_user(**validated_data)
        
        # 3. (นี่คือโค้ดสำคัญ!) บังคับกำหนด Role ให้ Profile ตามที่ Admin ส่งมา
        Profile.objects.filter(user=user).update(role=role)
        
        return user


# [ 3 ] Serializer หลัก (Request)
# -----------------------------------------------------------

class RequestSerializer(serializers.ModelSerializer):
    """
    Serializer หลักสำหรับ 'Request' (สำหรับแสดงรายการ)
    """
    # ตอน Read (GET) เราจะแสดง "ชื่อ" (String)
    student = serializers.StringRelatedField(read_only=True)
    request_type = serializers.StringRelatedField(read_only=True)
    status = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Request
        fields = [
            'id', 'student', 'request_type', 'details', 'status', 
            'created_at', 'updated_at'
        ]


class RequestCreateSerializer(serializers.ModelSerializer):
    """
    Serializer พิเศษสำหรับ "สร้าง" Request (POST)
    """
    request_type_id = serializers.PrimaryKeyRelatedField(
        queryset=RequestType.objects.all(), source='request_type', write_only=True
    )

    class Meta:
        model = Request
        fields = ['request_type_id', 'details'] # รับแค่ 2 field นี้

class RequestDetailSerializer(serializers.ModelSerializer):
    """
    Serializer สำหรับแสดง "รายละเอียด" Request 1 ชิ้น (ดึงทุกอย่างที่เกี่ยวข้อง)
    """
    student = UserSerializer(read_only=True) # Nested: แสดงข้อมูล Student
    request_type = RequestTypeSerializer(read_only=True) # Nested: แสดงข้อมูล RequestType
    status = serializers.CharField(source='get_status_display', read_only=True)
    
    # ดึงข้อมูล "ประวัติ" ทั้งหมดที่เชื่อมโยงกัน
    history = RequestHistorySerializer(many=True, read_only=True) 
    
    # ดึง "ไฟล์แนบ" ทั้งหมดที่เชื่อมโยงกัน
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Request
        fields = [
            'id', 'student', 'request_type', 'details', 'status', 
            'created_at', 'updated_at', 'history', 'attachments'
        ]