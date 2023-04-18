# views.py
from django.contrib.auth.decorators import user_passes_test
from django.shortcuts import redirect, render

from .models import CustomUser


@user_passes_test(lambda user: user.is_staff)
def approve_users(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        user = CustomUser.objects.get(id=user_id)
        user.is_approved = True
        user.save()
        return redirect('approve_users')

    unapproved_users = CustomUser.objects.filter(is_approved=False)
    return render(request, 'auth_app/approve_users.html', {'unapproved_users': unapproved_users})

def home(request):
    return render(request, 'auth_app/home.html')