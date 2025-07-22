from django.shortcuts import render, redirect, get_object_or_404
from .models import Curso, Carrito, CursoEnCarrito, CursoComprado, TotalGastado, Modulo, VideoModulo
from django.contrib.auth.decorators import login_required
from decimal import Decimal
from django.utils import timezone

def lista_cursos(request):
    categoria = request.GET.get('categoria')  # <-- 'categoria' singular
    if categoria:
        cursos = Curso.objects.filter(categoria=categoria)
    else:
        cursos = Curso.objects.all()

    return render(request, 'cursos/catalogo.html', {
        'cursos': cursos,
        'categoria_activa': categoria,
    })

@login_required
def detalle_curso(request, curso_id):
    curso = get_object_or_404(Curso, id=curso_id)
    modulos = curso.modulo.all()
    
    video_id = request.GET.get('video')
    video_seleccionado = None
    if video_id:
        video_seleccionado = VideoModulo.objects.filter(id=video_id, modulo__curso=curso).first()

    return render(request, 'cursos/detalle-curso.html', {
        'curso': curso,
        'modulos': modulos,
        'video_seleccionado': video_seleccionado
    })

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


@login_required
def procesar_compra(request):
    if request.method != 'POST':
        return redirect('ver_carrito')

    try:
        carrito = Carrito.objects.get(usuario=request.user)
    except Carrito.DoesNotExist:
        return redirect('ver_carrito')

    cursos_en_carrito = carrito.cursos.select_related('curso')
    total_a_sumar = Decimal('0.00')

    for curso_en_carrito in cursos_en_carrito:
        curso = curso_en_carrito.curso

        if not CursoComprado.objects.filter(usuario=request.user, curso=curso).exists():
            CursoComprado.objects.create(
                usuario=request.user,
                curso=curso,
                fecha_compra=timezone.now()
            )
            total_a_sumar += curso.precio

    cursos_en_carrito.delete()

    if total_a_sumar > 0:
        total_obj, _ = TotalGastado.objects.get_or_create(usuario=request.user)
        total_obj.total += total_a_sumar
        total_obj.save()

    return redirect('mis_cursos')

def mis_cursos(request):
    cursos_comprados = CursoComprado.objects.filter(usuario=request.user).select_related('curso')
    total_obj = TotalGastado.objects.filter(usuario=request.user).first()
    total_gastado = total_obj.total if total_obj else 0

    return render(request, 'cursos/mis-cursos.html', {
        'cursos': cursos_comprados,
        'total_gastado': total_gastado
    })

