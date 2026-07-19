from flask import Blueprint, request, jsonify
from middleware.auth_middleware import login_requerido
from services.user_service import obtener_perfil, actualizar_perfil, actualizar_avatar_usuario, actualizar_biografia_usuario, actualizar_contrasena_usuario
from database import get_db_connection
from werkzeug.security import check_password_hash
import uuid
import os
from werkzeug.utils import secure_filename

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
    
    print("=== SUBIENDO AVATAR ===")
    print(f"Usuario ID: {usuario_id}")
    print(f"Archivos recibidos: {request.files}")
    
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
    
    print(f"Archivo: {archivo.filename}")
    print(f"Tamaño: {archivo.content_length}")
    
    # Validar extensión
    extension = archivo.filename.split(".")[-1].lower()
    if extension not in ["jpg", "jpeg", "png", "gif", "webp"]:
        return jsonify({
            "correcto": False,
            "mensaje": "Formato no permitido. Usa JPG, PNG, GIF o WEBP."
        }), 400
    
    # Validar tamaño (5MB)
    archivo.seek(0, 2)
    tamanio = archivo.tell()
    archivo.seek(0)
    if tamanio > 5 * 1024 * 1024:
        return jsonify({
            "correcto": False,
            "mensaje": "El archivo es demasiado grande (máx 5MB)."
        }), 400
    
    # Generar nombre único
    nombre_archivo = str(uuid.uuid4()) + "." + extension
    print(f"Nombre generado: {nombre_archivo}")
    
    # Crear carpeta si no existe
    carpeta = "uploads/avatars"
    os.makedirs(carpeta, exist_ok=True)
    print(f"Carpeta: {carpeta}")
    
    # Guardar archivo
    ruta_completa = os.path.join(carpeta, nombre_archivo)
    print(f"Ruta completa: {ruta_completa}")
    
    archivo.save(ruta_completa)
    print(f"✅ Archivo guardado en: {ruta_completa}")
    
    # Verificar que el archivo se guardó
    if os.path.exists(ruta_completa):
        print(f"✅ Archivo existe: {ruta_completa}")
        print(f"Tamaño: {os.path.getsize(ruta_completa)} bytes")
    else:
        print(f"❌ Error: El archivo no se guardó correctamente")
        return jsonify({
            "correcto": False,
            "mensaje": "Error al guardar el archivo."
        }), 500
    
    # Actualizar en base de datos
    from services.user_service import actualizar_avatar_usuario
    resultado = actualizar_avatar_usuario(usuario_id, nombre_archivo)
    print(f"Actualización en BD: {resultado}")
    
    # Verificar que se actualizó en la BD
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT avatar FROM usuarios WHERE id = ?", (usuario_id,))
    avatar_bd = cursor.fetchone()
    conn.close()
    print(f"Avatar en BD después de actualizar: {avatar_bd[0] if avatar_bd else 'None'}")
    
    return jsonify({
        "correcto": True,
        "mensaje": "Avatar actualizado correctamente.",
        "avatar": nombre_archivo,
        "url": f"http://127.0.0.1:5000/uploads/avatars/{nombre_archivo}"
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