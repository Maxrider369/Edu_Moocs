from django.shortcuts import render
from cursos.models import Curso

# Create your views here.
def principal(request):
    cursos_disponibles = Curso.objects.filter(disponible=True)
    return render(request, 'inicio/index.html', {'cursos': cursos_disponibles})


def contacto(request):
    return render(request, 'inicio/contacto.html')

