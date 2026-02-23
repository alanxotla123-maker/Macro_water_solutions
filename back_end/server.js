require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require('multer');
const multerS3 = require('multer-s3');

// DIAGNÓSTICO DE CREDENCIALES (Mira esto en tu terminal al iniciar)
console.log("--- CHEQUEO DE CONFIGURACIÓN ---");
console.log("ID de AWS detectado:", process.env.AWS_ACCESS_KEY_ID ? "✅ SÍ" : "❌ NO");
console.log("Región detectada:", process.env.AWS_REGION || "us-east-2 (Por defecto)");
console.log("Bucket detectado:", process.env.AWS_BUCKET_NAME || "aquacleanpro (Por defecto)");
console.log("--------------------------------");

const app = express();

require('ts-node').register(); 

app.use(cors());
app.use(express.json());

// 3. CONFIGURACIÓN DE AWS S3 (Limpieza de strings forzada)
const s3 = new S3Client({
    region: (process.env.AWS_REGION || "us-east-2").trim(),
    credentials: {
        accessKeyId: String(process.env.AWS_ACCESS_KEY_ID || "").trim(), 
        secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY || "").trim(),
    },
});

// 4. CONFIGURACIÓN DE MULTER PARA S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: (process.env.AWS_BUCKET_NAME || 'aquacleanpro').trim(), 
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `productos/${Date.now()}_${file.originalname}`);
        }
    })
});

const { pool } = require('./src/config/db');

// 5. RUTA: GUARDAR PRODUCTO
app.post('/api/productos', upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, precio, descripcion, stock } = req.body;
        const imagenUrl = req.file ? req.file.location : ""; 

        const sql = `INSERT INTO productos (nombre, precio, descripcion, stock, imagen, categoria_id) VALUES (?, ?, ?, ?, ?, 1)`;
        await pool.execute(sql, [nombre, precio, descripcion, stock, imagenUrl]);

        res.status(201).json({ message: "Producto guardado con éxito en AWS S3" });
    } catch (err) {
        console.error("ERROR S3:", err.message);
        res.status(500).json({ error: "Fallo al subir imagen", details: err.message });
    }
});

// 6. RUTA: ELIMINAR PRODUCTO
app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute("SELECT imagen FROM productos WHERE id = ?", [id]);
        const producto = rows[0];

        if (producto && producto.imagen && producto.imagen.includes('amazonaws.com')) {
            try {
                const urlParts = producto.imagen.split('.com/');
                const key = urlParts[1]; 

                if (key) {
                    await s3.send(new DeleteObjectCommand({
                        Bucket: (process.env.AWS_BUCKET_NAME || 'aquacleanpro').trim(),
                        Key: key,
                    }));
                    console.log(` Imagen borrada de S3: ${key}`);
                }
            } catch (s3Error) {
                console.error(" Error S3 al borrar:", s3Error.message);
            }
        }

        await pool.execute("DELETE FROM productos WHERE id = ?", [id]);
        res.json({ message: "Eliminado de MySQL y AWS S3" });
    } catch (err) {
        res.status(500).json({ error: "Error al eliminar", details: err.message });
    }
});

app.get('/api/productos', async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT * FROM productos");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const authRoutes = require('./src/routes/auth.routes').default; 
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Aqua Clean Pro: Servidor activo en puerto ${PORT}`);
});