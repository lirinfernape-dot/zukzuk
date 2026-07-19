from flask import Blueprint, request, jsonify
from backend.middleware.auth_middleware import login_requerido
from backend.database import get_db_connection

messages = Blueprint("messages", __name__)

@messages.route("/api/messages/send", methods=["POST"])
@login_requerido
def enviar_mensaje():
    remitente_id = request.usuario["id"]
    datos = request.get_json()
    
    destinatario_id = datos.get("destinatario_id")
    mensaje = datos.get("mensaje")
    
    if not destinatario_id or not mensaje:
        return jsonify({
            "correcto": False,
            "mensaje": "Destinatario y mensaje requeridos."
        }), 400
    
    if remitente_id == destinatario_id:
        return jsonify({
            "correcto": False,
            "mensaje": "No puedes enviarte un mensaje a ti mismo."
        }), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO mensajes (remitente_id, destinatario_id, mensaje)
        VALUES (?, ?, ?)
    """, (remitente_id, destinatario_id, mensaje))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "correcto": True,
        "mensaje": "Mensaje enviado correctamente."
    })

@messages.route("/api/messages/inbox", methods=["GET"])
@login_requerido
def bandeja_entrada():
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT m.*, u.nombre as remitente_nombre, u.avatar as remitente_avatar
        FROM mensajes m
        INNER JOIN usuarios u ON u.id = m.remitente_id
        WHERE m.destinatario_id = ?
        ORDER BY m.fecha DESC
    """, (usuario_id,))
    
    mensajes = cursor.fetchall()
    conn.close()
    
    lista = []
    for msg in mensajes:
        lista.append({
            "id": msg["id"],
            "remitente_id": msg["remitente_id"],
            "remitente_nombre": msg["remitente_nombre"],
            "remitente_avatar": msg["remitente_avatar"],
            "mensaje": msg["mensaje"],
            "leido": bool(msg["leido"]),
            "fecha": msg["fecha"]
        })
    
    return jsonify(lista)

@messages.route("/api/messages/sent", methods=["GET"])
@login_requerido
def mensajes_enviados():
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT m.*, u.nombre as destinatario_nombre
        FROM mensajes m
        INNER JOIN usuarios u ON u.id = m.destinatario_id
        WHERE m.remitente_id = ?
        ORDER BY m.fecha DESC
    """, (usuario_id,))
    
    mensajes = cursor.fetchall()
    conn.close()
    
    lista = []
    for msg in mensajes:
        lista.append({
            "id": msg["id"],
            "destinatario_id": msg["destinatario_id"],
            "destinatario_nombre": msg["destinatario_nombre"],
            "mensaje": msg["mensaje"],
            "leido": bool(msg["leido"]),
            "fecha": msg["fecha"]
        })
    
    return jsonify(lista)

@messages.route("/api/messages/<int:mensaje_id>/read", methods=["PUT"])
@login_requerido
def marcar_mensaje_leido(mensaje_id):
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE mensajes
        SET leido = 1
        WHERE id = ? AND destinatario_id = ?
    """, (mensaje_id, usuario_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "correcto": True,
        "mensaje": "Mensaje marcado como leído."
    })

@messages.route("/api/messages/unread/count", methods=["GET"])
@login_requerido
def contar_mensajes_no_leidos():
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT COUNT(*) as total FROM mensajes
        WHERE destinatario_id = ? AND leido = 0
    """, (usuario_id,))
    
    resultado = cursor.fetchone()
    conn.close()
    
    return jsonify({
        "no_leidos": resultado["total"] if resultado else 0
    })