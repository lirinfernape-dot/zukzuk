from database import get_db_connection
import sqlite3

# ==========================================
# FUNCIONES DE JUEGOS
# ==========================================

def crear_juego(creador_id, nombre, descripcion, miniatura, archivo):
    """
    Crea un nuevo juego en la base de datos.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO juegos (creador_id, nombre, descripcion, miniatura, archivo)
            VALUES (?, ?, ?, ?, ?)
        """, (creador_id, nombre, descripcion, miniatura, archivo))
        
        juego_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return juego_id
        
    except Exception as e:
        print(f"Error en crear_juego: {e}")
        return None

def obtener_juegos():
    """
    Obtiene todos los juegos públicos.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM juegos
            WHERE estado = 'publico'
            ORDER BY fecha_creacion DESC
        """)
        
        juegos = cursor.fetchall()
        conn.close()
        return juegos
        
    except Exception as e:
        print(f"Error en obtener_juegos: {e}")
        return []

def obtener_juego(id_juego):
    """
    Obtiene un juego por su ID.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM juegos WHERE id = ?", (id_juego,))
        juego = cursor.fetchone()
        conn.close()
        return juego
        
    except Exception as e:
        print(f"Error en obtener_juego: {e}")
        return None

def obtener_juegos_usuario(usuario_id):
    """
    Obtiene todos los juegos de un usuario.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM juegos
            WHERE creador_id = ?
            ORDER BY fecha_creacion DESC
        """, (usuario_id,))
        
        juegos = cursor.fetchall()
        conn.close()
        return juegos
        
    except Exception as e:
        print(f"Error en obtener_juegos_usuario: {e}")
        return []

def obtener_juegos_publicos():
    """
    Obtiene juegos públicos para la tienda.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM juegos
            WHERE estado = 'publico'
            ORDER BY likes DESC, visitas DESC
        """)
        
        juegos = cursor.fetchall()
        conn.close()
        return juegos
        
    except Exception as e:
        print(f"Error en obtener_juegos_publicos: {e}")
        return []

def buscar_juegos(texto):
    """
    Busca juegos por nombre o descripción.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM juegos
            WHERE estado = 'publico'
            AND (nombre LIKE ? OR descripcion LIKE ?)
            ORDER BY likes DESC
        """, (f'%{texto}%', f'%{texto}%'))
        
        juegos = cursor.fetchall()
        conn.close()
        return juegos
        
    except Exception as e:
        print(f"Error en buscar_juegos: {e}")
        return []

def sumar_visita(id_juego):
    """
    Incrementa el contador de visitas de un juego.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE juegos
            SET visitas = visitas + 1
            WHERE id = ?
        """, (id_juego,))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en sumar_visita: {e}")
        return False

def dar_like(id_juego, usuario_id):
    """
    Agrega un like a un juego.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id FROM likes
            WHERE usuario_id = ? AND juego_id = ?
        """, (usuario_id, id_juego))
        
        if cursor.fetchone():
            conn.close()
            return False
        
        cursor.execute("""
            INSERT INTO likes (usuario_id, juego_id)
            VALUES (?, ?)
        """, (usuario_id, id_juego))
        
        cursor.execute("""
            UPDATE juegos
            SET likes = likes + 1
            WHERE id = ?
        """, (id_juego,))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en dar_like: {e}")
        return False

def quitar_like(id_juego, usuario_id):
    """
    Quita un like de un juego.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM likes
            WHERE usuario_id = ? AND juego_id = ?
        """, (usuario_id, id_juego))
        
        cursor.execute("""
            UPDATE juegos
            SET likes = likes - 1
            WHERE id = ? AND likes > 0
        """, (id_juego,))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en quitar_like: {e}")
        return False

def tiene_like(id_juego, usuario_id):
    """
    Verifica si un usuario ha dado like a un juego.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id FROM likes
            WHERE usuario_id = ? AND juego_id = ?
        """, (usuario_id, id_juego))
        
        existe = cursor.fetchone() is not None
        conn.close()
        return existe
        
    except Exception as e:
        print(f"Error en tiene_like: {e}")
        return False

def agregar_favorito(id_juego, usuario_id):
    """
    Agrega un juego a favoritos.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id FROM favoritos
            WHERE usuario_id = ? AND juego_id = ?
        """, (usuario_id, id_juego))
        
        if cursor.fetchone():
            conn.close()
            return False
        
        cursor.execute("""
            INSERT INTO favoritos (usuario_id, juego_id)
            VALUES (?, ?)
        """, (usuario_id, id_juego))
        
        cursor.execute("""
            UPDATE juegos
            SET favoritos = favoritos + 1
            WHERE id = ?
        """, (id_juego,))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en agregar_favorito: {e}")
        return False

def quitar_favorito(id_juego, usuario_id):
    """
    Quita un juego de favoritos.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM favoritos
            WHERE usuario_id = ? AND juego_id = ?
        """, (usuario_id, id_juego))
        
        cursor.execute("""
            UPDATE juegos
            SET favoritos = favoritos - 1
            WHERE id = ? AND favoritos > 0
        """, (id_juego,))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en quitar_favorito: {e}")
        return False

def tiene_favorito(id_juego, usuario_id):
    """
    Verifica si un usuario tiene un juego en favoritos.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id FROM favoritos
            WHERE usuario_id = ? AND juego_id = ?
        """, (usuario_id, id_juego))
        
        existe = cursor.fetchone() is not None
        conn.close()
        return existe
        
    except Exception as e:
        print(f"Error en tiene_favorito: {e}")
        return False

def obtener_favoritos(usuario_id):
    """
    Obtiene todos los juegos favoritos de un usuario.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT j.* FROM juegos j
            INNER JOIN favoritos f ON f.juego_id = j.id
            WHERE f.usuario_id = ?
            ORDER BY f.fecha DESC
        """, (usuario_id,))
        
        juegos = cursor.fetchall()
        conn.close()
        return juegos
        
    except Exception as e:
        print(f"Error en obtener_favoritos: {e}")
        return []

def actualizar_juego(id_juego, nombre, descripcion, categoria):
    """
    Actualiza los datos de un juego.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE juegos
            SET nombre = ?, descripcion = ?, categoria = ?
            WHERE id = ?
        """, (nombre, descripcion, categoria, id_juego))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en actualizar_juego: {e}")
        return False

def eliminar_juego(id_juego):
    """
    Elimina un juego y sus relaciones.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM likes WHERE juego_id = ?", (id_juego,))
        cursor.execute("DELETE FROM favoritos WHERE juego_id = ?", (id_juego,))
        cursor.execute("DELETE FROM juegos WHERE id = ?", (id_juego,))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en eliminar_juego: {e}")
        return False

