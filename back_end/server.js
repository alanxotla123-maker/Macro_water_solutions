require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { OAuth2Client } = require("google-auth-library"); 

// 1. IMPORTACIONES DE AWS Y MULTER
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require('multer');
const multerS3 = require('multer-s3');

// --- 💳 IMPORTACIÓN DE MERCADO PAGO ---
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// 2. REGISTRA TS-NODE
require('ts-node').register(); 

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- 💳 CONFIGURACIÓN DE MERCADO PAGO ---
const clientMP = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-5657182380054199-031111-866b7586a390e5a947a64f31638a22af-3259263857' 
});

// --- CONFIGURACIÓN DE MIDDLEWARES ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use(cors({
    origin: ['https://macrowatersolutions.com', 'http://macrowatersolutions.com', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// 3. IMPORTACIONES DE BASE DE DATOS Y RUTAS
const { pool } = require('./src/config/db'); 
const authRoutes = require('./src/routes/auth.routes'); 

// 4. CONFIGURACIÓN DE AWS S3
const s3 = new S3Client({
    region: (process.env.AWS_REGION || "us-east-2").trim(),
    credentials: {
        accessKeyId: String(process.env.AWS_ACCESS_KEY_ID || "").trim(), 
        secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY || "").trim(),
    },
});

// 5. CONFIGURACIÓN DE MULTER
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: (process.env.AWS_BUCKET_NAME || 'aquacleanpro').trim(), 
        key: (req, file, cb) => {
            cb(null, `productos/${Date.now()}_${file.originalname}`);
        }
    })
});

// ================= RUTA DE PRUEBA DE BASE DE DATOS =================
app.post("/api/test-db-directo", async (req, res) => {
    try {
        const { userId, productoId, precio } = req.body;
        
        const sqlPedido = `
            INSERT INTO pedidos 
            (usuario_id, producto_id, cantidad, total_linea, estado) 
            VALUES (?, ?, ?, ?, 'test_exitoso')`;
        
        const [result] = await pool.execute(sqlPedido, [
            userId || 1, 
            productoId || 1, 
            1, 
            precio || 100
        ]);

        res.json({ message: "✅ ¡Conexión exitosa!", pedidoId: result.insertId });
    } catch (dbErr) {
        console.error("❌ ERROR DE SQL:", dbErr.message);
        res.status(500).json({ 
            error: "Error en la base de datos", 
            detalle: dbErr.message 
        });
    }
});

// ================= RUTAS DE PRODUCTOS =================

