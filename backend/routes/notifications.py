from flask import Blueprint, request, jsonify
from backend.middleware.auth_middleware import login_requerido
from backend.database import get_db_connection

notifications = Blueprint("notifications", __name__)

@notifications.route("/api/notifications", methods=["GET"])
@login_requerido
def obtener_notificaciones():
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM notificaciones
        WHERE usuario_id = ?
        ORDER BY fecha DESC
        LIMIT 50
    """, (usuario_id,))
    
    notificaciones = cursor.fetchall()
    conn.close()
    
    lista = []
    for noti in notificaciones:
        lista.append({
            "id": noti["id"],
            "tipo": noti["tipo"],
            "mensaje": noti["mensaje"],
            "leido": bool(noti["leido"]),
            "fecha": noti["fecha"]
        })
    
    return jsonify(lista)

@notifications.route("/api/notifications/<int:notificacion_id>/read", methods=["PUT"])
@login_requerido
def marcar_leida(notificacion_id):
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE notificaciones
        SET leido = 1
        WHERE id = ? AND usuario_id = ?
    """, (notificacion_id, usuario_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "correcto": True,
        "mensaje": "Notificación marcada como leída."
    })

@notifications.route("/api/notifications/unread/count", methods=["GET"])
@login_requerido
def contar_no_leidas():
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT COUNT(*) as total FROM notificaciones
        WHERE usuario_id = ? AND leido = 0
    """, (usuario_id,))
    
    resultado = cursor.fetchone()
    conn.close()
    
    return jsonify({
        "no_leidas": resultado["total"] if resultado else 0
    })