from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_approved', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('is_approved',)}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
