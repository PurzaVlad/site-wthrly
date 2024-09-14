from django.shortcuts import render, redirect
from django.urls import reverse
from .models import Favorite
from django.core.exceptions import ValidationError
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django import forms
from urllib.parse import unquote
from django.contrib.auth.decorators import login_required

PREDEFINED_CITIES = ["Timisoara", "New York", "Dubai"]

class SignupForm(forms.Form):
    username = forms.CharField(max_length=150, required=True)
    email = forms.EmailField(required=True)
    password1 = forms.CharField(widget=forms.PasswordInput, required=True)
    password2 = forms.CharField(widget=forms.PasswordInput, required=True)

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username=username).exists():
            raise ValidationError("This username is already taken. Please choose a different one.")
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("An account linked to this email already exists.")
        return email

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise ValidationError("Passwords do not match")
        return password2

    def save(self):
        username = self.cleaned_data['username']
        email = self.cleaned_data['email']
        password = self.cleaned_data['password1']
        user = User.objects.create_user(username=username, email=email, password=password)
        return user

def index(request):
    if request.user.is_authenticated:
        favorites = Favorite.objects.filter(user=request.user)
    else:
        favorites = [{"city": city} for city in PREDEFINED_CITIES]
    return render(request, "wthrlyapp/index.html", {"favorites": favorites})

def localitate(request, oras):
    oras = unquote(oras)
    numberRange = range(9)
    isFav = False

    if request.user.is_authenticated:
        favorites = Favorite.objects.filter(user=request.user).values_list('city', flat=True)
        isFav = oras in favorites
        
    return render(request, "wthrlyapp/localitate.html", {"oras": oras, "numberRange": numberRange, "isFav": isFav})

@login_required
def addFav(request, oras):
    oras = unquote(oras)
    if not Favorite.objects.filter(user=request.user, city=oras).exists():
        Favorite.objects.create(user=request.user, city=oras)
    else:
        Favorite.objects.filter(user=request.user, city=oras).first().delete()
    return redirect('wthrlyapp:localitate', oras = oras)

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("wthrlyapp:index"))
        else:
            return render(request, "wthrlyapp/login.html", {
                "message": "Invalid Credentials"
            })

    return render(request, "wthrlyapp/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("wthrlyapp:index"))

def signup_view(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return HttpResponseRedirect(reverse("wthrlyapp:index"))
        else:
            return render(request, 'wthrlyapp/signup.html', {'form': form})
    else:
        form = SignupForm()
    return render(request, 'wthrlyapp/signup.html', {'form': form})
