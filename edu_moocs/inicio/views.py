from django.shortcuts import render
from cursos.models import Curso

# Create your views here.
def principal(request):
    cursos_destacados = Curso.objects.all()[:3]
    return render(request, 'inicio/index.html', {'cursos': cursos_destacados})


def contacto(request):
    return render(request, 'inicio/contacto.html')