def actualizar_archivo(id_juego, archivo, version):
    """
    Actualiza el archivo y versión de un juego.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE juegos
            SET archivo = ?, version = ?
            WHERE id = ?
        """, (archivo, version, id_juego))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en actualizar_archivo: {e}")
        return False

def actualizar_archivo_juego(id_juego, archivo, tamanio):
    """
    Actualiza el archivo de un juego y aumenta la versión automáticamente.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT version FROM juegos WHERE id = ?", (id_juego,))
        version_actual = cursor.fetchone()
        
        if version_actual:
            try:
                version_num = float(version_actual[0])
                nueva_version = str(version_num + 0.1)
            except:
                nueva_version = "1.1.0"
        else:
            nueva_version = "1.0.0"
        
        cursor.execute("""
            UPDATE juegos
            SET archivo = ?, version = ?
            WHERE id = ?
        """, (archivo, nueva_version, id_juego))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en actualizar_archivo_juego: {e}")
        return False


# ==========================================
# FUNCIONES DE COMENTARIOS (NUEVO)
# ==========================================

def agregar_comentario(usuario_id, juego_id, comentario):
    """
    Agrega un comentario a un juego.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO comentarios (usuario_id, juego_id, comentario)
            VALUES (?, ?, ?)
        """, (usuario_id, juego_id, comentario))
        
        conn.commit()
        conn.close()
        return True, "Comentario agregado correctamente."
        
    except Exception as e:
        print(f"Error en agregar_comentario: {e}")
        return False, f"Error al agregar comentario: {str(e)}"

def obtener_comentarios(juego_id):
    """
    Obtiene todos los comentarios de un juego.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT c.*, u.nombre, u.avatar 
            FROM comentarios c
            INNER JOIN usuarios u ON u.id = c.usuario_id
            WHERE c.juego_id = ?
            ORDER BY c.fecha DESC
        """, (juego_id,))
        
        comentarios = cursor.fetchall()
        conn.close()
        return comentarios
        
    except Exception as e:
        print(f"Error en obtener_comentarios: {e}")
        return []