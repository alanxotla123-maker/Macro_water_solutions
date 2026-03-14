const { OAuth2Client } = require("google-auth-library");
 
const GOOGLE_CLIENT_ID = "561610268736-8eam83vcf2694ihti70pb4dc4t64k6u5.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
 
router.post("/google", async (req, res) => {
    const { token } = req.body;
 
    if (!token) {
        return res.status(400).json({ message: "Token no proporcionado." });
    }
 
    try {
        // 1. Verificar el token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
 
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;
 
        // 2. Buscar si el usuario ya existe en la BD
        // ✅ Con mysql2, db.query devuelve [rows, fields] — hay que desestructurar
        const [rows] = await db.query(
            "SELECT * FROM usuarios WHERE correo = ? LIMIT 1",
            [email]
        );
 
        let usuario;
 
        if (rows.length === 0) {
            // 3a. No existe → crearlo automáticamente
            const [result] = await db.query(
                `INSERT INTO usuarios (nombre, correo, password, direccion, rol_id)
                 VALUES (?, ?, ?, ?, ?)`,
                [name, email, googleId, "Dirección no ingresada", 2]
            );
 
            // 3b. Traer el usuario recién insertado por su ID
            const [nuevoUsuario] = await db.query(
                "SELECT * FROM usuarios WHERE id = ? LIMIT 1",
                [result.insertId]
            );
            usuario = nuevoUsuario[0];
        } else {
            // 4. Ya existe → usarlo directamente
            usuario = rows[0];
        }
 
        // 5. Devolver el usuario igual que en tu login normal
        return res.json({ usuario });
 
    } catch (error) {
        console.error("Error verificando token de Google:", error);
        return res.status(401).json({ message: "Token de Google inválido." });
    }
});