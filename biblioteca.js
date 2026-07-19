const token = localStorage.getItem("token");

async function cargarBiblioteca(){

    const respuesta = await fetch(

        "http://127.0.0.1:5000/api/library",

        {

            headers:{

                Authorization:"Bearer "+token

            }

        }

    );

    const juegos = await respuesta.json();

    const contenedor = document.getElementById("biblioteca");

    contenedor.innerHTML="";

    juegos.forEach(juego=>{

        contenedor.innerHTML += `

        <div class="col-md-3 mb-4">

            <div class="card h-100">

                <img

                src="http://127.0.0.1:5000/uploads/juegos/${juego.miniatura}"

                class="card-img-top"

                style="height:180px;object-fit:cover;">

                <div class="card-body">

                    <h5>${juego.nombre}</h5>

                    <p>${juego.categoria}</p>

                    <button

                    class="btn btn-success w-100"

                    onclick="window.location='juego.html?id=${juego.id}'">

                    Abrir

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

cargarBiblioteca();