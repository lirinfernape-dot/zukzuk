from flask import Blueprint, request, jsonify
from backend.services.game_service import (
    obtener_juego, sumar_visita, dar_like, obtener_juegos_usuario,
    actualizar_juego, eliminar_juego, actualizar_archivo,
    obtener_juegos_publicos, buscar_juegos, quitar_like,
    tiene_like, agregar_favorito, quitar_favorito,
    tiene_favorito, obtener_favoritos, actualizar_archivo_juego,
    agregar_comentario, obtener_comentarios, crear_juego,
    obtener_juegos
)
from backend.middleware.auth_middleware import login_requerido
from werkzeug.utils import secure_filename
import os
import uuid

games = Blueprint("games", __name__)

# ==========================================
# CREAR JUEGO
# ==========================================

@games.route("/api/games/create", methods=["POST"])
@login_requerido
def crear():
    creador_id = request.usuario["id"]
    nombre = request.form["nombre"]
    descripcion = request.form["descripcion"]

    miniatura = request.files.get("miniatura")
    archivo_juego = request.files.get("archivo")

    nombre_miniatura = ""
    nombre_archivo = ""

    # ==========================
    # GUARDAR MINIATURA
    # ==========================

    if miniatura and miniatura.filename != "":
        extension = miniatura.filename.split(".")[-1]
        nombre_miniatura = str(uuid.uuid4()) + "." + extension
        carpeta = "uploads/juegos/miniaturas"
        os.makedirs(carpeta, exist_ok=True)
        miniatura.save(os.path.join(carpeta, nombre_miniatura))

    # ==========================
    # GUARDAR ARCHIVO DEL JUEGO
    # ==========================

    if archivo_juego and archivo_juego.filename != "":
        extension = archivo_juego.filename.split(".")[-1]
        nombre_archivo = str(uuid.uuid4()) + "." + extension
        carpeta = "uploads/juegos/archivos"
        os.makedirs(carpeta, exist_ok=True)
        archivo_juego.save(os.path.join(carpeta, nombre_archivo))

    juego_id = crear_juego(
        creador_id,
        nombre,
        descripcion,
        nombre_miniatura,
        nombre_archivo
    )

    return jsonify({
        "correcto": True,
        "mensaje": "Juego creado correctamente.",
        "id": juego_id
    })

# ==========================================
# OBTENER TODOS LOS JUEGOS
# ==========================================

@games.route("/api/games", methods=["GET"])
def listar():
    juegos = obtener_juegos()
    lista = []

    for juego in juegos:
        lista.append({
            "id": juego["id"],
            "nombre": juego["nombre"],
            "descripcion": juego["descripcion"],
            "miniatura": juego["miniatura"],
            "archivo": juego["archivo"],
            "visitas": juego["visitas"],
            "likes": juego["likes"],
            "favoritos": juego["favoritos"]
        })

    return jsonify(lista)

# ==========================================
# OBTENER JUEGOS DE UN USUARIO
# ==========================================

@games.route("/api/mygames/<int:id_usuario>", methods=["GET"])
def mis_juegos_por_id(id_usuario):
    juegos = obtener_juegos_usuario(id_usuario)
    lista = []

    for juego in juegos:
        lista.append({
            "id": juego["id"],
            "nombre": juego["nombre"],
            "descripcion": juego["descripcion"],
            "miniatura": juego["miniatura"],
            "archivo": juego["archivo"],
            "visitas": juego["visitas"],
            "likes": juego["likes"],
            "favoritos": juego["favoritos"]
        })

    return jsonify(lista)

# ==========================================
# OBTENER UN JUEGO
# ==========================================

@games.route("/api/games/<int:id_juego>", methods=["GET"])
def obtener(id_juego):
    juego = obtener_juego(id_juego)

    if juego is None:
        return jsonify({
            "correcto": False,
            "mensaje": "Juego no encontrado."
        }), 404

    sumar_visita(id_juego)
    juego = obtener_juego(id_juego)

    return jsonify({
        "id": juego["id"],
        "creador_id": juego["creador_id"],
        "nombre": juego["nombre"],
        "descripcion": juego["descripcion"],
        "categoria": juego["categoria"],
        "miniatura": juego["miniatura"],
        "archivo": juego["archivo"],
        "visitas": juego["visitas"],
        "likes": juego["likes"],
        "favoritos": juego["favoritos"],
        "version": juego["version"],
        "estado": juego["estado"]
    })

# ==========================================
# MIS JUEGOS
# ==========================================

@games.route("/api/mygames", methods=["GET"])
@login_requerido
def mis_juegos():
    usuario_id = request.usuario["id"]
    juegos = obtener_juegos_usuario(usuario_id)
    lista = []

    for juego in juegos:
        lista.append({
            "id": juego["id"],
            "nombre": juego["nombre"],
            "descripcion": juego["descripcion"],
            "miniatura": juego["miniatura"],
            "estado": juego["estado"],
            "visitas": juego["visitas"],
            "likes": juego["likes"],
            "favoritos": juego["favoritos"]
        })

    return jsonify(lista)

# ==========================================
# EDITAR JUEGO
# ==========================================

@games.route("/api/games/<int:id_juego>", methods=["PUT"])
@login_requerido
def editar_juego(id_juego):
    datos = request.get_json()
    actualizar_juego(
        id_juego,
        datos["nombre"],
        datos["descripcion"],
        datos["categoria"]
    )
    return jsonify({
        "correcto": True,
        "mensaje": "Juego actualizado correctamente."
    })

