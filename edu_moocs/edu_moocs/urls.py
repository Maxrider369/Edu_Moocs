"""
URL configuration for edu_moocs project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from usuarios import views as usuarios_views
from inicio import views
from cursos import views as cursos_views
from django.conf.urls.static import static
from django.conf import settings


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.principal, name="principal"),
    path('contacto/', views.contacto, name="contacto"),
    path('cursos/', cursos_views.lista_cursos, name='lista_cursos'),
    path('registro/', usuarios_views.registro_basico, name='registro'),
    path('mis-cursos/', cursos_views.mis_cursos, name='mis_cursos'),
    path('comprar/', cursos_views.procesar_compra, name='procesar_compra'),
    path('login/', usuarios_views.login_basico, name='login'),
    path('logout/', usuarios_views.logout_basico, name='logout'),
    path('perfil/<int:id>/', usuarios_views.editar_usuario, name='perfil'),
    path('carrito/', cursos_views.ver_carrito, name='ver_carrito'),
    path('agregar/<int:curso_id>/', cursos_views.agregar_al_carrito, name='agregar_al_carrito'),
    path('eliminar/<int:curso_id>/', cursos_views.eliminar_del_carrito, name='eliminar_del_carrito'),
    path('curso/<int:curso_id>/', cursos_views.detalle_curso, name='detalle_curso'),


]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)