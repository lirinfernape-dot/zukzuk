from flask import Blueprint, request, jsonify
from middleware.auth_middleware import login_requerido
from database import get_db_connection

achievements = Blueprint("achievements", __name__)

# ==========================================
# CREAR TABLA DE LOGROS
# ==========================================

def crear_tabla_logros():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            icono TEXT,
            puntos INTEGER DEFAULT 10
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logros_usuario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            logro_id INTEGER NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
            FOREIGN KEY (logro_id) REFERENCES logros (id),
            UNIQUE(usuario_id, logro_id)
        )
    ''')
    
    conn.commit()
    conn.close()

# ==========================================
# OBTENER LOGROS DEL USUARIO
# ==========================================

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

# ==========================================
# DESBLOQUEAR LOGRO
# ==========================================

def desbloquear_logro(usuario_id, logro_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR IGNORE INTO logros_usuario (usuario_id, logro_id)
            VALUES (?, ?)
        """, (usuario_id, logro_id))
        
        # Sumar puntos al usuario si se desbloqueó
        cursor.execute("""
            UPDATE usuarios
            SET nivel = nivel + 1
            WHERE id = ? AND EXISTS (
                SELECT 1 FROM logros_usuario WHERE usuario_id = ? AND logro_id = ?
            )
        """, (usuario_id, usuario_id, logro_id))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error al desbloquear logro: {e}")
        return False

# ==========================================
# AGREGAR LOGROS POR DEFECTO
# ==========================================

def agregar_logros_defecto():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    logros = [
        ("Primer Juego", "Creaste tu primer juego", "🎮", 10),
        ("Creador Pro", "Creaste 5 juegos", "🏆", 25),
        ("Creador Maestro", "Creaste 10 juegos", "👑", 50),
        ("Popular", "Tu juego tiene 100 visitas", "🌟", 15),
        ("Muy Popular", "Tu juego tiene 1000 visitas", "⭐", 30),
        ("Famoso", "Tu juego tiene 100 likes", "❤️", 20),
        ("Legendario", "Tu juego tiene 500 likes", "🔥", 40),
        ("Amistoso", "Tienes 5 amigos", "👥", 15),
        ("Social", "Tienes 20 amigos", "🤝", 30),
        ("Comentarista", "Hiciste tu primer comentario", "💬", 5),
    ]
    
    for logro in logros:
        cursor.execute("""
            INSERT OR IGNORE INTO logros (nombre, descripcion, icono, puntos)
            VALUES (?, ?, ?, ?)
        """, logro)
    
    conn.commit()
    conn.close()