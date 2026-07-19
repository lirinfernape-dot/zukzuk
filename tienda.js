// Configuración de la URL
const API_URL = 'https://zukzuk-fvhn.onrender.com';

console.log('Tienda - API_URL:', API_URL);

const token = localStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
}

async function cargarTienda() {
    try {
        const perfilResp = await fetch(`${API_URL}/api/users/perfil`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        const perfilData = await perfilResp.json();
        document.getElementById("monedasUsuario").textContent = perfilData.usuario.monedas || 0;
        
        const itemsResp = await fetch(`${API_URL}/api/shop/items`, {
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const items = await itemsResp.json();
        const contenedor = document.getElementById("listaItems");
        contenedor.innerHTML = "";
        
        if (items.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-secondary">
                        No hay items disponibles en la tienda.
                    </div>
                </div>
            `;
            return;
        }
        
        items.forEach(item => {
            const precioTexto = item.precio === 0 ? "🆓 Gratis" : `🪙 ${item.precio}`;
            const imagenUrl = item.imagen 
                ? `${API_URL}/uploads/avatars/${item.imagen}`
                : 'default_avatar.png';
            
            contenedor.innerHTML += `
                <div class="col-md-3 mb-4">
                    <div class="shop-item">
                        <img 
                            src="${imagenUrl}"
                            onerror="this.src='default_avatar.png'"
                        >
                        <h5 class="mt-3">${item.nombre}</h5>
                        <p class="text-muted small">${item.descripcion}</p>
                        <p class="shop-price">${precioTexto}</p>
                        <button 
                            class="btn-buy" 
                            onclick="comprarItem(${item.id}, ${item.precio})"
                            ${perfilData.usuario.monedas < item.precio ? 'disabled' : ''}
                        >
                            ${perfilData.usuario.monedas < item.precio ? '🔒' : '🛒'} Comprar
                        </button>
                    </div>
                </div>
            `;
        });
        
    } catch (error) {
        console.error("Error cargando tienda:", error);
        document.getElementById("listaItems").innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    No se pudo cargar la tienda.
                </div>
            </div>
        `;
    }
}

async function comprarItem(itemId, precio) {
    const confirmar = confirm(`¿Deseas comprar este item por ${precio} monedas?`);
    if (!confirmar) return;
    
    try {
        const respuesta = await fetch(`${API_URL}/api/shop/buy/${itemId}`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        });
        
        const datos = await respuesta.json();
        alert(datos.mensaje);
        
        if (datos.correcto) {
            cargarTienda();
        }
        
    } catch (error) {
        console.error("Error comprando item:", error);
        alert("Error al comprar item.");
    }
}

cargarTienda();