from functools import wraps
from flask import request, jsonify
import jwt
from backend.config import SECRET_KEY

def login_requerido(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get("Authorization")
        
        if not token:
            return jsonify({
                "correcto": False,
                "mensaje": "Token no proporcionado"
            }), 401
        
        if token.startswith("Bearer "):
            token = token[7:]
        
        try:
            datos = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.usuario = {
                "id": datos["id"],
                "nombre": datos["nombre"],
                "correo": datos["correo"]
            }
        except jwt.ExpiredSignatureError:
            return jsonify({
                "correcto": False,
                "mensaje": "Token expirado"
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "correcto": False,
                "mensaje": "Token inválido"
            }), 401
        
        return f(*args, **kwargs)
    
    return decorated_function