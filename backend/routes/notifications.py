from flask import Blueprint, request, jsonify
from middleware.auth_middleware import login_requerido
from database import get_db_connection
import datetime

notifications = Blueprint("notifications", __name__)

# ==========================================
# CREAR TABLA DE NOTIFICACIONES
# ==========================================

def crear_tabla_notificaciones():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notificaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            mensaje TEXT NOT NULL,
            leido INTEGER DEFAULT 0,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# ==========================================
# OBTENER NOTIFICACIONES
# ==========================================

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

# ==========================================
# MARCAR COMO LEÍDA
# ==========================================

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

# ==========================================
# CONTAR NO LEÍDAS
# ==========================================

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

# ==========================================
# FUNCIÓN PARA CREAR NOTIFICACIÓN (USAR DESDE OTROS LUGARES)
# ==========================================

def crear_notificacion(usuario_id, tipo, mensaje):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO notificaciones (usuario_id, tipo, mensaje)
            VALUES (?, ?, ?)
        """, (usuario_id, tipo, mensaje))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error al crear notificación: {e}")
        return False