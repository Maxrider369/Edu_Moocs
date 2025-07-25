from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from .models import Curso, Carrito, CursoEnCarrito, CursoComprado, TotalGastado, Modulo, VideoModulo, CursoPreregistro
from django.contrib.auth.decorators import login_required
from decimal import Decimal
from django.utils import timezone
from cursos.forms import CursoPreregistroForm
from django.contrib import messages


def lista_cursos(request):
    categoria = request.GET.get('categoria')
    
    if categoria:
        cursos = Curso.objects.filter(categoria=categoria, disponible=True)
        cursos_disponible = Curso.objects.filter(categoria=categoria, disponible=False)
    else:
        cursos = Curso.objects.filter(disponible=True)
        cursos_disponible = Curso.objects.filter(disponible=False)

    # Obtener los pre-registros del usuario actual
    cursos_preregistrado = CursoPreregistro.objects.filter(usuario=request.user)

    # Crear un diccionario curso_id -> preregistro
    prereg_map = {pr.curso_id: pr for pr in cursos_preregistrado}

    # Adjuntar el preregistro a cada curso como un atributo extra
    for curso in cursos_disponible:
        curso.prereg = prereg_map.get(curso.id)

    return render(request, 'cursos/catalogo.html', {
        'cursos': cursos,
        'cursos_disponible': cursos_disponible,
        'usuario': request.user,
    })

@login_required
def detalle_curso(request, curso_id):
    curso = get_object_or_404(Curso, id=curso_id)
    modulos = curso.modulo.all()
    
    video_id = request.GET.get('video')
    video_seleccionado = None
    video_anterior = None
    video_siguiente = None

    videos = list(VideoModulo.objects.filter(modulo__curso=curso).order_by('id'))

    
    if video_id:
        try:
            video_id_int = int(video_id.strip())

            for idx, video in enumerate(videos):
                if video.id == video_id_int:
                    video_seleccionado = video
                    if idx > 0:
                        video_anterior = videos[idx - 1]
                    if idx < len(videos) - 1:
                        video_siguiente = videos[idx + 1]
                    break  # Salimos del bucle al encontrar el video

        except (ValueError, TypeError):
            pass  #
        except (ValueError, TypeError):
            video_seleccionado = None
            video_anterior = None
            video_siguiente = None
    return render(request, 'cursos/detalle-curso.html', {
        'curso': curso,
        'modulos': modulos,
        'video_seleccionado': video_seleccionado,
        'video_anterior': video_anterior,
        'video_siguiente': video_siguiente,
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
    cursos_preregistrado = CursoPreregistro.objects.filter(usuario=request.user).select_related('curso')
    total_obj = TotalGastado.objects.filter(usuario=request.user).first()
    total_gastado = total_obj.total if total_obj else 0

    return render(request, 'cursos/mis-cursos.html', {
        'cursos': cursos_comprados,
        'cursos_preregistrado': cursos_preregistrado,
        'total_gastado': total_gastado,
    })



def preregistro(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return redirect('login')

        # obtiene datos...
        curso_id = request.POST.get('curso_id')
        # ...

        curso = get_object_or_404(Curso, id=curso_id)

        if CursoPreregistro.objects.filter(usuario=request.user, curso=curso).exists():
            messages.error(request, "Ya estás preregistrado en este curso.")
        else:
            CursoPreregistro.objects.create(
                usuario=request.user,
                curso=curso,
                telefono=request.POST.get('telefono'),
                ciudad=request.POST.get('ciudad'),
                estado=request.POST.get('estado'),
            )
            messages.success(request, "¡Preregistro exitoso!")

        return redirect('lista_cursos')  # redirige para limpiar POST

    # Aquí GET solo muestra la página sin mensajes directos
    return render(request, 'cursos/catalogo.html', {
        # cualquier contexto necesario
    })