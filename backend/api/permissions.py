from rest_framework import permissions
from .models import Profile


class IsStudent(permissions.BasePermission):
    """
    Allow access only to users with the 'Student' role.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == Profile.Role.STUDENT

class IsStaff(permissions.BasePermission):
    """
    Allow access only to staff members (any role other than Student).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role != Profile.Role.STUDENT

class IsAdvisor(permissions.BasePermission):
    """
    Allow access only to users with the 'Advisor' role.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == Profile.Role.ADVISOR

class IsFinanceStaff(permissions.BasePermission):
    """
    Allow access only to users with the 'Finance Staff' role.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == Profile.Role.STAFF_FINANCE

