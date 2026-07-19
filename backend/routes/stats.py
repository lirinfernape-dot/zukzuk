from flask import Blueprint, request, jsonify
from backend.middleware.auth_middleware import login_requerido
from backend.database import get_db_connection

stats = Blueprint("stats", __name__)

@stats.route("/api/stats/user", methods=["GET"])
@login_requerido
def estadisticas_usuario():
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total_juegos FROM juegos WHERE creador_id = ?", (usuario_id,))
    total_juegos = cursor.fetchone()["total_juegos"]
    
    cursor.execute("SELECT SUM(likes) as total_likes FROM juegos WHERE creador_id = ?", (usuario_id,))
    total_likes = cursor.fetchone()["total_likes"] or 0
    
    cursor.execute("SELECT SUM(visitas) as total_visitas FROM juegos WHERE creador_id = ?", (usuario_id,))
    total_visitas = cursor.fetchone()["total_visitas"] or 0
    
    cursor.execute("SELECT SUM(favoritos) as total_favoritos FROM juegos WHERE creador_id = ?", (usuario_id,))
    total_favoritos = cursor.fetchone()["total_favoritos"] or 0
    
    cursor.execute("SELECT COUNT(*) as total_amigos FROM amigos WHERE usuario_id = ?", (usuario_id,))
    total_amigos = cursor.fetchone()["total_amigos"]
    
    cursor.execute("SELECT COUNT(*) as total_logros FROM logros_usuario WHERE usuario_id = ?", (usuario_id,))
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