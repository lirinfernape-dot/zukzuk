from flask import Flask, jsonify, send_from_directory, send_file
from flask_cors import CORS
import os
import sys

# Agregar el directorio backend al path de Python
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, 'backend'))

# Importar desde backend (YA NO from config, sino from backend.config)
from backend.config import HOST, PORT, DEBUG
from backend.database import crear_tablas
from backend.routes.auth import auth
from backend.routes.games import games
from backend.routes.users import users
from backend.routes.friends import friends
from backend.routes.avatar import avatar
from backend.routes.notifications import notifications
from backend.routes.ranking import ranking
from backend.routes.messages import messages
from backend.routes.shop import shop
from backend.routes.achievements import achievements
from backend.routes.events import events
from backend.routes.stats import stats
from backend.routes.admin import admin

app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')

# Configurar CORS
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Crear tablas
try:
    crear_tablas()
    print("✅ Tablas creadas correctamente")
except Exception as e:
    print(f"❌ Error al crear tablas: {e}")

# Registrar blueprints
app.register_blueprint(auth)
app.register_blueprint(games)
app.register_blueprint(users)
app.register_blueprint(friends)
app.register_blueprint(avatar)
app.register_blueprint(notifications)
app.register_blueprint(ranking)
app.register_blueprint(messages)
app.register_blueprint(shop)
app.register_blueprint(achievements)
app.register_blueprint(events)
app.register_blueprint(stats)
app.register_blueprint(admin)

# ==========================================
# RUTA PRINCIPAL - SIRVE index.html
# ==========================================

@app.route('/')
def index():
    try:
        index_path = os.path.join(BASE_DIR, 'index.html')
        if os.path.exists(index_path):
            return send_file(index_path)
        else:
            return jsonify({"correcto": False, "mensaje": "index.html no encontrado"}), 404
    except Exception as e:
        print(f"Error al servir index.html: {e}")
        return jsonify({"correcto": False, "mensaje": "Error al cargar la página"}), 500

# ==========================================
# SERVIR ARCHIVOS ESTÁTICOS
# ==========================================

@app.route('/<path:path>')
def static_files(path):
    try:
        file_path = os.path.join(BASE_DIR, path)
        if os.path.exists(file_path):
            return send_file(file_path)
        else:
            return jsonify({"correcto": False, "mensaje": "Recurso no encontrado"}), 404
    except Exception as e:
        print(f"Error al servir archivo {path}: {e}")
        return jsonify({"correcto": False, "mensaje": "Error al servir archivo"}), 500

# ==========================================
# SERVIR ARCHIVOS SUBIDOS
# ==========================================

@app.route("/uploads/avatars/<path:archivo>")
def uploads_avatars(archivo):
    try:
        uploads_path = os.path.join(BASE_DIR, "uploads/avatars")
        return send_from_directory(uploads_path, archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Avatar no encontrado"}), 404
    except Exception as e:
        return jsonify({"correcto": False, "mensaje": "Error al servir avatar"}), 500

@app.route("/uploads/juegos/<path:archivo>")
def uploads_juegos(archivo):
    try:
        uploads_path = os.path.join(BASE_DIR, "uploads/juegos")
        return send_from_directory(uploads_path, archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Archivo no encontrado"}), 404
    except Exception as e:
        return jsonify({"correcto": False, "mensaje": "Error al servir archivo"}), 500

@app.route("/uploads/juegos/miniaturas/<path:archivo>")
def uploads_miniaturas(archivo):
    try:
        uploads_path = os.path.join(BASE_DIR, "uploads/juegos/miniaturas")
        return send_from_directory(uploads_path, archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Miniatura no encontrada"}), 404
    except Exception as e:
        return jsonify({"correcto": False, "mensaje": "Error al servir miniatura"}), 500

@app.route("/uploads/<path:archivo>")
def uploads(archivo):
    try:
        uploads_path = os.path.join(BASE_DIR, "uploads")
        return send_from_directory(uploads_path, archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Archivo no encontrado"}), 404
    except Exception as e:
        return jsonify({"correcto": False, "mensaje": "Error al servir archivo"}), 500

# ==========================================
# MANEJADORES DE ERRORES
# ==========================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"correcto": False, "mensaje": "Recurso no encontrado"}), 404

@app.errorhandler(500)
def internal_error(error):
    print(f"Error 500: {error}")
    return jsonify({"correcto": False, "mensaje": "Error interno del servidor"}), 500

# ==========================================
# INICIO
# ==========================================

if __name__ == "__main__":
    try:
        os.makedirs(os.path.join(BASE_DIR, "uploads"), exist_ok=True)
        os.makedirs(os.path.join(BASE_DIR, "uploads/avatars"), exist_ok=True)
        os.makedirs(os.path.join(BASE_DIR, "uploads/portadas"), exist_ok=True)
        os.makedirs(os.path.join(BASE_DIR, "uploads/juegos"), exist_ok=True)
        os.makedirs(os.path.join(BASE_DIR, "uploads/juegos/miniaturas"), exist_ok=True)
        os.makedirs(os.path.join(BASE_DIR, "uploads/juegos/archivos"), exist_ok=True)
        print("📁 Carpetas creadas correctamente")
    except Exception as e:
        print(f"❌ Error al crear carpetas: {e}")
    
    print("=" * 50)
    print("🚀 ZukZuk Backend Server")
    print("=" * 50)
    print(f"📍 Host: {HOST}")
    print(f"🔌 Puerto: {PORT}")
    print(f"🐛 Debug: {DEBUG}")
    print(f"📁 Base directory: {BASE_DIR}")
    print("=" * 50)
    print("✅ Servidor iniciado correctamente")
    print("=" * 50)
    
    app.run(
        host=HOST,
        port=PORT,
        debug=DEBUG
    )