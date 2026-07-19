const formulario = document.querySelector("form");

formulario.addEventListener("submit", async function (e) {

    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    try {

        const respuesta = await fetch("http://127.0.0.1:5000/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                correo: correo,
                contrasena: contrasena

            })

        });

        const datos = await respuesta.json();

        if (datos.correcto) {

            // Guardar usuario
            localStorage.setItem(

                "usuario",

                JSON.stringify(datos.usuario)

            );

            // Guardar JWT
            localStorage.setItem(

                "token",

                datos.token

            );

            alert("¡Bienvenido " + datos.usuario.nombre + "!");

            // Ir al inicio
            window.location.href = "index.html";

        } else {

            alert(datos.mensaje);

        }

    } catch (error) {

        console.error(error);

        alert("No se pudo conectar con el servidor.");

    }

});