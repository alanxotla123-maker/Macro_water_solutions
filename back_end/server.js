require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. IMPORTACIONES DE AWS Y MULTER
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require('multer');
const multerS3 = require('multer-s3');

// 2. REGISTRA TS-NODE
require('ts-node').register(); 
app.use(express.static(path.join(__dirname, 'public')));
const app = express();

// --- AJUSTE DE CORS PARA PRODUCCIÓN ---
app.use(cors({
    origin: ['https://macrowatersolutions.com', 'http://macrowatersolutions.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// 3. IMPORTACIONES
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

// ================= RUTAS =================

// Ruta de prueba para verificar si el backend responde en el dominio
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
        const { nombre, precio, descripcion, stock } = req.body;
        const imagenUrl = req.file ? req.file.location : ""; 
        const sql = `INSERT INTO productos (nombre, precio, descripcion, stock, imagen, categoria_id) VALUES (?, ?, ?, ?, ?, 1)`;
        await pool.execute(sql, [nombre, precio, descripcion, stock, imagenUrl]);
        res.status(201).json({ message: "Guardado" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/productos/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, descripcion, stock, categoria_id } = req.body;
        const [rows] = await pool.execute("SELECT imagen FROM productos WHERE id = ?", [id]);
        const imagenVieja = rows[0]?.imagen;
        let imagenNueva = imagenVieja;

        if (req.file) {
            imagenNueva = req.file.location;
            if (imagenVieja && imagenVieja.includes('amazonaws.com')) {
                const key = imagenVieja.split('.com/')[1];
                await s3.send(new DeleteObjectCommand({
                    Bucket: (process.env.AWS_BUCKET_NAME || 'aquacleanpro').trim(),
                    Key: key,
                }));
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
        const producto = rows[0];
        if (producto?.imagen?.includes('amazonaws.com')) {
            const key = producto.imagen.split('.com/')[1];
            await s3.send(new DeleteObjectCommand({
                Bucket: (process.env.AWS_BUCKET_NAME || 'aquacleanpro').trim(),
                Key: key,
            }));
        }
        await pool.execute("DELETE FROM productos WHERE id = ?", [id]);
        res.json({ message: "Eliminado" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ================= INICIO DEL SERVIDOR =================
// En Namecheap, el puerto se asigna dinámicamente o se usa el Passenger
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor activo en macrowatersolutions.com`);
});