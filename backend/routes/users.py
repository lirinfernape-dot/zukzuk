from flask import Blueprint, request, jsonify
from backend.middleware.auth_middleware import login_requerido
from backend.services.user_service import (
    obtener_perfil, actualizar_perfil, actualizar_avatar_usuario,
    actualizar_biografia_usuario, actualizar_contrasena_usuario
)
from backend.database import get_db_connection
from werkzeug.security import check_password_hash
import uuid
import os

users = Blueprint("users", __name__)

@users.route("/api/users/perfil", methods=["GET"])
@login_requerido
def perfil():
    usuario_id = request.usuario["id"]
    perfil = obtener_perfil(usuario_id)
    
    if perfil:
        return jsonify({
            "correcto": True,
            "usuario": perfil
        })
    
    return jsonify({
        "correcto": False,
        "mensaje": "Usuario no encontrado"
    }), 404

@users.route("/api/users/perfil/<int:id_usuario>", methods=["GET"])
@login_requerido
def perfil_publico(id_usuario):
    perfil = obtener_perfil(id_usuario)
    
    if perfil:
        return jsonify({
            "correcto": True,
            "usuario": perfil
        })
    
    return jsonify({
        "correcto": False,
        "mensaje": "Usuario no encontrado"
    }), 404

@users.route("/api/users/perfil", methods=["PUT"])
@login_requerido
def actualizar():
    usuario_id = request.usuario["id"]
    datos = request.get_json()
    
    correcto = actualizar_perfil(
        usuario_id,
        datos.get("nombre"),
        datos.get("genero")
    )
    
    if correcto:
        return jsonify({
            "correcto": True,
            "mensaje": "Perfil actualizado"
        })
    
    return jsonify({
        "correcto": False,
        "mensaje": "Error al actualizar"
    }), 500

@users.route("/api/users/avatar", methods=["POST"])
@login_requerido
def actualizar_avatar():
    usuario_id = request.usuario["id"]
    
    if "avatar" not in request.files:
        return jsonify({
            "correcto": False,
            "mensaje": "No se envió ningún archivo."
        }), 400
    
    archivo = request.files["avatar"]
    
    if archivo.filename == "":
        return jsonify({
            "correcto": False,
            "mensaje": "Archivo inválido."
        }), 400
    
    extension = archivo.filename.split(".")[-1].lower()
    if extension not in ["jpg", "jpeg", "png", "gif", "webp"]:
        return jsonify({
            "correcto": False,
            "mensaje": "Formato no permitido. Usa JPG, PNG, GIF o WEBP."
        }), 400
    
    archivo.seek(0, 2)
    tamanio = archivo.tell()
    archivo.seek(0)
    if tamanio > 5 * 1024 * 1024:
        return jsonify({
            "correcto": False,
            "mensaje": "El archivo es demasiado grande (máx 5MB)."
        }), 400
    
    nombre_archivo = str(uuid.uuid4()) + "." + extension
    carpeta = "uploads/avatars"
    os.makedirs(carpeta, exist_ok=True)
    
    ruta = os.path.join(carpeta, nombre_archivo)
    archivo.save(ruta)
    
    actualizar_avatar_usuario(usuario_id, nombre_archivo)
    
    return jsonify({
        "correcto": True,
        "mensaje": "Avatar actualizado correctamente.",
        "avatar": nombre_archivo
    })

@users.route("/api/users/biografia", methods=["PUT"])
@login_requerido
def actualizar_biografia():
    usuario_id = request.usuario["id"]
    datos = request.get_json()
    biografia = datos.get("biografia")
    
    if biografia is None:
        return jsonify({
            "correcto": False,
            "mensaje": "Biografía requerida"
        }), 400
    
    correcto = actualizar_biografia_usuario(usuario_id, biografia)
    
    if correcto:
        return jsonify({
            "correcto": True,
            "mensaje": "Biografía actualizada"
        })
    
    return jsonify({
        "correcto": False,
        "mensaje": "Error al actualizar biografía"
    }), 500

@users.route("/api/users/password", methods=["PUT"])
@login_requerido
def cambiar_contrasena():
    usuario_id = request.usuario["id"]
    datos = request.get_json()
    
    actual = datos.get("actual")
    nueva = datos.get("nueva")
    
    if not actual or not nueva:
        return jsonify({
            "correcto": False,
            "mensaje": "Contraseña actual y nueva requeridas."
        }), 400
    
    if len(nueva) < 6:
        return jsonify({
            "correcto": False,
            "mensaje": "La nueva contraseña debe tener al menos 6 caracteres."
        }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT contrasena FROM usuarios WHERE id = ?", (usuario_id,))
    usuario = cursor.fetchone()
    
    if not usuario:
        conn.close()
        return jsonify({
            "correcto": False,
            "mensaje": "Usuario no encontrado."
        }), 404
    
    if not check_password_hash(usuario["contrasena"], actual):
        conn.close()
        return jsonify({
            "correcto": False,
            "mensaje": "Contraseña actual incorrecta."
        }), 401
    
    actualizar_contrasena_usuario(usuario_id, nueva)
    conn.close()
    
    return jsonify({
        "correcto": True,
        "mensaje": "Contraseña cambiada correctamente."
    })