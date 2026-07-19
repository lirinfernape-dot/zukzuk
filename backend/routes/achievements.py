from flask import Blueprint, request, jsonify
from backend.middleware.auth_middleware import login_requerido
from backend.database import get_db_connection

achievements = Blueprint("achievements", __name__)

@achievements.route("/api/achievements", methods=["GET"])
@login_requerido
def obtener_logros():
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT l.*, 
               CASE WHEN lu.id IS NOT NULL THEN 1 ELSE 0 END as desbloqueado,
               lu.fecha as fecha_desbloqueo
        FROM logros l
        LEFT JOIN logros_usuario lu ON lu.logro_id = l.id AND lu.usuario_id = ?
        ORDER BY desbloqueado DESC, l.puntos DESC
    """, (usuario_id,))
    
    logros = cursor.fetchall()
    conn.close()
    
    lista = []
    for logro in logros:
        lista.append({
            "id": logro["id"],
            "nombre": logro["nombre"],
            "descripcion": logro["descripcion"],
            "icono": logro["icono"],
            "puntos": logro["puntos"],
            "desbloqueado": bool(logro["desbloqueado"]),
            "fecha_desbloqueo": logro["fecha_desbloqueo"]
        })
    
    return jsonify(lista)