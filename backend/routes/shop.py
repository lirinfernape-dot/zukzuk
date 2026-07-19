from flask import Blueprint, request, jsonify
from middleware.auth_middleware import login_requerido
from database import get_db_connection

shop = Blueprint("shop", __name__)

# ==========================================
# CREAR TABLA DE TIENDA
# ==========================================

def crear_tabla_tienda():
    conn = get_db_connection()
    cursor = conn.cursor()
    
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
    
    conn.commit()
    conn.close()

# ==========================================
# OBTENER ITEMS DE LA TIENDA
# ==========================================

@shop.route("/api/shop/items", methods=["GET"])
def obtener_items():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM tienda
        WHERE disponible = 1
        ORDER BY precio ASC
    """)
    
    items = cursor.fetchall()
    conn.close()
    
    lista = []
    for item in items:
        lista.append({
            "id": item["id"],
            "nombre": item["nombre"],
            "descripcion": item["descripcion"],
            "precio": item["precio"],
            "imagen": item["imagen"],
            "categoria": item["categoria"]
        })
    
    return jsonify(lista)

# ==========================================
# COMPRAR ITEM
# ==========================================

@shop.route("/api/shop/buy/<int:item_id>", methods=["POST"])
@login_requerido
def comprar_item(item_id):
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verificar si el item existe
    cursor.execute("SELECT * FROM tienda WHERE id = ? AND disponible = 1", (item_id,))
    item = cursor.fetchone()
    
    if not item:
        conn.close()
        return jsonify({
            "correcto": False,
            "mensaje": "Item no disponible."
        }), 404
    
    # Verificar si ya lo compró
    cursor.execute("""
        SELECT id FROM compras
        WHERE usuario_id = ? AND item_id = ?
    """, (usuario_id, item_id))
    
    if cursor.fetchone():
        conn.close()
        return jsonify({
            "correcto": False,
            "mensaje": "Ya tienes este item."
        })
    
    # Verificar monedas
    cursor.execute("SELECT monedas FROM usuarios WHERE id = ?", (usuario_id,))
    usuario = cursor.fetchone()
    
    if not usuario or usuario["monedas"] < item["precio"]:
        conn.close()
        return jsonify({
            "correcto": False,
            "mensaje": "Monedas insuficientes. Necesitas " + str(item["precio"]) + " monedas."
        })
    
    # Descontar monedas
    cursor.execute("""
        UPDATE usuarios
        SET monedas = monedas - ?
        WHERE id = ?
    """, (item["precio"], usuario_id))
    
    # Registrar compra
    cursor.execute("""
        INSERT INTO compras (usuario_id, item_id)
        VALUES (?, ?)
    """, (usuario_id, item_id))
    
    # Si es un avatar, actualizar avatar del usuario
    if item["categoria"] == "avatar":
        cursor.execute("""
            UPDATE usuarios
            SET avatar = ?
            WHERE id = ?
        """, (item["imagen"], usuario_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        "correcto": True,
        "mensaje": "Item comprado correctamente."
    })

# ==========================================
# OBTENER ITEMS DEL USUARIO
# ==========================================

@shop.route("/api/shop/my-items", methods=["GET"])
@login_requerido
def mis_items():
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT t.* FROM tienda t
        INNER JOIN compras c ON c.item_id = t.id
        WHERE c.usuario_id = ?
    """, (usuario_id,))
    
    items = cursor.fetchall()
    conn.close()
    
    lista = []
    for item in items:
        lista.append({
            "id": item["id"],
            "nombre": item["nombre"],
            "descripcion": item["descripcion"],
            "precio": item["precio"],
            "imagen": item["imagen"],
            "categoria": item["categoria"]
        })
    
    return jsonify(lista)

# ==========================================
# AGREGAR ITEMS POR DEFECTO (OPCIONAL)
# ==========================================

def agregar_items_defecto():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    items = [
        ("Avatar Robloxiano", "Un avatar clásico de Roblox", 50, "avatar_roblox.png", "avatar"),
        ("Avatar Ninja", "Un avatar de ninja misterioso", 100, "avatar_ninja.png", "avatar"),
        ("Avatar Espacial", "Explora el universo con este avatar", 150, "avatar_espacial.png", "avatar"),
        ("Avatar Vikingo", "Un guerrero vikingo poderoso", 200, "avatar_vikingo.png", "avatar"),
        ("Avatar Cyberpunk", "Estilo futurista cyberpunk", 250, "avatar_cyber.png", "avatar"),
    ]
    
    for item in items:
        cursor.execute("""
            INSERT OR IGNORE INTO tienda (nombre, descripcion, precio, imagen, categoria)
            VALUES (?, ?, ?, ?, ?)
        """, item)
    
    conn.commit()
    conn.close()