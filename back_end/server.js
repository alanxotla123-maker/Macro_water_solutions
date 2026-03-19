const { MercadoPagoConfig, Preference } = require('mercadopago');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. IMPORTACIONES DE AWS Y MULTER
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require('multer');
const multerS3 = require('multer-s3');

// 2. IMPORTACIONES LOCALES (Asegúrate de que estos archivos sean .js)
const { pool } = require('./src/config/db'); 
const authRoutes = require('./src/routes/auth.routes'); 

const app = express();

// --- CONFIGURACIÓN ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// --- CORS ---
app.use(cors({
    origin: ['https://macrowatersolutions.com', 'http://macrowatersolutions.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// 3. CONFIGURACIÓN DE AWS S3
const s3 = new S3Client({
    region: (process.env.AWS_REGION || "us-east-2").trim(),
    credentials: {
        accessKeyId: String(process.env.AWS_ACCESS_KEY_ID || "").trim(), 
        secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY || "").trim(),
    },
});

// 4. CONFIGURACIÓN DE MULTER
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: (process.env.AWS_BUCKET_NAME || 'aquacleanpro').trim(), 
        key: (req, file, cb) => {
            cb(null, `productos/${Date.now()}_${file.originalname}`);
        }
    })
});

// ================= RUTAS =================

app.get('/api/health', (req, res) => {
    res.json({ status: "ok", message: "Servidor activo en Namecheap" });
});

app.use('/api/auth', authRoutes);

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
        
        const imagenVieja = rows[0]?.imagen;
        let imagenNueva = imagenVieja;

        if (req.file) {
            imagenNueva = req.file.location;
            if (imagenVieja && imagenVieja.includes('amazonaws.com')) {
                const key = imagenVieja.split('.com/')[1];
                try {
                    await s3.send(new DeleteObjectCommand({
                        Bucket: (process.env.AWS_BUCKET_NAME || 'aquacleanpro').trim(),
                        Key: key,
                    }));
                } catch (e) { console.log("Error borrando imagen vieja en S3"); }
            }
        }
        
        const query = `UPDATE productos SET nombre=?, precio=?, descripcion=?, stock=?, imagen=?, categoria_id=? WHERE id=?`;
        await pool.execute(query, [nombre, precio, descripcion, stock, imagenNueva, categoria_id || 1, id]);
        res.json({ mensaje: 'Actualizado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute("SELECT imagen FROM productos WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "No encontrado" });

        const producto = rows[0];
        if (producto?.imagen?.includes('amazonaws.com')) {
            const key = producto.imagen.split('.com/')[1];
            try {
                await s3.send(new DeleteObjectCommand({
                    Bucket: (process.env.AWS_BUCKET_NAME || 'aquacleanpro').trim(),
                    Key: key,
                }));
            } catch (e) { console.log("Error borrando en S3"); }
        }
        await pool.execute("DELETE FROM productos WHERE id = ?", [id]);
        res.json({ message: "Eliminado" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

//mercado pago 
const clientMP = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || process.env.ACCESS_TOKEN_MERCADO
});
// --- RUTA PARA CREAR PREFERENCIA DE PAGO ---
app.post("/api/create_preference", async (req, res) => {
    try {
        const { items } = req.body; // Recibe los productos del carrito

        const body = {
            items: items.map(prod => ({
                title: prod.nombre,
                quantity: Number(prod.cantidad),
                unit_price: Number(prod.precio),
                currency_id: "MXN",
            })),
            back_urls: {
                success: "https://macrowatersolutions.com/pago-exitoso",
                failure: "https://macrowatersolutions.com/pago-fallido",
                pending: "https://macrowatersolutions.com/pago-pendiente",
            },
            auto_return: "approved",
        };

        const preference = new Preference(clientMP);
        const result = await preference.create({ body });

        // Enviamos el ID de la preferencia al frontend
        res.json({ id: result.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear la preferencia" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor activo en puerto ${PORT}`);
});