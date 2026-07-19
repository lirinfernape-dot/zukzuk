const formulario = document.getElementById("formRegistro");

formulario.addEventListener("submit", async function (e) {

    e.preventDefault();

    const usuario = {

        nombre: document.getElementById("nombre").value,

        correo: document.getElementById("correo").value,

        contrasena: document.getElementById("contrasena").value,

        fechaNacimiento: document.getElementById("fechaNacimiento").value,

        genero: document.getElementById("genero").value

    };

    try {

        const respuesta = await fetch(

            "http://127.0.0.1:5000/api/register",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(usuario)

            }

        );

        const datos = await respuesta.json();

        alert(datos.mensaje);

        if (datos.correcto) {

            formulario.reset();

        }

    } catch (error) {

        alert("No se pudo conectar con el servidor.");

        console.log(error);

    }

});