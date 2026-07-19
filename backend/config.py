import os

# Carpeta del backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configuración del servidor
HOST = "0.0.0.0"
PORT = 10000
DEBUG = False

# JWT
SECRET_KEY = "kayxor10"

# Carpetas de subida
UPLOADS = os.path.join(BASE_DIR, "uploads")
UPLOAD_AVATARS = os.path.join(UPLOADS, "avatars")
UPLOAD_PORTADAS = os.path.join(UPLOADS, "portadas")
UPLOAD_JUEGOS = os.path.join(UPLOADS, "juegos")

# Configuración para Render
RENDER = os.environ.get('RENDER', False)import os

# Carpeta del backend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configuración del servidor
HOST = "0.0.0.0"
PORT = 10000
DEBUG = False

# JWT
SECRET_KEY = "kayxor10"

# Carpetas de subida
UPLOADS = os.path.join(BASE_DIR, "uploads")
UPLOAD_AVATARS = os.path.join(UPLOADS, "avatars")
UPLOAD_PORTADAS = os.path.join(UPLOADS, "portadas")
UPLOAD_JUEGOS = os.path.join(UPLOADS, "juegos")

# Configuración para Render
RENDER = os.environ.get('RENDER', False)