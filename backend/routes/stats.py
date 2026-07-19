from flask import Blueprint, request, jsonify
from middleware.auth_middleware import login_requerido
from database import get_db_connection

stats = Blueprint("stats", __name__)

# ==========================================
# OBTENER ESTADÍSTICAS DEL USUARIO
# ==========================================

@stats.route("/api/stats/user", methods=["GET"])
@login_requerido
def estadisticas_usuario():
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Juegos creados
    cursor.execute("""
        SELECT COUNT(*) as total_juegos FROM juegos WHERE creador_id = ?
    """, (usuario_id,))
    total_juegos = cursor.fetchone()["total_juegos"]
    
    # Likes recibidos en todos sus juegos
    cursor.execute("""
        SELECT SUM(likes) as total_likes FROM juegos WHERE creador_id = ?
    """, (usuario_id,))
    total_likes = cursor.fetchone()["total_likes"] or 0
    
    # Visitas recibidas en todos sus juegos
    cursor.execute("""
        SELECT SUM(visitas) as total_visitas FROM juegos WHERE creador_id = ?
    """, (usuario_id,))
    total_visitas = cursor.fetchone()["total_visitas"] or 0
    
    # Favoritos recibidos
    cursor.execute("""
        SELECT SUM(favoritos) as total_favoritos FROM juegos WHERE creador_id = ?
    """, (usuario_id,))
    total_favoritos = cursor.fetchone()["total_favoritos"] or 0
    
    # Total de amigos
    cursor.execute("""
        SELECT COUNT(*) as total_amigos FROM amigos WHERE usuario_id = ?
    """, (usuario_id,))
    total_amigos = cursor.fetchone()["total_amigos"]
    
    # Logros desbloqueados
    cursor.execute("""
        SELECT COUNT(*) as total_logros FROM logros_usuario WHERE usuario_id = ?
    """, (usuario_id,))
    total_logros = cursor.fetchone()["total_logros"]
    
    conn.close()
    
    return jsonify({
        "total_juegos": total_juegos,
        "total_likes": total_likes,
        "total_visitas": total_visitas,
        "total_favoritos": total_favoritos,
        "total_amigos": total_amigos,
        "total_logros": total_logros
    })

# ==========================================
# ESTADÍSTICAS DEL JUEGO
# ==========================================

@stats.route("/api/stats/game/<int:juego_id>", methods=["GET"])
def estadisticas_juego(juego_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            j.*,
            u.nombre as creador_nombre,
            u.avatar as creador_avatar
        FROM juegos j
        INNER JOIN usuarios u ON u.id = j.creador_id
        WHERE j.id = ?
    """, (juego_id,))
    
    juego = cursor.fetchone()
    conn.close()
    
    if not juego:
        return jsonify({
            "correcto": False,
            "mensaje": "Juego no encontrado."
        }), 404
    
    return jsonify({
        "id": juego["id"],
        "nombre": juego["nombre"],
        "descripcion": juego["descripcion"],
        "categoria": juego["categoria"],
        "visitas": juego["visitas"],
        "likes": juego["likes"],
        "favoritos": juego["favoritos"],
        "version": juego["version"],
        "creador": {
            "id": juego["creador_id"],
            "nombre": juego["creador_nombre"],
            "avatar": juego["creador_avatar"]
        }
    })