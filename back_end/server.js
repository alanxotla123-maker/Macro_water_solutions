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

require('ts-node').register(); 

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- 💳 CONFIGURACIÓN DE MERCADO PAGO ---
// Asegúrate de que en tu .env el MP_ACCESS_TOKEN empiece con APP_USR-...
const clientMP = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-2542794296995783-031111-fa63b2debb310b6cf4b892c0f205bf11-1195916182' 
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

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: (process.env.AWS_BUCKET_NAME || 'aquacleanpro').trim(), 
        key: (req, file, cb) => {
            cb(null, `productos/${Date.now()}_${file.originalname}`);
        }
    })
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

        if (!nombre || !precio) {
            return res.status(400).json({ error: "Nombre y precio son obligatorios" });
        }

        const sql = `INSERT INTO productos (nombre, precio, descripcion, stock, imagen, categoria_id) VALUES (?, ?, ?, ?, ?, ?)`;
        await pool.execute(sql, [
            nombre, 
            precio, 
            descripcion || "", 
            stock || 0, 
            imagenUrl, 
            categoria_id || 1
        ]);

        res.status(201).json({ message: "Guardado" });
    } catch (err) { 
        console.error("Error al guardar producto:", err);
        res.status(500).json({ error: err.message }); 
    }
});

app.get('/api/productos/:id/comentarios', async (req, res) => {
    try {
        const { id } = req.params;
        const [comentarios] = await pool.execute(`
            SELECT c.comentario, c.calificacion, c.fecha, u.nombre 
            FROM comentarios_productos c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.producto_id = ? ORDER BY c.fecha DESC
        `, [id]);

        const [stats] = await pool.execute(`
            SELECT AVG(calificacion) as promedio, COUNT(*) as total 
            FROM comentarios_productos WHERE producto_id = ?
        `, [id]);

        res.json({
            comentarios,
            promedio: stats[0].promedio || 0,
            totalReviews: stats[0].total
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/productos/comentario', async (req, res) => {
    const { producto_id, usuario_id, comentario, calificacion } = req.body;

    if (!producto_id || !usuario_id || !comentario || calificacion === undefined) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    try {
        const [existe] = await pool.execute(
            "SELECT id FROM comentarios_productos WHERE producto_id = ? AND usuario_id = ? LIMIT 1",
            [producto_id, usuario_id]
        );

        if (existe.length > 0) {
            return res.status(403).json({ error: "Ya has calificado este producto anteriormente." });
        }

        await pool.execute(
            "INSERT INTO comentarios_productos (producto_id, usuario_id, comentario, calificacion) VALUES (?, ?, ?, ?)",
            [producto_id, usuario_id, comentario, calificacion || 5]
        );
        res.json({ message: "Guardado" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

app.put('/api/productos/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, descripcion, stock, categoria_id, descuento } = req.body;
        
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

        const sql = `UPDATE productos SET nombre=?, precio=?, descripcion=?, stock=?, imagen=?, categoria_id=?, descuento=? WHERE id=?`;
        await pool.execute(sql, [
            nombre, 
            precio, 
            descripcion, 
            stock, 
            imagenNueva, 
            categoria_id || 1, 
            descuento || 0,
            id
        ]);

        res.json({ mensaje: 'Actualizado correctamente' });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
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
        const idPedidosAgrupador = Math.floor(Date.now() / 1000);

        const body = {
            items: items.map(prod => ({
                id: String(prod.id),
                title: String(prod.nombre),
                quantity: Number(prod.cantidad),
                unit_price: Number(prod.precio),
                currency_id: "MXN",
            })),
            metadata: { 
                user_id: userId,
                id_pedidos: idPedidosAgrupador 
            },
            back_urls: {
                success: "https://macrowatersolutions.com/pago-exitoso",
                failure: "https://macrowatersolutions.com/pago-fallido",
                pending: "https://macrowatersolutions.com/pago-pendiente",
            },
            auto_return: "approved",
            // ACTUALIZACIÓN PARA NOTIFICACIONES DE PAGO REAL
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

        if (type === "payment" || action === "payment.created" || action === "payment.updated") {
            const paymentId = data.id;
            const payment = new Payment(clientMP);
            const paymentInfo = await payment.get({ id: paymentId });

            if (paymentInfo.status === "approved") {
                const userId = paymentInfo.metadata?.user_id;
                const idPedidos = Number(paymentInfo.metadata?.id_pedidos);
                const itemsPagados = paymentInfo.additional_info?.items || paymentInfo.items || [];

                if (!userId) return res.sendStatus(200);

                // Obtener la dirección actual del usuario para guardarla como histórica
                const [userRows] = await pool.execute("SELECT direccion FROM usuarios WHERE id = ?", [userId]);
                const direccionAlMomento = userRows[0]?.direccion || "Dirección no registrada";

                for (const item of itemsPagados) {
                    if (item.title === "Costo de envío" || !item.id || item.id === "envio-001") continue;

                    try {
                        const totalItem = Number(item.unit_price) * Number(item.quantity);
                        
                        // Insertar con direccion_historica y estado 'pagado'
                        const sqlPedido = `
                            INSERT INTO pedidos 
                            (usuario_id, producto_id, cantidad, total_linea, estado, id_pedidos, direccion_historica) 
                            VALUES (?, ?, ?, ?, 'pagado', ?, ?)`;
                        
                        await pool.execute(sqlPedido, [userId, item.id, item.quantity, totalItem, idPedidos, direccionAlMomento]);
                        await pool.execute("UPDATE productos SET stock = stock - ? WHERE id = ?", [item.quantity, item.id]);
                        
                    } catch (dbErr) {
                        console.error("❌ Error DB en Webhook:", dbErr.message);
                    }
                }
                console.log(`✅ Pago real ${paymentId} procesado correctamente.`);
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Error crítico Webhook:", error.message);
        res.sendStatus(200);
    }
});

// ACTUALIZAR DIRECCIÓN DE UN PEDIDO ESPECÍFICO (Si no ha sido enviado)
app.put('/api/pedidos/actualizar-direccion/:id_pedidos', async (req, res) => {
    const { id_pedidos } = req.params;
    const { nuevaDireccion } = req.body;

    try {
        const [rows] = await pool.execute("SELECT estado FROM pedidos WHERE id_pedidos = ? LIMIT 1", [id_pedidos]);
        
        if (rows.length === 0) return res.status(404).json({ error: "Pedido no encontrado" });
        
        const estado = rows[0].estado.toLowerCase();

        if (estado === 'enviado' || estado === 'entregado') {
            return res.status(400).json({ error: "El pedido ya ha sido enviado y no se puede cambiar la dirección." });
        }

        await pool.execute(
            "UPDATE pedidos SET direccion_historica = ? WHERE id_pedidos = ?",
            [nuevaDireccion, id_pedidos]
        );

        res.json({ message: "Dirección del pedido actualizada correctamente." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= RUTAS DE PEDIDOS =================

app.get('/api/pedidos', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.*, u.nombre as cliente, pr.nombre as producto_nombre, pr.imagen as producto_imagen
            FROM pedidos p 
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN productos pr ON p.producto_id = pr.id
            ORDER BY p.id DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/pedidos', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                p.id_pedidos, p.producto_id, p.cantidad, p.total_linea, p.estado, p.fecha, p.direccion_historica,
                u.nombre as cliente, u.correo, u.direccion as direccion_actual,
                pr.nombre, pr.imagen, pr.precio as precio_unitario, pr.descripcion
            FROM pedidos p 
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN productos pr ON p.producto_id = pr.id
            ORDER BY p.fecha DESC
        `);

        const pedidosAgrupados = rows.reduce((acc, current) => {
            const key = current.id_pedidos || `old-${current.id}`; 
            if (!acc[key]) {
                acc[key] = { 
                    id: key, 
                    fecha: current.fecha, 
                    estado: current.estado, 
                    cliente: current.cliente, 
                    correo: current.correo,
                    direccion: current.direccion_historica || current.direccion_actual || "No proporcionada",
                    total: 0, 
                    productos: [] 
                };
            }
            acc[key].productos.push({
                producto_id: current.producto_id,
                nombre: current.nombre,
                imagen: current.imagen,
                cantidad: current.cantidad,
                precio: current.precio_unitario,
                descripcion: current.descripcion
            });
            acc[key].total += Number(current.total_linea);
            return acc;
        }, {});

        res.json(Object.values(pedidosAgrupados));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/pedidos/status', async (req, res) => {
    const { id_pedidos, nuevoEstado } = req.body;
    try {
        await pool.execute("UPDATE pedidos SET estado = ? WHERE id_pedidos = ?", [nuevoEstado, id_pedidos]);
        res.json({ message: "Estado actualizado con éxito" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/mis-pedidos/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await pool.execute(`
            SELECT 
                p.id_pedidos, p.producto_id, p.cantidad, p.total_linea, p.estado, p.fecha,
                pr.nombre, pr.imagen, pr.precio as precio_unitario, pr.descripcion
            FROM pedidos p 
            JOIN productos pr ON p.producto_id = pr.id
            WHERE p.usuario_id = ?
            ORDER BY p.fecha DESC
        `, [userId]);

        const pedidosAgrupados = rows.reduce((acc, current) => {
            const key = current.id_pedidos || `old-${current.id}`; 
            if (!acc[key]) {
                acc[key] = { id: key, fecha: current.fecha, estado: current.estado, total: 0, productos: [] };
            }
            acc[key].productos.push({
                producto_id: current.producto_id,
                nombre: current.nombre,
                imagen: current.imagen,
                cantidad: current.cantidad,
                precio: current.precio_unitario,
                descripcion: current.descripcion
            });
            acc[key].total += Number(current.total_linea);
            return acc;
        }, {});

        res.json(Object.values(pedidosAgrupados));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ruta para actualizar la dirección del usuario
app.put('/api/auth/UpdateD/:id', async (req, res) => {
    const { id } = req.params;
    const { direccion } = req.body;

    try {
        const [result] = await pool.execute(
            "UPDATE usuarios SET direccion = ? WHERE id = ?",
            [direccion, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Dirección actualizada correctamente" });
    } catch (err) {
        console.error("Error al actualizar dirección:", err);
        res.status(500).json({ error: "Error interno del servidor al actualizar la dirección" });
    }
});


// ACTUALIZAR DESCUENTO DE UN PRODUCTO
app.put('/api/productos/:id/descuento', async (req, res) => {
    const { id } = req.params;
    const { descuento } = req.body; 

    try {
        await pool.execute(
            "UPDATE productos SET descuento = ? WHERE id = ?",
            [descuento, id]
        );
        res.json({ message: "Descuento actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= FINALIZACIÓN =================

app.get('/api/health', (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor activo en puerto ${PORT}`);
});