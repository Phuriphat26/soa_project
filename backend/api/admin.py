from django.contrib import admin
from .models import (
    Profile, Category, RequestType, 
    Request, RequestHistory, Attachment, Notification
)


admin.site.register(RequestType)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

admin.site.register(Category, CategoryAdmin)


class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    list_filter = ('role',)

admin.site.register(Profile, ProfileAdmin)


class RequestAdmin(admin.ModelAdmin):

    list_display = ('id', 'student', 'request_type', 'status', 'created_at')
    

    list_filter = ('status', 'request_type__category') 
    
    search_fields = ('student__username', 'details')
    
admin.site.register(Request, RequestAdmin)



admin.site.register(RequestHistory)
admin.site.register(Attachment)
admin.site.register(Notification)