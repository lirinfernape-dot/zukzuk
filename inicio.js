async function cargarInicio() {

    const respuesta = await fetch(

        "http://127.0.0.1:5000/api/store"

    );

    const juegos = await respuesta.json();

    const lista = document.getElementById("listaJuegos");

    lista.innerHTML = "";

    juegos.forEach(juego => {

        lista.innerHTML += `

        <div class="col-md-3">

            <div class="card mb-4 shadow">

                <img

                src="http://127.0.0.1:5000/uploads/juegos/${juego.miniatura}"

                class="card-img-top"

                style="height:180px;object-fit:cover;">

                <div class="card-body">

                    <h5>${juego.nombre}</h5>

                    <p>${juego.descripcion}</p>

                    <p>

                        ❤️ ${juego.likes}

                        👁 ${juego.visitas}

                    </p>

                    <button

                    class="btn btn-success w-100"

                    onclick="abrirJuego(${juego.id})">

                    Ver Juego

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

function abrirJuego(id){

    window.location.href="juego.html?id="+id;

}

cargarInicio();
async function buscarJuego(){

    const texto =

    document.getElementById(

        "busqueda"

    ).value;

    const respuesta = await fetch(

        "http://127.0.0.1:5000/api/search?q="+

        encodeURIComponent(texto)

    );

    const juegos = await respuesta.json();

    mostrarJuegos(juegos);

}