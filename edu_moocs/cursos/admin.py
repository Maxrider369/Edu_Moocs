from django.contrib import admin
from django.utils.safestring import mark_safe
from .models import Curso, Carrito, CursoEnCarrito, CursoComprado, TotalGastado

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
