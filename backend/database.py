import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime

# ==========================================
# CONEXIÓN A LA BASE DE DATOS
# ==========================================

def get_db_connection():
    """
    Establece y retorna una conexión a la base de datos.
    """
    # En Render, usar la ruta del disco
    if os.environ.get('RENDER'):
        db_path = os.path.join('/opt/render/project/src/backend', 'zukzuk.db')
    else:
        db_path = os.path.join(os.path.dirname(__file__), 'zukzuk.db')
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

# ==========================================
# CREAR TABLAS
# ==========================================

def crear_tablas():
    """
    Crea todas las tablas necesarias si no existen.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Tabla de usuarios
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            correo TEXT UNIQUE NOT NULL,
            contrasena TEXT NOT NULL,
            fecha_nacimiento TEXT NOT NULL,
            genero TEXT,
            avatar TEXT DEFAULT 'default_avatar.png',
            biografia TEXT DEFAULT 'Hola, soy un usuario de ZukZuk!',
            nivel INTEGER DEFAULT 1,
            monedas INTEGER DEFAULT 0,
            es_admin INTEGER DEFAULT 0,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabla de juegos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS juegos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            creador_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            categoria TEXT,
            miniatura TEXT,
            archivo TEXT,
            version TEXT DEFAULT '1.0.0',
            estado TEXT DEFAULT 'publico',
            visitas INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            favoritos INTEGER DEFAULT 0,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creador_id) REFERENCES usuarios (id)
        )
    ''')
    
    # Tabla de likes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            juego_id INTEGER NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
            FOREIGN KEY (juego_id) REFERENCES juegos (id),
            UNIQUE(usuario_id, juego_id)
        )
    ''')
    
    # Tabla de favoritos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favoritos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            juego_id INTEGER NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
            FOREIGN KEY (juego_id) REFERENCES juegos (id),
            UNIQUE(usuario_id, juego_id)
        )
    ''')
    
    # Tabla de amigos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS amigos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            amigo_id INTEGER NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
            FOREIGN KEY (amigo_id) REFERENCES usuarios (id),
            UNIQUE(usuario_id, amigo_id)
        )
    ''')
    
    # Tabla de comentarios
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comentarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            juego_id INTEGER NOT NULL,
            comentario TEXT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
            FOREIGN KEY (juego_id) REFERENCES juegos (id)
        )
    ''')
    
    # Tabla de notificaciones
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
    
    # Tabla de mensajes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mensajes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            remitente_id INTEGER NOT NULL,
            destinatario_id INTEGER NOT NULL,
            mensaje TEXT NOT NULL,
            leido INTEGER DEFAULT 0,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (remitente_id) REFERENCES usuarios (id),
            FOREIGN KEY (destinatario_id) REFERENCES usuarios (id)
        )
    ''')
    
    # Tabla de tienda
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tienda (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio INTEGER NOT NULL,
            imagen TEXT,
            categoria TEXT DEFAULT 'avatar',
            disponible INTEGER DEFAULT 1
        )
    ''')
    
    # Tabla de compras
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS compras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
            FOREIGN KEY (item_id) REFERENCES tienda (id),
            UNIQUE(usuario_id, item_id)
        )
    ''')
    
    # Tabla de logros
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            icono TEXT,
            puntos INTEGER DEFAULT 10
        )
    ''')
    
    # Tabla de logros_usuario
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
    
    # Tabla de eventos
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
    
    # Tabla de eventos_participacion
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
    print("✅ Tablas creadas/verificadas correctamente.")

# ==========================================
# FUNCIONES DE USUARIO
# ==========================================

def crear_usuario(nombre, correo, contrasena, fecha_nacimiento, genero):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM usuarios WHERE correo = ?", (correo,))
        if cursor.fetchone():
            conn.close()
            return False, "El correo ya está registrado."
        
        hashed_password = generate_password_hash(contrasena)
        
        cursor.execute("""
            INSERT INTO usuarios (nombre, correo, contrasena, fecha_nacimiento, genero)
            VALUES (?, ?, ?, ?, ?)
        """, (nombre, correo, hashed_password, fecha_nacimiento, genero))
        
        conn.commit()
        conn.close()
        return True, "Usuario creado correctamente."
        
    except Exception as e:
        print(f"Error en crear_usuario: {e}")
        return False, f"Error al crear usuario: {str(e)}"

def iniciar_sesion(correo, contrasena):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, nombre, correo, contrasena FROM usuarios WHERE correo = ?",
            (correo,)
        )
        
        usuario = cursor.fetchone()
        conn.close()
        
        if usuario is None:
            return None, "El correo no está registrado."
        
        if check_password_hash(usuario["contrasena"], contrasena):
            return {
                "id": usuario["id"],
                "nombre": usuario["nombre"],
                "correo": usuario["correo"]
            }, "Inicio de sesión exitoso."
        else:
            return None, "Contraseña incorrecta."
            
    except Exception as e:
        print(f"Error en iniciar_sesion: {e}")
        return None, f"Error al iniciar sesión: {str(e)}"

def obtener_usuario(id_usuario):
    """
    Obtiene un usuario por su ID.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, nombre, correo, fecha_nacimiento, genero, avatar, biografia, nivel, monedas, es_admin, fecha_registro FROM usuarios WHERE id = ?",
            (id_usuario,)
        )
        
        usuario = cursor.fetchone()
        conn.close()
        
        if usuario:
            return dict(usuario)
        return None
        
    except Exception as e:
        print(f"Error en obtener_usuario: {e}")
        return None

