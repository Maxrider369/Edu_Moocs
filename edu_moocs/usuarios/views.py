from django.shortcuts import render, redirect
from .forms import RegistroBasicoForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import EditarUsuarioForm
from django.shortcuts import render, get_object_or_404, redirect

# Registro
def registro_basico(request):
    if request.method == 'POST':
        form = RegistroBasicoForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('principal')  # Redirige a la página principal
    else:
        form = RegistroBasicoForm()
    return render(request, 'usuarios/registro.html', {'form': form})

# Login
def login_basico(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            return redirect('principal')
    else:
        form = AuthenticationForm()
    return render(request, 'usuarios/login.html', {'form': form})

# Logout
def logout_basico(request):
    logout(request)
    return redirect('principal')

# Editar perfil


@login_required
def editar_usuario(request, id):
    usuario = get_object_or_404(User, id=id)

    if request.method == 'POST':
        form = EditarUsuarioForm(request.POST, instance=usuario)
        if form.is_valid():
            user = form.save(commit=False)
            nueva_password = form.cleaned_data.get('password')

            if nueva_password:
                user.set_password(nueva_password)
                user.save()

                # Reautenticar
                user = authenticate(username=user.username, password=nueva_password)
                if user:
                    login(request, user)
            else:
                user.save()

            return redirect('perfil', id=user.id)
    else:
        form = EditarUsuarioForm(instance=usuario)

    return render(request, 'usuarios/perfil.html', {'form': form, 'usuario': usuario})
