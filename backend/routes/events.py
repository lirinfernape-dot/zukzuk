from flask import Blueprint, request, jsonify
from middleware.auth_middleware import login_requerido
from database import get_db_connection
import datetime

events = Blueprint("events", __name__)

# ==========================================
# CREAR TABLA DE EVENTOS
# ==========================================

def crear_tabla_eventos():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            tipo TEXT DEFAULT 'normal',
            recompensa TEXT,
            fecha_inicio TIMESTAMP,
            fecha_fin TIMESTAMP,
            activo INTEGER DEFAULT 1
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS eventos_participacion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            evento_id INTEGER NOT NULL,
            participacion INTEGER DEFAULT 0,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
            FOREIGN KEY (evento_id) REFERENCES eventos (id),
            UNIQUE(usuario_id, evento_id)
        )
    ''')
    
    conn.commit()
    conn.close()

# ==========================================
# OBTENER EVENTOS ACTIVOS
# ==========================================

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

# ==========================================
# PARTICIPAR EN EVENTO
# ==========================================

@events.route("/api/events/participate/<int:evento_id>", methods=["POST"])
@login_requerido
def participar_evento(evento_id):
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verificar si el evento existe y está activo
    cursor.execute("""
        SELECT * FROM eventos
        WHERE id = ? AND activo = 1
    """, (evento_id,))
    
    evento = cursor.fetchone()
    if not evento:
        conn.close()
        return jsonify({
            "correcto": False,
            "mensaje": "Evento no disponible."
        }), 404
    
    # Verificar si ya participó
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
    
    # Registrar participación
    cursor.execute("""
        INSERT INTO eventos_participacion (usuario_id, evento_id, participacion)
        VALUES (?, ?, 1)
    """, (usuario_id, evento_id))
    
    # Dar recompensa si existe
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

# ==========================================
# AGREGAR EVENTOS POR DEFECTO
# ==========================================

def agregar_eventos_defecto():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    eventos = [
        ("Evento de Bienvenida", "Participa y gana monedas extra", "bienvenida", "50", 
         datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'), None, 1),
        ("Fin de Semana", "Gana el doble de monedas por visitas", "especial", "100", 
         None, None, 1),
    ]
    
    for evento in eventos:
        cursor.execute("""
            INSERT OR IGNORE INTO eventos (nombre, descripcion, tipo, recompensa, fecha_inicio, fecha_fin, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, evento)
    
    conn.commit()
    conn.close()