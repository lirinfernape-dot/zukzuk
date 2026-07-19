const formulario = document.getElementById("formCrearJuego");

formulario.addEventListener("submit", async function (e) {

    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {

        alert("Debes iniciar sesión.");

        window.location.href = "login.html";

        return;

    }

    const formData = new FormData();

    formData.append(
        "nombre",
        document.getElementById("nombre").value
    );

    formData.append(
        "descripcion",
        document.getElementById("descripcion").value
    );

    formData.append(
        "categoria",
        document.getElementById("categoria").value
    );

    const miniatura = document.getElementById("miniatura").files[0];

    if (miniatura) {

        formData.append(
            "miniatura",
            miniatura
        );

    }

    const archivo = document.getElementById("archivo").files[0];

    if (archivo) {

        formData.append(
            "archivo",
            archivo
        );

    }

    try {

        const respuesta = await fetch(

            "http://127.0.0.1:5000/api/games/create",

            {

                method: "POST",

                headers: {

                    Authorization: "Bearer " + token

                },

                body: formData

            }

        );

        const datos = await respuesta.json();

        if (datos.correcto) {

            alert("Juego creado correctamente.");

            window.location.href = "index.html";

        }

        else {

            alert(datos.mensaje);

        }

    }

    catch (error) {

        console.error(error);

        alert("No se pudo conectar con el servidor.");

    }

});