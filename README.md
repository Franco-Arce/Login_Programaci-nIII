# ISPC | Portal de Acceso — Actividad Asincrónica 1

Sistema de autenticación fullstack con **Django REST Framework** (backend) y **Angular 19** (frontend), base de datos **Supabase PostgreSQL** y tokens **JWT**.

---

## Arquitectura

```
Actividad Asincronica 1/
├── backend/          # Django 5.1 + DRF
│   ├── apps/
│   │   └── users/    # Modelo, serializers, vistas, URLs
│   ├── config/       # settings, urls, wsgi
│   ├── .env          # Variables de entorno (no se sube a git)
│   ├── .env.example  # Plantilla de variables
│   └── requirements.txt
└── frontend/         # Angular 19
    └── src/
```

### Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Django 5.1 + Django REST Framework |
| Autenticación | JWT via `djangorestframework-simplejwt` |
| Base de datos | PostgreSQL en Supabase (SSL) |
| Cifrado de campos sensibles | `django-encrypted-model-fields` (Fernet AES-128) |
| Frontend | Angular 19 |

---

## Cómo está hecho

### Modelo de usuario (`CustomUser`)

Extiende `AbstractUser` de Django agregando:

- `role` — `alumno` (default) o `admin`
- `bio` — texto libre
- `dni` y `phone` — campos **cifrados en la base de datos** con Fernet (AES-128). Se almacenan como texto encriptado; solo se leen como texto plano en la aplicación usando la `FIELD_ENCRYPTION_KEY`.

### Endpoints de autenticación

Base URL: `http://localhost:8000/api/auth/`

| Método | URL | Auth | Descripción |
|--------|-----|------|-------------|
| `POST` | `register/` | No | Crea un nuevo usuario |
| `POST` | `login/` | No | Devuelve `access`, `refresh` y datos del usuario |
| `POST` | `refresh/` | No | Renueva el `access` token usando el `refresh` |
| `POST` | `logout/` | Sí | Invalida el `refresh` token (blacklist) |
| `GET` | `me/` | Sí | Devuelve el usuario autenticado actual |
| `GET/PATCH` | `profile/` | Sí | Ver y editar el perfil propio |

#### Ejemplo — Register

```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "juan",
  "email": "juan@example.com",
  "password": "Contraseña123!",
  "password2": "Contraseña123!",
  "first_name": "Juan",
  "last_name": "Pérez"
}
```

#### Ejemplo — Login

```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "juan",
  "password": "Contraseña123!"
}
```

Respuesta:
```json
{
  "access": "<JWT access token>",
  "refresh": "<JWT refresh token>",
  "user": {
    "id": 1,
    "username": "juan",
    "email": "juan@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "alumno",
    "bio": "",
    "dni": "",
    "phone": ""
  }
}
```

#### Ejemplo — Logout

```http
POST /api/auth/logout/
Authorization: Bearer <access token>
Content-Type: application/json

{
  "refresh": "<refresh token>"
}
```

### JWT — configuración

- `access` token: expira en **15 minutos**
- `refresh` token: expira en **7 días**
- Al hacer logout, el `refresh` se agrega a una **blacklist** en la base de datos (no puede reutilizarse)
- Al refrescar, se rota automáticamente (el viejo queda en blacklist)

### Seguridad

- Las contraseñas se hashean con el sistema de Django (`PBKDF2`)
- `dni` y `phone` se cifran con Fernet antes de guardarse en Supabase
- Las credenciales se leen desde `.env` (nunca hardcodeadas)
- La conexión a Supabase usa `sslmode: require`
- CORS configurado solo para `http://localhost:4200`

---

## Cómo levantarlo

### Requisitos previos

- Python 3.11+ (testeado en 3.14)
- Node.js 18+ y npm
- Cuenta en [Supabase](https://supabase.com) con un proyecto creado

### 1. Clonar el repositorio

```bash
git clone https://github.com/Franco-Arce/Login_Programaci-nIII.git
cd Login_Programaci-nIII
```

### 2. Configurar el backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Activar (Mac/Linux)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

Crear el archivo `.env` a partir de la plantilla:

```bash
cp .env.example .env
```

Editar `.env` con los datos reales:

```env
SECRET_KEY=una-clave-secreta-larga-y-aleatoria
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Datos de tu proyecto en Supabase (Settings > Database)
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu-password
DB_HOST=db.XXXXXXXXXXXXXXXXXX.supabase.co
DB_PORT=5432

# Generar con el comando de abajo
FIELD_ENCRYPTION_KEY=
```

Generar la clave Fernet para cifrado:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Pegar el resultado en `FIELD_ENCRYPTION_KEY=` del `.env`.

Crear las tablas en Supabase:

```bash
python manage.py migrate
```

Levantar el servidor:

```bash
python manage.py runserver
```

El backend queda disponible en `http://localhost:8000`.

### 3. Configurar el frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Levantar servidor de desarrollo
npm start
```

El frontend queda disponible en `http://localhost:4200`.

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `SECRET_KEY` | Clave secreta de Django (larga y aleatoria) |
| `DEBUG` | `True` en desarrollo, `False` en producción |
| `ALLOWED_HOSTS` | Hosts permitidos separados por coma |
| `DB_NAME` | Nombre de la base (por defecto `postgres`) |
| `DB_USER` | Usuario de la base |
| `DB_PASSWORD` | Contraseña de la base (desde Supabase) |
| `DB_HOST` | Host de Supabase (`db.xxxx.supabase.co`) |
| `DB_PORT` | Puerto PostgreSQL (por defecto `5432`) |
| `FIELD_ENCRYPTION_KEY` | Clave Fernet para cifrar DNI y teléfono |
