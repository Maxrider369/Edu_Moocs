from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

class RegistroBasicoForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(label='Nombre', required=True)  # <-- Agregado

    class Meta:
        model = User
        fields = ['username', 'first_name', 'email', 'password1', 'password2']  # <-- Agregado a fields


class EditarUsuarioForm(forms.ModelForm):
    password = forms.CharField(
        required=False,
        widget=forms.PasswordInput,
        help_text='Déjalo vacío si no deseas cambiar la contraseña.'
    )

    class Meta:
        model = User
        fields = ['first_name', 'username', 'email',]


