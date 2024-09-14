from django.urls import path
from . import views

app_name = "wthrlyapp"

urlpatterns = [
    path("", views.index, name="index"),
    path("<str:oras>/", views.localitate, name="localitate"),
    path("<str:oras>/addFav/", views.addFav, name="addFav"),
    path("auth/login/", views.login_view, name="login"),
    path("auth/logout/", views.logout_view, name="logout"),
    path("auth/signup/", views.signup_view, name="signup"),
]
