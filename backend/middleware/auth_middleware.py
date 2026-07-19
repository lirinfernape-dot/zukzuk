from functools import wraps
from flask import request, jsonify

from utils.jwt_manager import verificar_token


def login_requerido(func):

    @wraps(func)
    def decorador(*args, **kwargs):

        autorizacion = request.headers.get("Authorization")

        if autorizacion is None:

            return jsonify({

                "correcto": False,

                "mensaje": "Token no enviado."

            }), 401

        if not autorizacion.startswith("Bearer "):

            return jsonify({

                "correcto": False,

                "mensaje": "Formato de token incorrecto."

            }), 401

        token = autorizacion.split(" ")[1]

        datos = verificar_token(token)

        if datos is None:

            return jsonify({

                "correcto": False,

                "mensaje": "Token inválido o expirado."

            }), 401

        request.usuario = datos

        return func(*args, **kwargs)

    return decorador