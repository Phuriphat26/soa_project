from django.contrib import admin
from .models import (
    Profile, Category, RequestType, 
    Request, RequestHistory, Attachment, Notification
)

# [ 1 ] เราจะลงทะเบียน Model ใหม่ (RequestType)
admin.site.register(RequestType)

# [ 2 ] เราจะปรับแต่ง Category
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

admin.site.register(Category, CategoryAdmin)

# [ 3 ] เราจะปรับแต่ง Profile
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)

admin.site.register(Profile, ProfileAdmin)

# [ 4 ] นี่คือส่วนที่แก้ไข Error!
class RequestAdmin(admin.ModelAdmin):
    # เปลี่ยน 'category' เป็น 'request_type'
    list_display = ('id', 'student', 'request_type', 'status', 'created_at')
    
    # เปลี่ยน 'category' เป็น 'request_type__category' 
    # (นี่คือเทคนิคขั้นสูง ให้เรา Filter จาก Category ใหญ่ได้)
    list_filter = ('status', 'request_type__category') 
    
    search_fields = ('student__username', 'details')
    
admin.site.register(Request, RequestAdmin)


# [ 5 ] ลงทะเบียนส่วนที่เหลือ
admin.site.register(RequestHistory)
admin.site.register(Attachment)
admin.site.register(Notification)