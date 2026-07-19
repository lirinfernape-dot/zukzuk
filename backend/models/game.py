class Game:

    def __init__(
        self,
        creador_id,
        nombre,
        descripcion,
        categoria,
        miniatura,
        archivo,
        estado="privado",
        version="1.0.0"
    ):

        self.creador_id = creador_id
        self.nombre = nombre
        self.descripcion = descripcion
        self.categoria = categoria
        self.miniatura = miniatura
        self.archivo = archivo
        self.estado = estado
        self.version = version