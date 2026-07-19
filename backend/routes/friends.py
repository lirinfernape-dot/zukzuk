from flask import Blueprint, request, jsonify
from backend.middleware.auth_middleware import login_requerido
from backend.database import agregar_amigo, obtener_amigos, es_amigo, eliminar_amigo

friends = Blueprint("friends", __name__)

@friends.route("/api/friends/add", methods=["POST"])
@login_requerido
def add_friend():
    usuario_id = request.usuario["id"]
    datos = request.get_json()
    amigo_id = datos.get("amigo_id")
    
    if not amigo_id:
        return jsonify({
            "correcto": False,
            "mensaje": "ID de amigo requerido"
        }), 400
    
    correcto, mensaje = agregar_amigo(usuario_id, amigo_id)
    
    return jsonify({
        "correcto": correcto,
        "mensaje": mensaje
    })

@friends.route("/api/friends", methods=["GET"])
@login_requerido
def get_friends():
    usuario_id = request.usuario["id"]
    amigos = obtener_amigos(usuario_id)
    
    return jsonify([dict(amigo) for amigo in amigos])

@friends.route("/api/friends/check/<int:amigo_id>", methods=["GET"])
@login_requerido
def check_friend(amigo_id):
    usuario_id = request.usuario["id"]
    resultado = es_amigo(usuario_id, amigo_id)
    
    return jsonify({
        "esAmigo": resultado
    })

@friends.route("/api/friends/remove/<int:amigo_id>", methods=["DELETE"])
@login_requerido
def remove_friend(amigo_id):
    usuario_id = request.usuario["id"]
    resultado = eliminar_amigo(usuario_id, amigo_id)
    
    return jsonify({
        "correcto": resultado,
        "mensaje": "Amigo eliminado" if resultado else "Error al eliminar amigo"
    })