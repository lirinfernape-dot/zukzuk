from flask import Blueprint, request, jsonify
from backend.middleware.auth_middleware import login_requerido
from backend.database import get_db_connection

shop = Blueprint("shop", __name__)

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

@shop.route("/api/shop/buy/<int:item_id>", methods=["POST"])
@login_requerido
def comprar_item(item_id):
    usuario_id = request.usuario["id"]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM tienda WHERE id = ? AND disponible = 1", (item_id,))
    item = cursor.fetchone()
    
    if not item:
        conn.close()
        return jsonify({
            "correcto": False,
            "mensaje": "Item no disponible."
        }), 404
    
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
    
    cursor.execute("SELECT monedas FROM usuarios WHERE id = ?", (usuario_id,))
    usuario = cursor.fetchone()
    
    if not usuario or usuario["monedas"] < item["precio"]:
        conn.close()
        return jsonify({
            "correcto": False,
            "mensaje": "Monedas insuficientes. Necesitas " + str(item["precio"]) + " monedas."
        })
    
    cursor.execute("""
        UPDATE usuarios
        SET monedas = monedas - ?
        WHERE id = ?
    """, (item["precio"], usuario_id))
    
    cursor.execute("""
        INSERT INTO compras (usuario_id, item_id)
        VALUES (?, ?)
    """, (usuario_id, item_id))
    
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