app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM productos");
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute("SELECT * FROM productos WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "No encontrado" });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/productos', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, precio, descripcion, stock, categoria_id } = req.body;
        const imagenUrl = req.file ? req.file.location : ""; 
        const sql = `INSERT INTO productos (nombre, precio, descripcion, stock, imagen, categoria_id) VALUES (?, ?, ?, ?, ?, ?)`;
        await pool.execute(sql, [nombre, precio, descripcion, stock, imagenUrl, categoria_id || 1]);
        res.status(201).json({ message: "Guardado" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/productos/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, descripcion, stock, categoria_id } = req.body;
        const [rows] = await pool.execute("SELECT imagen FROM productos WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Producto no existe" });
        
        let imagenNueva = rows[0]?.imagen;
        if (req.file) {
            imagenNueva = req.file.location;
            if (rows[0].imagen && rows[0].imagen.includes('amazonaws.com')) {
                const key = rows[0].imagen.split('.com/')[1];
                await s3.send(new DeleteObjectCommand({
                    Bucket: (process.env.AWS_BUCKET_NAME || 'aquacleanpro').trim(),
                    Key: key,
                })).catch(e => console.log("Error S3 Delete:", e));
            }
        }
        await pool.execute("UPDATE productos SET nombre=?, precio=?, descripcion=?, stock=?, imagen=?, categoria_id=? WHERE id=?", 
            [nombre, precio, descripcion, stock, imagenNueva, categoria_id || 1, id]);
        res.json({ mensaje: 'Actualizado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute("SELECT imagen FROM productos WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "No encontrado" });

        if (rows[0].imagen?.includes('amazonaws.com')) {
            const key = rows[0].imagen.split('.com/')[1];
            await s3.send(new DeleteObjectCommand({
                Bucket: (process.env.AWS_BUCKET_NAME || 'aquacleanpro').trim(),
                Key: key,
            })).catch(e => console.log("Error S3 Delete:", e));
        }
        await pool.execute("DELETE FROM productos WHERE id = ?", [id]);
        res.json({ message: "Eliminado" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= RUTAS DE AUTENTICACIÓN =================

app.use('/api/auth', authRoutes);

app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, sub: googleId } = ticket.getPayload();
        const [rows] = await pool.execute("SELECT id, nombre, correo, direccion, rol_id FROM usuarios WHERE correo = ? LIMIT 1", [email]);

        let usuarioFinal;
        if (rows.length === 0) {
            const [result] = await pool.execute(
                "INSERT INTO usuarios (nombre, correo, password, direccion, rol_id) VALUES (?, ?, ?, ?, ?)",
                [name, email, googleId, "Dirección no ingresada", 2]
            );
            usuarioFinal = { id: result.insertId, nombre: name, correo: email, direccion: "Dirección no ingresada", rol: 'user' };
        } else {
            usuarioFinal = {
                id: rows[0].id, nombre: rows[0].nombre, correo: rows[0].correo,
                direccion: rows[0].direccion, rol: rows[0].rol_id === 1 ? 'admin' : 'user'
            };
        }
        res.json({ usuario: usuarioFinal });
    } catch (err) { res.status(401).json({ error: "Token inválido" }); }
});

// ================= RUTAS DE MERCADO PAGO =================
app.post("/api/create_preference", async (req, res) => {
    try {
        const { items, envio, userId } = req.body;

        const body = {
            items: items.map(prod => ({
                id: String(prod.id),
                title: String(prod.nombre),
                quantity: Number(prod.cantidad),
                unit_price: Number(prod.precio),
                currency_id: "MXN",
            })),
            metadata: { 
                user_id: userId 
            },
            back_urls: {
                success: "https://macrowatersolutions.com/pago-exitoso",
                failure: "https://macrowatersolutions.com/pago-fallido",
                pending: "https://macrowatersolutions.com/pago-pendiente",
            },
            auto_return: "approved",
            notification_url: "https://macrowatersolutions.com/api/webhook"
        };

        if (envio > 0) {
            body.items.push({
                id: "envio-001",
                title: "Costo de envío",
                quantity: 1,
                unit_price: Number(envio),
                currency_id: "MXN"
            });
        }

        const preference = new Preference(clientMP);
        const result = await preference.create({ body });
        res.json({ id: result.id });
    } catch (error) {
        console.error("Error Preferencia:", error);
        res.status(500).json({ error: "Error al crear la preferencia" });
    }
});

app.post("/api/webhook", async (req, res) => {
    try {
        const { action, data, type } = req.body;

        if (type === "payment" || action === "payment.created") {
            const paymentId = data.id;
            const payment = new Payment(clientMP);
            const paymentInfo = await payment.get({ id: paymentId });

            if (paymentInfo.status === "approved") {
                const userId = paymentInfo.metadata?.user_id;
                const itemsPagados = paymentInfo.additional_info?.items || paymentInfo.items || [];

                if (!userId) return res.sendStatus(200);

                for (const item of itemsPagados) {
                    if (item.title === "Costo de envío" || !item.id || item.id === "envio-001") continue;

                    try {
                        const totalItem = Number(item.unit_price) * Number(item.quantity);
                        
                        // Nombres corregidos según tu imagen de base de datos
                        const sqlPedido = `
                            INSERT INTO pedidos 
                            (usuario_id, producto_id, cantidad, total_linea, estado) 
                            VALUES (?, ?, ?, ?, 'pagado')`;
                        
                        await pool.execute(sqlPedido, [userId, item.id, item.quantity, totalItem]);
                        
                        // Actualizar stock
                        await pool.execute("UPDATE productos SET stock = stock - ? WHERE id = ?", [item.quantity, item.id]);
                        
                    } catch (dbErr) {
                        console.error("❌ Error DB en Webhook:", dbErr.message);
                    }
                }
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Error crítico Webhook:", error.message);
        res.sendStatus(200);
    }
});

// ================= RUTAS DE PEDIDOS (USUARIO Y ADMIN) =================

app.get('/api/mis-pedidos/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await pool.execute(`
            SELECT p.*, pr.nombre as producto_nombre 
            FROM pedidos p 
            JOIN productos pr ON p.producto_id = pr.id
            WHERE p.usuario_id = ?
            ORDER BY p.id DESC
        `, [userId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pedidos', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.*, u.nombre as cliente, pr.nombre as producto_nombre 
            FROM pedidos p 
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN productos pr ON p.producto_id = pr.id
            ORDER BY p.id DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/pedidos/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevoEstado } = req.body;
        await pool.execute("UPDATE pedidos SET estado = ? WHERE id = ?", [nuevoEstado, id]);
        res.json({ message: "Estado actualizado" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= INICIO DEL SERVIDOR =================

app.get('/api/health', (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor activo en puerto ${PORT}`);
});