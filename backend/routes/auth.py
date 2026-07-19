from flask import Blueprint, request, jsonify
import jwt
import datetime
from backend.database import crear_usuario, iniciar_sesion
from backend.config import SECRET_KEY

auth = Blueprint("auth", __name__)

@auth.route("/api/register", methods=["POST"])
def register():
    try:
        datos = request.get_json()
        
        nombre = datos.get("nombre")
        correo = datos.get("correo")
        contrasena = datos.get("contrasena")
        fecha_nacimiento = datos.get("fechaNacimiento")
        genero = datos.get("genero")
        
        correcto, mensaje = crear_usuario(
            nombre=nombre,
            correo=correo,
            contrasena=contrasena,
            fecha_nacimiento=fecha_nacimiento,
            genero=genero
        )
        
        return jsonify({
            "correcto": correcto,
            "mensaje": mensaje
        })
        
    except Exception as e:
        print(f"Error en register: {e}")
        return jsonify({
            "correcto": False,
            "mensaje": f"Error en el servidor: {str(e)}"
        }), 500

@auth.route("/api/login", methods=["POST"])
def login():
    try:
        datos = request.get_json()
        
        correo = datos.get("correo")
        contrasena = datos.get("contrasena")
        
        usuario, mensaje = iniciar_sesion(correo, contrasena)
        
        if usuario:
            token = jwt.encode({
                "id": usuario["id"],
                "nombre": usuario["nombre"],
                "correo": usuario["correo"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, SECRET_KEY, algorithm="HS256")
            
            return jsonify({
                "correcto": True,
                "mensaje": mensaje,
                "usuario": usuario,
                "token": token
            })
        else:
            return jsonify({
                "correcto": False,
                "mensaje": mensaje
            }), 401
            
    except Exception as e:
        print(f"Error en login: {e}")
        return jsonify({
            "correcto": False,
            "mensaje": f"Error en el servidor: {str(e)}"
        }), 500