// ==========================
// CARRITO DINÁMICO COMPLETO
// ==========================

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Crear carrito desde JS
function crearCarritoHTML() {

    const overlay = document.createElement("div");
    overlay.id = "overlay";
    overlay.className = "overlay";

    const panel = document.createElement("div");
    panel.id = "carrito-panel";
    panel.className = "carrito-panel";

    panel.innerHTML = `
        <div class="carrito-header">
            <h2>🛒 Tu Carrito</h2>
            <span id="cerrar-carrito" style="cursor:pointer;font-size:22px;">&times;</span>
        </div>

        <div id="lista-carrito" class="carrito-body"></div>

        <div class="carrito-footer">
            <div class="resumen">
                <div>
                    <span>Subtotal</span>
                    <span id="subtotal">$0.00</span>
                </div>
                <div>
                    <span>Envío</span>
                    <span>$59.99</span>
                </div>
            </div>

            <div class="total">
                <strong>Total</strong>
                <strong id="total">$0.00</strong>
            </div>

            <button class="btn-pagar">Proceder al pago</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    // Evento abrir carrito
    const botonCarrito = document.getElementById("iconCarrito");
    if (botonCarrito) {
        botonCarrito.addEventListener("click", abrirCarrito);
    }

    // Eventos cerrar
    overlay.addEventListener("click", cerrarCarrito);
    panel.querySelector("#cerrar-carrito").addEventListener("click", cerrarCarrito);
}

function abrirCarrito() {
    document.getElementById("carrito-panel").classList.add("activo");
    document.getElementById("overlay").classList.add("activo");
}

function cerrarCarrito() {
    document.getElementById("carrito-panel").classList.remove("activo");
    document.getElementById("overlay").classList.remove("activo");
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
}

function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    guardarCarrito();
}

function mostrarCarrito() {
    const contenedor = document.getElementById("lista-carrito");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    let subtotal = 0;

    carrito.forEach((producto, index) => {
        subtotal += producto.precio;

        contenedor.innerHTML += `
            <div class="item-carrito">
                <span>${producto.nombre}</span>
                <span>$${producto.precio.toFixed(2)}</span>
                <button onclick="eliminarProducto(${index})">🗑</button>
            </div>
        `;
    });

    document.getElementById("subtotal").textContent =
        "$" + subtotal.toFixed(2);

    document.getElementById("total").textContent =
        "$" + (subtotal + 59.99).toFixed(2);
}

function eliminarProducto(index) {
    carrito.splice(index, 1);
    guardarCarrito();
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    crearCarritoHTML();
    mostrarCarrito();
});