from django.contrib.auth.backends import ModelBackend

from .models import CustomUser


class CustomUserModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = CustomUser.objects.get(username=username)
            if user.check_password(password) and user.is_approved:
                return user
        except CustomUser.DoesNotExist:
            return None
