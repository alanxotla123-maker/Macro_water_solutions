document.addEventListener("DOMContentLoaded", function () {

    const iconLogin = document.getElementById("iconLogin");
    const contenedorModal = document.getElementById("contenedorModal");

    iconLogin.addEventListener("click", function () {
        crearLogin();
    });

    // =============================
    // LOGIN
    // =============================
    function crearLogin() {

        eliminarModal();

        const modal = document.createElement("div");
        modal.className = "modal-overlay active";

        modal.innerHTML = `
            <div class="modal">
                <span class="cerrar" id="cerrarModal">×</span>

                <form class="login-form" id="formLogin">

                    <h2>Iniciar sesión</h2>
                    <p class="subtitle">Accede para gestionar tus compras.</p>

                    <label>Correo</label>
                    <input type="email" placeholder="ejemplo@gmail.com" required>

                    <label>Contraseña</label>
                    <input type="password" placeholder="**********" required>

                    <button type="submit" class="login-btn">Entrar</button>

                    <div class="divider">
                        <span>O continúa con</span>
                    </div>

                    <button type="button" class="google-btn">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" width="18">
                        Google
                    </button>

                    <p class="register-text">
                        ¿No tienes cuenta? <a href="#" id="irRegistro">Crear cuenta</a>
                    </p>

                </form>
            </div>
        `;

        contenedorModal.appendChild(modal);

        document.getElementById("cerrarModal").onclick = () => modal.remove();

        document.getElementById("irRegistro").onclick = (e) => {
            e.preventDefault();
            crearRegistro();
        };

        // LOGIN API
        document.getElementById("formLogin").addEventListener("submit", async function (e) {
            e.preventDefault();

            const inputs = this.querySelectorAll("input");

            const data = {
                correo: inputs[0].value,
                password: inputs[1].value
            };

            try {

                const res = await fetch("http://localhost:3000/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await res.json();

                if (res.ok) {
                    modal.remove();
                    mostrarMensaje("exito", "Éxito", "Inicio de sesión exitoso");
                } else {
                    mostrarMensaje("error", "Error", result.message || "Credenciales incorrectas");
                }

            } catch (error) {
                mostrarMensaje("error", "Error", "Error conectando con el servidor");
            }
        });

        // Google botón (ejemplo visual)
        document.querySelector(".google-btn").onclick = function () {
            mostrarMensaje("exito", "Google", "Login con Google próximamente");
        };
    }

    // =============================
    // REGISTRO
    // =============================
    function crearRegistro() {

        eliminarModal();

        const modal = document.createElement("div");
        modal.className = "modal-overlay active";

        modal.innerHTML = `
            <div class="modal">
                <span class="cerrar" id="cerrarModal">×</span>

                <form class="login-form" id="formRegistrar">

                    <h2>Crear cuenta</h2>
                    <p class="subtitle">Accede para gestionar tus compras.</p>

                    <label>Nombre</label>
                    <input type="text" placeholder="Nombre" required>

                    <label>Dirección</label>
                    <input type="text" placeholder="Dirección" required>

                    <label>Correo</label>
                    <input type="email" placeholder="ejemplo@gmail.com" required>

                    <label>Contraseña</label>
                    <input type="password" placeholder="**********" required>

                    <button type="submit" class="login-btn">Entrar</button>

                    <div class="divider">
                        <span>O continúa con</span>
                    </div>

                    <button type="button" class="google-btn">
                        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" width="18">
                        Google
                    </button>

                    <p class="register-text">
                        ¿Ya tienes cuenta? <a href="#" id="irLogin">Regresar</a>
                    </p>

                </form>
            </div>
        `;

        contenedorModal.appendChild(modal);

        document.getElementById("cerrarModal").onclick = () => modal.remove();

        document.getElementById("irLogin").onclick = (e) => {
            e.preventDefault();
            crearLogin();
        };

        // REGISTRO API
        document.getElementById("formRegistrar").addEventListener("submit", async function (e) {
            e.preventDefault();

            const inputs = this.querySelectorAll("input");

            const data = {
                nombre: inputs[0].value,
                direccion: inputs[1].value,
                correo: inputs[2].value,
                password: inputs[3].value
            };

            try {

                const res = await fetch("http://localhost:3000/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await res.json();

                if (res.ok) {
                    modal.remove();
                    mostrarMensaje("exito", "Éxito", "Usuario registrado correctamente");
                } else {
                    mostrarMensaje("error", "Error", result.message || "No se pudo registrar");
                }

            } catch (error) {
                mostrarMensaje("error", "Error", "Error conectando con el servidor");
            }
        });

        document.querySelector(".google-btn").onclick = function () {
            mostrarMensaje("exito", "Google", "Registro con Google próximamente");
        };
    }

    function eliminarModal() {
        const existente = document.querySelector(".modal-overlay");
        if (existente) existente.remove();
    }

});


// =============================
// MENSAJES
// =============================
function mostrarMensaje(tipo, titulo, texto) {

    const anterior = document.getElementById("modalMensaje");
    if (anterior) anterior.remove();

    const modalMensaje = document.createElement("div");
    modalMensaje.className = "modal-overlay active";

    modalMensaje.innerHTML = `
        <div class="modal">
            <span class="cerrar" id="cerrarMensaje">×</span>
            <div style="text-align:center; font-size:40px; margin-bottom:10px;">
                ${tipo === "exito" ? "✓" : "✕"}
            </div>
            <h2 style="text-align:center;">${titulo}</h2>
            <p style="text-align:center; margin-top:10px;">${texto}</p>
        </div>
    `;

    document.body.appendChild(modalMensaje);

    document.getElementById("cerrarMensaje").onclick = function () {
        modalMensaje.remove();
    };
}