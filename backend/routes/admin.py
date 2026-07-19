from flask import Blueprint, request, jsonify
from middleware.auth_middleware import login_requerido
from database import get_db_connection

admin = Blueprint("admin", __name__)

# ==========================================
# VERIFICAR SI ES ADMIN
# ==========================================

def es_admin(usuario_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT es_admin FROM usuarios WHERE id = ?
    """, (usuario_id,))
    
    resultado = cursor.fetchone()
    conn.close()
    
    return resultado and resultado["es_admin"] == 1

# ==========================================
# OBTENER TODOS LOS USUARIOS (ADMIN)
# ==========================================

@admin.route("/api/admin/users", methods=["GET"])
@login_requerido
def listar_usuarios():
    if not es_admin(request.usuario["id"]):
        return jsonify({
            "correcto": False,
            "mensaje": "No tienes permisos de administrador."
        }), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, nombre, correo, monedas, nivel, fecha_registro
        FROM usuarios
        ORDER BY fecha_registro DESC
    """)
    
    usuarios = cursor.fetchall()
    conn.close()
    
    lista = []
    for usuario in usuarios:
        lista.append({
            "id": usuario["id"],
            "nombre": usuario["nombre"],
            "correo": usuario["correo"],
            "monedas": usuario["monedas"],
            "nivel": usuario["nivel"],
            "fecha_registro": usuario["fecha_registro"]
        })
    
    return jsonify(lista)

# ==========================================
# ELIMINAR USUARIO (ADMIN)
# ==========================================

@admin.route("/api/admin/users/<int:usuario_id>", methods=["DELETE"])
@login_requerido
def eliminar_usuario(usuario_id):
    if not es_admin(request.usuario["id"]):
        return jsonify({
            "correcto": False,
            "mensaje": "No tienes permisos de administrador."
        }), 403
    
    if usuario_id == request.usuario["id"]:
        return jsonify({
            "correcto": False,
            "mensaje": "No puedes eliminarte a ti mismo."
        }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Eliminar todo el contenido del usuario
    cursor.execute("DELETE FROM juegos WHERE creador_id = ?", (usuario_id,))
    cursor.execute("DELETE FROM likes WHERE usuario_id = ?", (usuario_id,))
    cursor.execute("DELETE FROM favoritos WHERE usuario_id = ?", (usuario_id,))
    cursor.execute("DELETE FROM comentarios WHERE usuario_id = ?", (usuario_id,))
    cursor.execute("DELETE FROM amigos WHERE usuario_id = ? OR amigo_id = ?", (usuario_id, usuario_id))
    cursor.execute("DELETE FROM logros_usuario WHERE usuario_id = ?", (usuario_id,))
    cursor.execute("DELETE FROM mensajes WHERE remitente_id = ? OR destinatario_id = ?", (usuario_id, usuario_id))
    cursor.execute("DELETE FROM usuarios WHERE id = ?", (usuario_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "correcto": True,
        "mensaje": "Usuario eliminado correctamente."
    })

# ==========================================
# OBTENER TODOS LOS JUEGOS (ADMIN)
# ==========================================

@admin.route("/api/admin/games", methods=["GET"])
@login_requerido
def listar_juegos_admin():
    if not es_admin(request.usuario["id"]):
        return jsonify({
            "correcto": False,
            "mensaje": "No tienes permisos de administrador."
        }), 403
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT j.*, u.nombre as creador_nombre
        FROM juegos j
        INNER JOIN usuarios u ON u.id = j.creador_id
        ORDER BY j.fecha_creacion DESC
    """)
    
    juegos = cursor.fetchall()
    conn.close()
    
    lista = []
    for juego in juegos:
        lista.append({
            "id": juego["id"],
            "nombre": juego["nombre"],
            "descripcion": juego["descripcion"],
            "creador": juego["creador_nombre"],
            "estado": juego["estado"],
            "visitas": juego["visitas"],
            "likes": juego["likes"],
            "fecha_creacion": juego["fecha_creacion"]
        })
    
    return jsonify(lista)

# ==========================================
# MODERAR JUEGO (CAMBIAR ESTADO)
# ==========================================

@admin.route("/api/admin/games/<int:juego_id>/moderate", methods=["PUT"])
@login_requerido
def moderar_juego(juego_id):
    if not es_admin(request.usuario["id"]):
        return jsonify({
            "correcto": False,
            "mensaje": "No tienes permisos de administrador."
        }), 403
    
    datos = request.get_json()
    estado = datos.get("estado")  # publico, privado, baneado
    
    if estado not in ["publico", "privado", "baneado"]:
        return jsonify({
            "correcto": False,
            "mensaje": "Estado inválido."
        }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE juegos
        SET estado = ?
        WHERE id = ?
    """, (estado, juego_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "correcto": True,
        "mensaje": f"Juego actualizado a {estado}."
    })