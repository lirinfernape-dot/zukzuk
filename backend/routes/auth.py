from flask import Blueprint, request, jsonify
from database import crear_usuario, iniciar_sesion, obtener_usuario
from middleware.auth_middleware import login_requerido

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
            # Generar token JWT (simplificado)
            import jwt
            import datetime
            from config import SECRET_KEY
            
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

@auth.route("/api/perfil", methods=["GET"])
@login_requerido
def perfil():
    try:
        usuario_id = request.usuario["id"]
        usuario = obtener_usuario(usuario_id)
        
        if usuario:
            return jsonify({
                "correcto": True,
                "usuario": usuario
            })
        else:
            return jsonify({
                "correcto": False,
                "mensaje": "Usuario no encontrado"
            }), 404
            
    except Exception as e:
        print(f"Error en perfil: {e}")
        return jsonify({
            "correcto": False,
            "mensaje": f"Error en el servidor: {str(e)}"
        }), 500