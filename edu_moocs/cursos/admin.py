from django.contrib import admin
from .models import Curso, Carrito, CursoEnCarrito
from django.utils.html import mark_safe

# Personalización del admin de Curso
@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'disponible', 'imagen_preview')  # Añadido aquí también
    list_filter = ('disponible',)
    search_fields = ('nombre', 'descripcion')
    readonly_fields = ('imagen_preview',)

    # ✅ Método dentro de la clase
    def imagen_preview(self, obj):
        if obj.imagen:
            return mark_safe(f'<img src="{obj.imagen.url}" width="100" height="100" style="object-fit: cover;" />')
        return "Sin imagen"
    
    imagen_preview.short_description = "Vista previa"

# ✅ Títulos personalizados del admin
admin.site.site_header = "Administración de alumnos y Cursos"
admin.site.site_title = "Panel Admin"
admin.site.index_title = "Bienvenido al Panel de Administración"