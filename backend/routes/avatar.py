from flask import Blueprint, request, jsonify
from backend.middleware.auth_middleware import login_requerido
from backend.database import actualizar_avatar
import os
import uuid

avatar = Blueprint("avatar", __name__)

@avatar.route("/api/users/avatar", methods=["POST"])
@login_requerido
def subir_avatar():
    usuario_id = request.usuario["id"]
    
    if "avatar" not in request.files:
        return jsonify({
            "correcto": False,
            "mensaje": "No se envió ningún archivo."
        }), 400
    
    archivo = request.files["avatar"]
    
    if archivo.filename == "":
        return jsonify({
            "correcto": False,
            "mensaje": "Archivo inválido."
        }), 400
    
    extension = archivo.filename.split(".")[-1].lower()
    if extension not in ["jpg", "jpeg", "png", "gif", "webp"]:
        return jsonify({
            "correcto": False,
            "mensaje": "Formato no permitido. Usa JPG, PNG, GIF o WEBP."
        }), 400
    
    nombre_archivo = str(uuid.uuid4()) + "." + extension
    carpeta = "uploads/avatars"
    os.makedirs(carpeta, exist_ok=True)
    
    ruta = os.path.join(carpeta, nombre_archivo)
    archivo.save(ruta)
    
    actualizar_avatar(usuario_id, nombre_archivo)
    
    return jsonify({
        "correcto": True,
        "mensaje": "Avatar actualizado correctamente.",
        "avatar": nombre_archivo
    })