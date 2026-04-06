from django.contrib.auth.models import AbstractUser
from django.db import models
from encrypted_model_fields.fields import EncryptedCharField


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('alumno', 'Alumno'),
        ('admin', 'Administrador'),
    ]

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='alumno',
        verbose_name='Rol',
    )
    bio = models.TextField(blank=True, verbose_name='Biografía')

    # Campos sensibles cifrados en la base de datos
    dni = EncryptedCharField(max_length=20, blank=True, verbose_name='DNI')
    phone = EncryptedCharField(max_length=20, blank=True, verbose_name='Teléfono')

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self) -> str:
        return f'{self.username} ({self.get_role_display()})'
