from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Curso, Carrito, CursoEnCarrito, CursoComprado, TotalGastado, Modulo, VideoModulo, CursoPreregistro

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

# Admin de CursoComprado
@admin.register(CursoComprado)
class CursoCompradoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'curso', 'fecha_compra')
    list_filter = ('fecha_compra',)
    search_fields = ('usuario__username', 'curso__nombre')

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

@admin.register(CursoPreregistro)
class CursoPreregistroAdmin(admin.ModelAdmin):
    list_display = ('get_nombre_usuario', 'get_email_usuario', 'curso', 'telefono', 'ciudad', 'estado', 'fecha_preregistro')
    list_filter = ('fecha_preregistro', 'ciudad', 'estado')
    search_fields = ('usuario__username', 'usuario__first_name', 'usuario__email', 'curso__nombre', 'telefono', 'ciudad', 'estado')

    def get_nombre_usuario(self, obj):
        return obj.usuario.get_full_name() or obj.usuario.username
    get_nombre_usuario.short_description = 'Nombre Usuario'

    def get_email_usuario(self, obj):
        return obj.usuario.email
    get_email_usuario.short_description = 'Correo Usuario'