from database import get_db_connection

def obtener_monedas(usuario_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT monedas FROM usuarios WHERE id = ?", (usuario_id,))
    resultado = cursor.fetchone()
    conn.close()
    return resultado["monedas"] if resultado else 0

def agregar_monedas(usuario_id, cantidad):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE usuarios 
        SET monedas = monedas + ? 
        WHERE id = ?
    """, (cantidad, usuario_id))
    conn.commit()
    conn.close()
    return True

def comprar_juego(usuario_id, juego_id, precio):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Verificar monedas
    cursor.execute("SELECT monedas FROM usuarios WHERE id = ?", (usuario_id,))
    usuario = cursor.fetchone()
    
    if not usuario or usuario["monedas"] < precio:
        conn.close()
        return False, "Monedas insuficientes"
    
    # Descontar monedas
    cursor.execute("""
        UPDATE usuarios SET monedas = monedas - ? WHERE id = ?
    """, (precio, usuario_id))
    
    # Agregar a favoritos (comprado)
    cursor.execute("""
        INSERT OR IGNORE INTO favoritos (usuario_id, juego_id)
        VALUES (?, ?)
    """, (usuario_id, juego_id))
    
    conn.commit()
    conn.close()
    return True, "Juego comprado exitosamente"