# ==========================================
# ELIMINAR JUEGO
# ==========================================

@games.route("/api/games/<int:id_juego>", methods=["DELETE"])
@login_requerido
def borrar_juego(id_juego):
    eliminar_juego(id_juego)
    return jsonify({
        "correcto": True,
        "mensaje": "Juego eliminado correctamente."
    })

# ==========================================
# JUEGOS PÚBLICOS
# ==========================================

@games.route("/api/store", methods=["GET"])
def tienda():
    juegos = obtener_juegos_publicos()
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

# ==========================================
# BUSCAR JUEGOS
# ==========================================

@games.route("/api/search")
def buscar():
    texto = request.args.get("q", "")
    juegos = buscar_juegos(texto)
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

# ==========================================
# SUMAR VISITA
# ==========================================

@games.route("/api/games/<int:id_juego>/visit", methods=["POST"])
def visitar(id_juego):
    sumar_visita(id_juego)
    return jsonify({"correcto": True})

# ==========================================
# DAR LIKE
# ==========================================

@games.route("/api/games/<int:id_juego>/like", methods=["POST"])
@login_requerido
def like(id_juego):
    usuario = request.usuario
    correcto = dar_like(id_juego, usuario["id"])

    if correcto:
        return jsonify({
            "correcto": True,
            "mensaje": "Like agregado."
        })

    return jsonify({
        "correcto": False,
        "mensaje": "Ya diste like."
    })

# ==========================================
# QUITAR LIKE
# ==========================================

@games.route("/api/games/<int:id_juego>/like", methods=["DELETE"])
@login_requerido
def dislike(id_juego):
    usuario = request.usuario
    quitar_like(id_juego, usuario["id"])
    return jsonify({
        "correcto": True,
        "mensaje": "Like eliminado."
    })

# ==========================================
# ESTADO DEL LIKE
# ==========================================

@games.route("/api/games/<int:id_juego>/like", methods=["GET"])
@login_requerido
def estado_like(id_juego):
    usuario = request.usuario
    return jsonify({
        "like": tiene_like(id_juego, usuario["id"])
    })

# ==========================================
# FAVORITOS
# ==========================================

@games.route("/api/games/<int:id_juego>/favorite", methods=["GET"])
@login_requerido
def estado_favorito(id_juego):
    usuario = request.usuario
    return jsonify({
        "favorito": tiene_favorito(id_juego, usuario["id"])
    })

@games.route("/api/games/<int:id_juego>/favorite", methods=["POST"])
@login_requerido
def favorito(id_juego):
    usuario = request.usuario
    correcto = agregar_favorito(id_juego, usuario["id"])
    return jsonify({"correcto": correcto})

@games.route("/api/games/<int:id_juego>/favorite", methods=["DELETE"])
@login_requerido
def eliminar_favorito(id_juego):
    usuario = request.usuario
    quitar_favorito(id_juego, usuario["id"])
    return jsonify({"correcto": True})

# ==========================================
# BIBLIOTECA
# ==========================================

@games.route("/api/library")
@login_requerido
def biblioteca():
    usuario = request.usuario
    juegos = obtener_favoritos(usuario["id"])
    lista = []

    for juego in juegos:
        lista.append({
            "id": juego["id"],
            "nombre": juego["nombre"],
            "descripcion": juego["descripcion"],
            "miniatura": juego["miniatura"],
            "categoria": juego["categoria"],
            "likes": juego["likes"],
            "visitas": juego["visitas"]
        })

    return jsonify(lista)

# ==========================================
# SUBIR ARCHIVO DEL JUEGO
# ==========================================

@games.route("/api/games/<int:id_juego>/upload", methods=["POST"])
@login_requerido
def subir_archivo(id_juego):
    if "archivo" not in request.files:
        return jsonify({
            "correcto": False,
            "mensaje": "No se envió ningún archivo."
        }), 400

    archivo = request.files["archivo"]

    if archivo.filename == "":
        return jsonify({
            "correcto": False,
            "mensaje": "Archivo inválido."
        }), 400

    carpeta = os.path.join("uploads", "juegos", str(id_juego))
    os.makedirs(carpeta, exist_ok=True)

    nombre = secure_filename(archivo.filename)
    ruta = os.path.join(carpeta, nombre)
    archivo.save(ruta)

    actualizar_archivo_juego(id_juego, nombre, os.path.getsize(ruta))

    return jsonify({
        "correcto": True,
        "archivo": nombre
    })

# ==========================================
# COMENTARIOS
# ==========================================

@games.route("/api/games/<int:id_juego>/comentarios", methods=["GET"])
def get_comentarios(id_juego):
    comentarios = obtener_comentarios(id_juego)
    lista = []

    for comentario in comentarios:
        lista.append({
            "id": comentario["id"],
            "usuario_id": comentario["usuario_id"],
            "nombre": comentario["nombre"],
            "avatar": comentario["avatar"],
            "comentario": comentario["comentario"],
            "fecha": comentario["fecha"]
        })

    return jsonify(lista)

@games.route("/api/games/<int:id_juego>/comentarios", methods=["POST"])
@login_requerido
def add_comentario(id_juego):
    usuario = request.usuario
    datos = request.get_json()
    comentario = datos.get("comentario")

    if not comentario:
        return jsonify({
            "correcto": False,
            "mensaje": "El comentario no puede estar vacío."
        }), 400

    correcto, mensaje = agregar_comentario(usuario["id"], id_juego, comentario)

    return jsonify({
        "correcto": correcto,
        "mensaje": mensaje
    })