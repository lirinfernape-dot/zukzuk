const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

const parametros = new URLSearchParams(
    window.location.search
);

const id = parametros.get("id");

async function cargarJuego() {
    try {
        const respuesta = await fetch(
            "http://127.0.0.1:5000/api/games/" + id
        );

        if (!respuesta.ok) {
            alert("No se pudo cargar el juego.");
            window.location.href = "dashboard.html";
            return;
        }

        const juego = await respuesta.json();

        document.getElementById("nombre").value = juego.nombre || "";
        document.getElementById("descripcion").value = juego.descripcion || "";
        document.getElementById("categoria").value = juego.categoria || "";
        document.getElementById("version").value = juego.version || "1.0.0";

    } catch (error) {
        console.error(error);
        alert("Error al cargar el juego.");
    }
}

cargarJuego();

document
    .getElementById("formEditar")
    .addEventListener(
        "submit",
        async function (e) {
            e.preventDefault();

            try {
                // 1. Actualizar datos del juego
                const respuesta = await fetch(
                    "http://127.0.0.1:5000/api/games/" + id,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + token
                        },
                        body: JSON.stringify({
                            nombre: document.getElementById("nombre").value,
                            descripcion: document.getElementById("descripcion").value,
                            categoria: document.getElementById("categoria").value
                        })
                    }
                );

                const datos = await respuesta.json();

                if (!datos.correcto) {
                    alert(datos.mensaje || "Error al actualizar el juego.");
                    return;
                }

                // 2. Subir nuevo archivo ZIP si se seleccionó uno
                const archivoInput = document.getElementById("archivo");
                const zip = archivoInput.files[0];

                if (zip) {
                    const formData = new FormData();
                    formData.append("archivo", zip);
                    formData.append(
                        "version",
                        document.getElementById("version").value || "1.0.0"
                    );

                    const respuestaArchivo = await fetch(
                        "http://127.0.0.1:5000/api/games/" + id + "/upload",
                        {
                            method: "POST",
                            headers: {
                                Authorization: "Bearer " + token
                            },
                            body: formData
                        }
                    );

                    const datosArchivo = await respuestaArchivo.json();

                    if (!datosArchivo.correcto) {
                        alert("Juego actualizado pero hubo error al subir el archivo: " + datosArchivo.mensaje);
                        return;
                    }
                }

                alert("Juego actualizado correctamente.");
                window.location.href = "dashboard.html";

            } catch (error) {
                console.error(error);
                alert("Error al actualizar el juego.");
            }
        }
    );