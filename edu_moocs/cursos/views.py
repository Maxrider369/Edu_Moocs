from django.shortcuts import render, redirect, get_object_or_404
from .models import Curso, Carrito, CursoEnCarrito
from django.contrib.auth.decorators import login_required

def lista_cursos(request):
    cursos = Curso.objects.filter(disponible=True)
    return render(request, 'cursos/catalogo.html', {'cursos': cursos})

@login_required
def agregar_al_carrito(request, curso_id):
    curso = get_object_or_404(Curso, id=curso_id)

    carrito, _ = Carrito.objects.get_or_create(usuario=request.user)

    # Evita duplicados
    if not CursoEnCarrito.objects.filter(carrito=carrito, curso=curso).exists():
        CursoEnCarrito.objects.create(carrito=carrito, curso=curso)

    return redirect('ver_carrito')

@login_required
def ver_carrito(request):
    carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
    cursos = carrito.cursos.all()
    total = sum([c.curso.precio for c in cursos])
    return render(request, 'cursos/carrito.html', {'cursos': cursos, 'total': total})

@login_required
def eliminar_del_carrito(request, curso_id):
    carrito = get_object_or_404(Carrito, usuario=request.user)
    CursoEnCarrito.objects.filter(carrito=carrito, curso_id=curso_id).delete()
    return redirect('ver_carrito')

def detalle_curso(request, curso_id):
    curso = get_object_or_404(Curso, id=curso_id)
    return render(request, 'cursos/detalle-curso.html', {'curso': curso})
