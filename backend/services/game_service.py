from backend.database import (
    crear_juego, obtener_juegos, obtener_juego, obtener_juegos_usuario,
    obtener_juegos_publicos, buscar_juegos, sumar_visita, dar_like,
    quitar_like, tiene_like, agregar_favorito, quitar_favorito,
    tiene_favorito, obtener_favoritos, actualizar_juego, eliminar_juego,
    actualizar_archivo, actualizar_archivo_juego, agregar_comentario,
    obtener_comentarios
)

# Re-exportar todas las funciones
__all__ = [
    'crear_juego', 'obtener_juegos', 'obtener_juego',
    'obtener_juegos_usuario', 'obtener_juegos_publicos', 'buscar_juegos',
    'sumar_visita', 'dar_like', 'quitar_like', 'tiene_like',
    'agregar_favorito', 'quitar_favorito', 'tiene_favorito',
    'obtener_favoritos', 'actualizar_juego', 'eliminar_juego',
    'actualizar_archivo', 'actualizar_archivo_juego',
    'agregar_comentario', 'obtener_comentarios'
]