from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Curso, Carrito, CursoEnCarrito

# Personalización del admin de Curso
@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'disponible', 'imagen_preview')
    list_filter = ('disponible',)
    search_fields = ('nombre', 'descripcion')
    readonly_fields = ('imagen_preview',)

    # Mostrar imagen en admin
    def imagen_preview(self, obj):
        if obj.imagen:
            return mark_safe(f'<img src="{obj.imagen.url}" width="100" height="100" />')
        return "Sin imagen"
    imagen_preview.short_description = "Vista previa"

# CursoEnCarrito inline (para mostrar en el admin del carrito)
class CursoEnCarritoInline(admin.TabularInline):
    model = CursoEnCarrito
    extra = 0

# Personalización del admin de Carrito
@admin.register(Carrito)
class CarritoAdmin(admin.ModelAdmin):
    list_display = ('usuario',)
    inlines = [CursoEnCarritoInline]

# Registro directo si no necesitas personalización extra
@admin.register(CursoEnCarrito)
class CursoEnCarritoAdmin(admin.ModelAdmin):
    list_display = ('carrito', 'curso', 'fecha_agregado')
    list_filter = ('fecha_agregado',)
    search_fields = ('carrito__usuario__username', 'curso__nombre')
