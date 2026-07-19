from flask import Blueprint, request, jsonify
from backend.middleware.auth_middleware import login_requerido
from backend.database import actualizar_personaje, obtener_personaje

avatar_customizer = Blueprint("avatar_customizer", __name__)

@avatar_customizer.route("/api/avatar/save", methods=["POST"])
@login_requerido
def guardar_personaje():
    usuario_id = request.usuario["id"]
    datos = request.get_json()
    
    if not datos:
        return jsonify({
            "correcto": False,
            "mensaje": "No se recibieron datos"
        }), 400
    
    resultado = actualizar_personaje(usuario_id, datos)
    
    if resultado:
        return jsonify({
            "correcto": True,
            "mensaje": "Personaje guardado correctamente"
        })
    
    return jsonify({
        "correcto": False,
        "mensaje": "Error al guardar el personaje"
    }), 500

@avatar_customizer.route("/api/avatar/load", methods=["GET"])
@login_requerido
def cargar_personaje():
    usuario_id = request.usuario["id"]
    personaje = obtener_personaje(usuario_id)
    
    if personaje:
        return jsonify({
            "correcto": True,
            "personaje": personaje
        })
    
    # Valores por defecto
    return jsonify({
        "correcto": True,
        "personaje": {
            "skin_color": "#F5D0B8",
            "hair_style": "default",
            "hair_color": "#4A2F1A",
            "eye_color": "#5C3D2E",
            "shirt_color": "#3B82F6",
            "pants_color": "#1E3A5F",
            "shoes_color": "#2D2D2D",
            "hat_style": "none",
            "glasses_style": "none",
            "body_type": "normal",
            "gender_avatar": "male"
        }
    })

@avatar_customizer.route("/api/avatar/preview", methods=["POST"])
@login_requerido
def generar_preview():
    datos = request.get_json()
    # Generar URL del avatar con los parámetros
    # Esto se puede integrar con un servicio como Roblox Avatar API o generar SVG
    return jsonify({
        "correcto": True,
        "url": f"/avatar-preview?{datos}"
    })