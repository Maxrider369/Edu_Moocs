from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import User
from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Curso, Carrito, CursoEnCarrito, CursoComprado, TotalGastado, Modulo, VideoModulo, CursoPreregistro
from django.contrib.admin import RelatedOnlyFieldListFilter
from .models import Recurso

admin.site.register(Recurso)

# Filtro lateral por maestro
class MaestroFilter(admin.SimpleListFilter):
    title = 'Maestro'
    parameter_name = 'maestro'

    def lookups(self, request, model_admin):
        maestros = User.objects.filter(groups__name="maestro")
        return [(m.id, m.get_full_name() or m.username) for m in maestros]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(curso__maestro_id=self.value())
        return queryset

@admin.register(CursoPreregistro)
class CursoPreregistroAdmin(admin.ModelAdmin):
    list_display = ('get_nombre_usuario', 'get_email_usuario', 'curso', 'telefono', 'ciudad', 'estado', 'fecha_preregistro')
    list_filter = ('fecha_preregistro', 'ciudad', 'estado', MaestroFilter)
    search_fields = ('usuario__username', 'usuario__first_name', 'usuario__email', 'curso__nombre', 'telefono', 'ciudad', 'estado')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Si es maestro, mostrar solo sus cursos
        if request.user.groups.filter(name='maestro').exists():
            return qs.filter(curso__maestro=request.user)
        # Admin u otros usuarios, mostrar todos los preregistros que tengan maestro
        return qs.filter(curso__maestro__isnull=False)

    def get_nombre_usuario(self, obj):
        return obj.usuario.get_full_name() or obj.usuario.username
    get_nombre_usuario.short_description = 'Nombre Usuario'

    def get_email_usuario(self, obj):
        return obj.usuario.email
    get_email_usuario.short_description = 'Correo Usuario'

        
# Personalización del admin de Curso
@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'disponible', 'imagen_preview')
    list_filter = ('disponible',)
    search_fields = ('nombre', 'descripcion')
    readonly_fields = ('imagen_preview',)

    def imagen_preview(self, obj):
        if obj.imagen:
            return mark_safe(f'<img src="{obj.imagen.url}" width="100" height="100" />')
        return "Sin imagen"
    imagen_preview.short_description = "Vista previa"

# CursoEnCarrito inline
class CursoEnCarritoInline(admin.TabularInline):
    model = CursoEnCarrito
    extra = 0

# Admin de Carrito
@admin.register(Carrito)
class CarritoAdmin(admin.ModelAdmin):
    list_display = ('usuario',)
    inlines = [CursoEnCarritoInline]

# Admin de CursoEnCarrito
@admin.register(CursoEnCarrito)
class CursoEnCarritoAdmin(admin.ModelAdmin):
    list_display = ('carrito', 'curso', 'fecha_agregado')
    list_filter = ('fecha_agregado',)
    search_fields = ('carrito__usuario__username', 'curso__nombre')

@admin.register(CursoComprado)
class CursoCompradoAdmin(admin.ModelAdmin):
    list_display = ('get_nombre_usuario', 'get_email_usuario', 'curso', 'fecha_compra')
    search_fields = ('usuario__username', 'usuario__first_name', 'usuario__email', 'curso__nombre')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Si el usuario es maestro, solo mostrar cursos que él imparte
        if request.user.groups.filter(name='maestro').exists():
            return qs.filter(curso__maestro=request.user)
        # Admin u otros usuarios ven todo
        return qs.all()

    def get_nombre_usuario(self, obj):
        return obj.usuario.get_full_name() or obj.usuario.username
    get_nombre_usuario.short_description = 'Nombre Usuario'

    def get_email_usuario(self, obj):
        return obj.usuario.email
    get_email_usuario.short_description = 'Correo Usuario'
# Admin de TotalGastado
@admin.register(TotalGastado)
class TotalGastadoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'total')
    search_fields = ('usuario__username',)

@admin.register(Modulo)
class ModuloAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'curso')  # muestra módulo y curso

@admin.register(VideoModulo)
class VideoModuloAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'modulo','video_url')

class MaestroFilter(admin.SimpleListFilter):
    title = _('Maestro')
    parameter_name = 'maestro'

    def lookups(self, request, model_admin):
        # Todos los usuarios en el grupo 'maestro'
        maestros = User.objects.filter(groups__name='maestro')
        return [(m.id, m.get_full_name() or m.username) for m in maestros]

    def queryset(self, request, queryset):
        if self.value():
            # Filtra los preregistros cuyo usuario es el maestro seleccionado
            return queryset.filter(usuario__id=self.value())
        return queryset

