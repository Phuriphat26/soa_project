from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        ADVISOR = 'ADVISOR', 'Advisor'
        STAFF_REGISTRAR = 'STAFF_REGISTRAR', 'Staff (Registrar)'
        STAFF_FINANCE = 'STAFF_FINANCE', 'Staff (Finance)'
        ADMIN = 'ADMIN', 'Admin'

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.STUDENT)
    
    def __str__(self):
        return f'{self.user.username} - {self.get_role_display()}'

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

    if hasattr(instance, 'profile'):
        instance.profile.save()
    else:

        Profile.objects.create(user=instance)



class Category(models.Model):
    name = models.CharField(max_length=100) 
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class RequestType(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='request_types')
    name = models.CharField(max_length=255) 
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f'[{self.category.name}] - {self.name}'



class Request(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Approval'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    

    request_type = models.ForeignKey(RequestType, on_delete=models.SET_NULL, null=True)
    
    details = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        
        type_name = self.request_type.name if self.request_type else "N/A"
        return f'Request #{self.id} by {self.student.username} ({type_name})'



class RequestHistory(models.Model):
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['timestamp']
    def __str__(self):
        return f'{self.request} - {self.action} at {self.timestamp}'



def get_upload_path(instance, filename):
    return f'attachments/request_{instance.request.id}/{filename}'

class Attachment(models.Model):
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=get_upload_path)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f'File for Request #{self.request.id}'



class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
  
    request = models.ForeignKey(
        Request, 
        on_delete=models.CASCADE,
        null=True, 
        blank=True
    )
    
    message = models.TextField() 
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Notification for {self.user.username}: {self.message[:20]}...'