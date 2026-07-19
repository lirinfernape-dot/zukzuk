from backend.database import obtener_usuario, actualizar_usuario, actualizar_avatar, actualizar_biografia, actualizar_contrasena

def obtener_perfil(id_usuario):
    """
    Obtiene el perfil de un usuario.
    """
    usuario = obtener_usuario(id_usuario)

    if usuario is None:
        return None

    return {
        "id": usuario["id"],
        "nombre": usuario["nombre"],
        "correo": usuario["correo"],
        "fecha_nacimiento": usuario.get("fecha_nacimiento", ""),
        "genero": usuario.get("genero", ""),
        "fecha_registro": usuario.get("fecha_registro", ""),
        "avatar": usuario.get("avatar", "default_avatar.png"),
        "biografia": usuario.get("biografia", "Hola, soy un usuario de ZukZuk!"),
        "nivel": usuario.get("nivel", 1),
        "monedas": usuario.get("monedas", 0)
    }

def actualizar_perfil(id_usuario, nombre, genero):
    """
    Actualiza el perfil de un usuario.
    """
    return actualizar_usuario(id_usuario, nombre, genero)

def actualizar_avatar_usuario(id_usuario, avatar):
    """
    Actualiza el avatar de un usuario.
    """
    return actualizar_avatar(id_usuario, avatar)

def actualizar_biografia_usuario(id_usuario, biografia):
    """
    Actualiza la biografía de un usuario.
    """
    return actualizar_biografia(id_usuario, biografia)

def actualizar_contrasena_usuario(id_usuario, nueva_contrasena):
    """
    Actualiza la contraseña de un usuario.
    """
    return actualizar_contrasena(id_usuario, nueva_contrasena)