def obtener_usuario_por_correo(correo):
    """
    Obtiene un usuario por su correo.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, nombre, correo, fecha_nacimiento, genero, avatar, biografia, nivel, monedas, es_admin, fecha_registro FROM usuarios WHERE correo = ?",
            (correo,)
        )
        
        usuario = cursor.fetchone()
        conn.close()
        
        if usuario:
            return dict(usuario)
        return None
        
    except Exception as e:
        print(f"Error en obtener_usuario_por_correo: {e}")
        return None

def actualizar_usuario(id_usuario, nombre, genero):
    """
    Actualiza los datos de un usuario.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE usuarios
            SET nombre = ?, genero = ?
            WHERE id = ?
        """, (nombre, genero, id_usuario))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en actualizar_usuario: {e}")
        return False

def actualizar_avatar(id_usuario, avatar):
    """
    Actualiza el avatar de un usuario.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE usuarios
            SET avatar = ?
            WHERE id = ?
        """, (avatar, id_usuario))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en actualizar_avatar: {e}")
        return False

def actualizar_biografia(id_usuario, biografia):
    """
    Actualiza la biografía de un usuario.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE usuarios
            SET biografia = ?
            WHERE id = ?
        """, (biografia, id_usuario))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en actualizar_biografia: {e}")
        return False

def actualizar_contrasena(id_usuario, nueva_contrasena):
    """
    Actualiza la contraseña de un usuario.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        hashed_password = generate_password_hash(nueva_contrasena)
        
        cursor.execute("""
            UPDATE usuarios
            SET contrasena = ?
            WHERE id = ?
        """, (hashed_password, id_usuario))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en actualizar_contrasena: {e}")
        return False

def agregar_monedas(id_usuario, cantidad):
    """
    Agrega monedas a un usuario.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE usuarios
            SET monedas = monedas + ?
            WHERE id = ?
        """, (cantidad, id_usuario))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en agregar_monedas: {e}")
        return False

def obtener_monedas(id_usuario):
    """
    Obtiene las monedas de un usuario.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT monedas FROM usuarios WHERE id = ?", (id_usuario,))
        resultado = cursor.fetchone()
        conn.close()
        
        return resultado["monedas"] if resultado else 0
        
    except Exception as e:
        print(f"Error en obtener_monedas: {e}")
        return 0

# ==========================================
# FUNCIONES DE JUEGOS
# ==========================================

def crear_juego(creador_id, nombre, descripcion, miniatura, archivo):
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
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE juegos
            SET visitas = visitas + 1
            WHERE id = ?
        """, (id_juego,))
        
        cursor.execute("""
            UPDATE usuarios 
            SET monedas = monedas + 1 
            WHERE id = (SELECT creador_id FROM juegos WHERE id = ?)
        """, (id_juego,))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en sumar_visita: {e}")
        return False

