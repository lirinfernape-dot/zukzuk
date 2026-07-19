from flask import Blueprint, request, jsonify
from backend.middleware.auth_middleware import login_requerido
from backend.database import get_db_connection
import datetime

events = Blueprint("events", __name__)

@events.route("/api/events/active", methods=["GET"])
def eventos_activos():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    cursor.execute("""
        SELECT * FROM eventos
        WHERE activo = 1
        AND (fecha_inicio <= ? OR fecha_inicio IS NULL)
        AND (fecha_fin >= ? OR fecha_fin IS NULL)
        ORDER BY fecha_inicio DESC
    """, (now, now))
    
    eventos = cursor.fetchall()
    conn.close()
    
    lista = []
    for evento in eventos:
        lista.append({
            "id": evento["id"],
            "nombre": evento["nombre"],
            "descripcion": evento["descripcion"],
            "tipo": evento["tipo"],
            "recompensa": evento["recompensa"],
            "fecha_inicio": evento["fecha_inicio"],
            "fecha_fin": evento["fecha_fin"]
        })
    
    return jsonify(lista)

@events.route("/api/events/participate/<int:evento_id>", methods=["POST"])
@login_requerido
def participar_evento(evento_id):
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM eventos WHERE id = ? AND activo = 1", (evento_id,))
    evento = cursor.fetchone()
    
    if not evento:
        conn.close()
        return jsonify({
            "correcto": False,
            "mensaje": "Evento no disponible."
        }), 404
    
    cursor.execute("""
        SELECT id FROM eventos_participacion
        WHERE usuario_id = ? AND evento_id = ?
    """, (usuario_id, evento_id))
    
    if cursor.fetchone():
        conn.close()
        return jsonify({
            "correcto": False,
            "mensaje": "Ya participas en este evento."
        })
    
    cursor.execute("""
        INSERT INTO eventos_participacion (usuario_id, evento_id, participacion)
        VALUES (?, ?, 1)
    """, (usuario_id, evento_id))
    
    if evento["recompensa"]:
        try:
            recompensa = int(evento["recompensa"])
            cursor.execute("""
                UPDATE usuarios
                SET monedas = monedas + ?
                WHERE id = ?
            """, (recompensa, usuario_id))
        except:
            pass
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "correcto": True,
        "mensaje": "Participaste en el evento correctamente.",
        "recompensa": evento["recompensa"]
    })