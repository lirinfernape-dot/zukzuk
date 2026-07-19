import os

# Carpeta del backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configuración del servidor
HOST = "127.0.0.1"
PORT = 5000
DEBUG = True

# JWT
SECRET_KEY = "kayxor10"

# Carpetas de subida
UPLOADS = os.path.join(BASE_DIR, "uploads")
UPLOAD_AVATARS = os.path.join(UPLOADS, "avatars")
UPLOAD_PORTADAS = os.path.join(UPLOADS, "portadas")
UPLOAD_JUEGOS = os.path.join(UPLOADS, "juegos")