from django.db import models
from django.contrib.auth.models import User

from django.contrib.auth.models import User

class Curso(models.Model):
    categorias = [
        ('Programacion', 'Programacion'), 
        ('Desarrollo web', 'Desarrollo web'),
        ('Desarrollo movil','Desarrollo movil'), 
        ('Ciberseguridad', 'Ciberseguridad'),
        ('Diseño UI/UX', 'Diseño UI/UX'),
        ('Testing', 'Testing')
    ]
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=8, decimal_places=2)
    imagen = models.ImageField(upload_to='cursos/', null=True, blank=True)
    disponible = models.BooleanField(default=True)
    categoria = models.CharField(max_length=100, choices=categorias)
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True)

    # 🔹 Campo maestro
    maestro = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'groups__name': 'maestro'},
        related_name='cursos'
    )

    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name = "Curso"
        verbose_name_plural = "Cursos disponibles"

class Carrito(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"Carrito de {self.usuario.username}"

class CursoEnCarrito(models.Model):
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, related_name='cursos')
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    fecha_agregado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.curso.nombre

class CursoComprado(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cursos_comprados')
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE)
    fecha_compra = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} compró {self.curso.nombre}"
        

    class Meta:
        unique_together = ('usuario', 'curso')  # Evita compras duplicadas
        verbose_name = "Alumnos inscritos"
        verbose_name_plural = "alumnos inscritos"

class TotalGastado(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='total_gastado')
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.usuario.username} ha gastado ${self.total}"

class Modulo(models.Model):
    curso = models.ForeignKey(Curso, on_delete=models.CASCADE, related_name='modulo')
    titulo = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.curso.nombre} - {self.titulo}"

class VideoModulo(models.Model):
    modulo = models.ForeignKey(Modulo, on_delete=models.CASCADE, related_name='video')
    titulo = models.CharField(max_length=100)
    video_url = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.modulo.titulo} - {self.titulo}"
    
from django.contrib.auth.models import User

class CursoPreregistro(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cursos_preregistrados')
    curso = models.ForeignKey("Curso", on_delete=models.CASCADE)
    telefono = models.IntegerField()
    ciudad = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)
    fecha_preregistro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} se registró en {self.curso.nombre}"

    class Meta:
        verbose_name = "Pre-registro de Curso"
        verbose_name_plural = "Pre-registros de Cursos"

class Recurso(models.Model):
    TIPOS = [
        ('pdf', 'PDF'),
        ('doc', 'Word'),
        ('ppt', 'PowerPoint'),
        ('img', 'Imagen'),
        ('otro', 'Otro'),
    ]

    curso = models.ForeignKey("Curso", on_delete=models.CASCADE, related_name="recursos")
    nombre = models.CharField(max_length=150)
    archivo = models.FileField(upload_to="recursos/")
    tipo = models.CharField(max_length=10, choices=TIPOS, default="otro")
    fecha_subida = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"