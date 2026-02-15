// BOTONES Y MODALES
const btnRegistrar = document.getElementById("Registrar");
const btnLogin = document.getElementById("btnLogin");

const modalLogin = document.getElementById("modal");
const modalRegistrar = document.getElementById("modal-registrar");

const modalMensaje = document.getElementById("modalMensaje");
const iconoMensaje = document.getElementById("iconoMensaje");
const tituloMensaje = document.getElementById("tituloMensaje");
const textoMensaje = document.getElementById("textoMensaje");

console.log("JS cargado correctamente");

// =============================
// ABRIR / CERRAR MODALES
// =============================

btnRegistrar.addEventListener("click", function (e) {
    e.preventDefault();
    modalLogin.classList.remove("active");
    modalRegistrar.classList.add("active");
});

btnLogin.addEventListener("click", function () {
    modalRegistrar.classList.remove("active");
    modalLogin.classList.add("active");
});

function cerrarModal() {
    modalLogin.classList.remove("active");
    modalRegistrar.classList.remove("active");
}


// =============================
// MODAL MENSAJE (ÉXITO / ERROR)
// =============================

function mostrarMensaje(tipo, titulo, texto) {

    iconoMensaje.className = "icono " + tipo;

    if (tipo === "exito") {
        iconoMensaje.innerHTML = "✓";
    } else {
        iconoMensaje.innerHTML = "✕";
    }

    tituloMensaje.textContent = titulo;
    textoMensaje.textContent = texto;

    modalMensaje.classList.add("active");
}

function cerrarMensaje() {
    modalMensaje.classList.remove("active");
}


// =============================
// REGISTRO
// =============================

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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {

            cerrarModal();

            mostrarMensaje(
                "exito",
                "Éxito",
                "Usuario registrado correctamente"
            );

        } else {

            mostrarMensaje(
                "error",
                "Error",
                result.message || "No se pudo registrar"
            );
        }

    } catch (error) {

        mostrarMensaje(
            "error",
            "Error",
            "Error conectando con el servidor"
        );
    }
});


// =============================
// LOGIN
// =============================

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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {

            cerrarModal();

            mostrarMensaje(
                "exito",
                "Éxito",
                "Inicio de sesión exitoso"
            );

        } else {

            mostrarMensaje(
                "error",
                "Error",
                result.message || "Credenciales incorrectas"
            );
        }

    } catch (error) {

        mostrarMensaje(
            "error",
            "Error",
            "Error conectando con el servidor"
        );
    }
});
