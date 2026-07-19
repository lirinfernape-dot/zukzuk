from flask import Blueprint, request, jsonify
from backend.database import get_db_connection

ranking = Blueprint("ranking", __name__)

@ranking.route("/api/ranking/likes", methods=["GET"])
def ranking_likes():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM juegos
        WHERE estado = 'publico'
        ORDER BY likes DESC, visitas DESC
        LIMIT 20
    """)
    
    juegos = cursor.fetchall()
    conn.close()
    
    lista = []
    for juego in juegos:
        lista.append({
            "id": juego["id"],
            "nombre": juego["nombre"],
            "descripcion": juego["descripcion"],
            "miniatura": juego["miniatura"],
            "likes": juego["likes"],
            "visitas": juego["visitas"],
            "favoritos": juego["favoritos"]
        })
    
    return jsonify(lista)

@ranking.route("/api/ranking/visitas", methods=["GET"])
def ranking_visitas():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM juegos
        WHERE estado = 'publico'
        ORDER BY visitas DESC, likes DESC
        LIMIT 20
    """)
    
    juegos = cursor.fetchall()
    conn.close()
    
    lista = []
    for juego in juegos:
        lista.append({
            "id": juego["id"],
            "nombre": juego["nombre"],
            "descripcion": juego["descripcion"],
            "miniatura": juego["miniatura"],
            "likes": juego["likes"],
            "visitas": juego["visitas"],
            "favoritos": juego["favoritos"]
        })
    
    return jsonify(lista)

@ranking.route("/api/ranking/creadores", methods=["GET"])
def ranking_creadores():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            u.id, 
            u.nombre, 
            u.avatar,
            COUNT(j.id) as total_juegos,
            SUM(j.likes) as total_likes,
            SUM(j.visitas) as total_visitas
        FROM usuarios u
        LEFT JOIN juegos j ON j.creador_id = u.id AND j.estado = 'publico'
        GROUP BY u.id
        ORDER BY total_likes DESC, total_juegos DESC
        LIMIT 20
    """)
    
    creadores = cursor.fetchall()
    conn.close()
    
    lista = []
    for creador in creadores:
        lista.append({
            "id": creador["id"],
            "nombre": creador["nombre"],
            "avatar": creador["avatar"],
            "total_juegos": creador["total_juegos"],
            "total_likes": creador["total_likes"],
            "total_visitas": creador["total_visitas"]
        })
    
    return jsonify(lista)