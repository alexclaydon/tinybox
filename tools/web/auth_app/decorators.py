from functools import wraps

from django.shortcuts import render


def user_is_approved(function):
    @wraps(function)
    def wrap(request, *args, **kwargs):
        user = request.user
        if user.is_authenticated and user.is_approved:
            return function(request, *args, **kwargs)
        else:
            return render(request, 'auth_app/access_denied.html')
    return wrap