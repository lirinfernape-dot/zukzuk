import jwt
import datetime

from config import SECRET_KEY


# ==========================================
# CREAR TOKEN
# ==========================================

def crear_token(id_usuario):

    payload = {

        "id": id_usuario,

        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=30)

    }

    token = jwt.encode(

        payload,

        SECRET_KEY,

        algorithm="HS256"

    )

    return token


# ==========================================
# VERIFICAR TOKEN
# ==========================================

def verificar_token(token):

    try:

        datos = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=["HS256"]

        )

        return datos

    except jwt.ExpiredSignatureError:

        return None

    except jwt.InvalidTokenError:

        return None