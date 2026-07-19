from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os

# CORREGIDO - Importar desde backend
from backend.config import HOST, PORT, DEBUG

# CORREGIDO - Importar desde backend.database
from backend.database import crear_tablas

# CORREGIDO - Importar desde backend.routes
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

app = Flask(__name__)

# Configurar CORS
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Crear tablas
crear_tablas()

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
# RUTA PRINCIPAL
# ==========================================

@app.route("/")
def inicio():
    return jsonify({
        "estado": "online",
        "mensaje": "Backend de ZukZuk",
        "version": "1.0.0"
    })

# ==========================================
# SERVIR ARCHIVOS
# ==========================================

@app.route("/uploads/<path:archivo>")
def uploads(archivo):
    try:
        return send_from_directory("uploads", archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Archivo no encontrado"}), 404

@app.route("/uploads/juegos/<path:archivo>")
def uploads_juegos(archivo):
    try:
        return send_from_directory("uploads/juegos", archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Archivo no encontrado"}), 404

@app.route("/uploads/juegos/miniaturas/<path:archivo>")
def uploads_miniaturas(archivo):
    try:
        return send_from_directory("uploads/juegos/miniaturas", archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Archivo no encontrado"}), 404

@app.route("/uploads/avatars/<path:archivo>")
def uploads_avatars(archivo):
    try:
        return send_from_directory("uploads/avatars", archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Archivo no encontrado"}), 404

# ==========================================
# MANEJADORES DE ERRORES
# ==========================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"correcto": False, "mensaje": "Recurso no encontrado"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"correcto": False, "mensaje": "Error interno del servidor"}), 500

# ==========================================
# INICIO
# ==========================================

if __name__ == "__main__":
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("uploads/avatars", exist_ok=True)
    os.makedirs("uploads/portadas", exist_ok=True)
    os.makedirs("uploads/juegos", exist_ok=True)
    os.makedirs("uploads/juegos/miniaturas", exist_ok=True)
    os.makedirs("uploads/juegos/archivos", exist_ok=True)
    
    print("=" * 50)
    print("🚀 ZukZuk Backend Server")
    print("=" * 50)
    print(f"📍 Host: {HOST}")
    print(f"🔌 Puerto: {PORT}")
    print(f"🐛 Debug: {DEBUG}")
    print("=" * 50)
    print("✅ Servidor iniciado correctamente")
    print("=" * 50)
    
    app.run(
        host=HOST,
        port=PORT,
        debug=DEBUG
    )from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os

# CORREGIDO - Importar desde backend
from backend.config import HOST, PORT, DEBUG

# CORREGIDO - Importar desde backend.database
from backend.database import crear_tablas

# CORREGIDO - Importar desde backend.routes
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

app = Flask(__name__)

# Configurar CORS
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Crear tablas
crear_tablas()

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
# RUTA PRINCIPAL
# ==========================================

@app.route("/")
def inicio():
    return jsonify({
        "estado": "online",
        "mensaje": "Backend de ZukZuk",
        "version": "1.0.0"
    })

# ==========================================
# SERVIR ARCHIVOS
# ==========================================

@app.route("/uploads/<path:archivo>")
def uploads(archivo):
    try:
        return send_from_directory("uploads", archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Archivo no encontrado"}), 404

@app.route("/uploads/juegos/<path:archivo>")
def uploads_juegos(archivo):
    try:
        return send_from_directory("uploads/juegos", archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Archivo no encontrado"}), 404

@app.route("/uploads/juegos/miniaturas/<path:archivo>")
def uploads_miniaturas(archivo):
    try:
        return send_from_directory("uploads/juegos/miniaturas", archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Archivo no encontrado"}), 404

@app.route("/uploads/avatars/<path:archivo>")
def uploads_avatars(archivo):
    try:
        return send_from_directory("uploads/avatars", archivo)
    except FileNotFoundError:
        return jsonify({"correcto": False, "mensaje": "Archivo no encontrado"}), 404

# ==========================================
# MANEJADORES DE ERRORES
# ==========================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"correcto": False, "mensaje": "Recurso no encontrado"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"correcto": False, "mensaje": "Error interno del servidor"}), 500

# ==========================================
# INICIO
# ==========================================

if __name__ == "__main__":
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("uploads/avatars", exist_ok=True)
    os.makedirs("uploads/portadas", exist_ok=True)
    os.makedirs("uploads/juegos", exist_ok=True)
    os.makedirs("uploads/juegos/miniaturas", exist_ok=True)
    os.makedirs("uploads/juegos/archivos", exist_ok=True)
    
    print("=" * 50)
    print("🚀 ZukZuk Backend Server")
    print("=" * 50)
    print(f"📍 Host: {HOST}")
    print(f"🔌 Puerto: {PORT}")
    print(f"🐛 Debug: {DEBUG}")
    print("=" * 50)
    print("✅ Servidor iniciado correctamente")
    print("=" * 50)
    
    app.run(
        host=HOST,
        port=PORT,
        debug=DEBUG
    )