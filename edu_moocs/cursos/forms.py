from django import forms
from .models import CursoPreregistro

class CursoPreregistroForm(forms.ModelForm):
    class Meta:
        model = CursoPreregistro
        fields = ['curso', 'telefono', 'ciudad', 'estado']