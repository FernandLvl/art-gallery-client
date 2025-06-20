# 🎨 Galería de Arte - Proyecto Escolar

Este proyecto es una **aplicación web distribuida** compuesta por una **API RESTful** en Python (FastAPI) y un cliente HTML/JS. La plataforma permite que dos tipos de usuarios (Artistas y Observadores) interactúen mediante obras, subastas y ofertas.

---

## 🧱 Estructura general

- `art-gallery-api/`: Backend con FastAPI (API REST)
- `art-gallery-client/`: Interfaz HTML estática

---

## ⚙️ Requisitos para ejecutar el backend

- Python 3.10 o superior
- pip (administrador de paquetes)
- Entorno virtual (recomendado)

---

## 📦 Instalación del frontend

1. Clonar el repositorio:
```bash
git clone https://github.com/FernandLvl/art-gallery-client.git
cd art-gallery-client
```

2. Inicia un servidor web local (Se puede usar Python si ya lo tienes instalado):
```bash
python -m http.server 8080
```

## 👥 Roles y funcionalidades
### Artista:
- Registro e inicio de sesión

- Subir obras de arte

- Iniciar subastas

- Ver sus obras y subastas

### Observador:
- Navegar por obras y subastas activas

- Ver detalles de subastas

- Hacer ofertas en subastas

- Ver historial de sus ofertas

## 🔐 Seguridad
- Autenticación con JWT

- Cifrado de contraseñas con bcrypt

- Acceso basado en roles

- Protección de endpoints sensibles