# ==========================================
# FUNCIONES DE LIKES
# ==========================================

def dar_like(id_juego, usuario_id):
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
        
        cursor.execute("""
            UPDATE usuarios 
            SET monedas = monedas + 2 
            WHERE id = (SELECT creador_id FROM juegos WHERE id = ?)
        """, (id_juego,))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en dar_like: {e}")
        return False

def quitar_like(id_juego, usuario_id):
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

# ==========================================
# FUNCIONES DE FAVORITOS
# ==========================================

def agregar_favorito(id_juego, usuario_id):
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

# ==========================================
# FUNCIONES DE AMIGOS
# ==========================================

def agregar_amigo(usuario_id, amigo_id):
    try:
        if usuario_id == amigo_id:
            return False, "No puedes agregarte a ti mismo."
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id FROM amigos
            WHERE usuario_id = ? AND amigo_id = ?
        """, (usuario_id, amigo_id))
        
        if cursor.fetchone():
            conn.close()
            return False, "Ya son amigos."
        
        cursor.execute("""
            INSERT INTO amigos (usuario_id, amigo_id)
            VALUES (?, ?)
        """, (usuario_id, amigo_id))
        
        conn.commit()
        conn.close()
        return True, "Amigo agregado correctamente."
        
    except Exception as e:
        print(f"Error en agregar_amigo: {e}")
        return False, f"Error al agregar amigo: {str(e)}"

def obtener_amigos(usuario_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT u.id, u.nombre, u.correo, u.avatar 
            FROM usuarios u
            INNER JOIN amigos a ON a.amigo_id = u.id
            WHERE a.usuario_id = ?
        """, (usuario_id,))
        
        amigos = cursor.fetchall()
        conn.close()
        return amigos
        
    except Exception as e:
        print(f"Error en obtener_amigos: {e}")
        return []

def es_amigo(usuario_id, amigo_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id FROM amigos
            WHERE usuario_id = ? AND amigo_id = ?
        """, (usuario_id, amigo_id))
        
        existe = cursor.fetchone() is not None
        conn.close()
        return existe
        
    except Exception as e:
        print(f"Error en es_amigo: {e}")
        return False

def eliminar_amigo(usuario_id, amigo_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM amigos
            WHERE usuario_id = ? AND amigo_id = ?
        """, (usuario_id, amigo_id))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en eliminar_amigo: {e}")
        return False

# ==========================================
# FUNCIONES DE COMENTARIOS
# ==========================================

def agregar_comentario(usuario_id, juego_id, comentario):
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

# ==========================================
# FUNCIONES DE ACTUALIZACIÓN Y ELIMINACIÓN
# ==========================================

def actualizar_juego(id_juego, nombre, descripcion, categoria):
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

def actualizar_archivo(id_juego, archivo, version):
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

def eliminar_juego(id_juego):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM likes WHERE juego_id = ?", (id_juego,))
        cursor.execute("DELETE FROM favoritos WHERE juego_id = ?", (id_juego,))
        cursor.execute("DELETE FROM comentarios WHERE juego_id = ?", (id_juego,))
        cursor.execute("DELETE FROM juegos WHERE id = ?", (id_juego,))
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error en eliminar_juego: {e}")
        return False

# ==========================================
# FUNCIONES DE COMPATIBILIDAD
# ==========================================

def crear_tabla_juegos():
    """
    Función de compatibilidad para mantener compatibilidad con código existente.
    """
    crear_tablas()

def crear_tabla_likes():
    """
    Función de compatibilidad para mantener compatibilidad con código existente.
    """
    crear_tablas()

# ==========================================
# EJECUTAR LA CREACIÓN DE TABLAS AL INICIAR
# ==========================================

if __name__ == "__main__":
    crear_tablas()
    print("✅ Base de datos inicializada correctamente.")