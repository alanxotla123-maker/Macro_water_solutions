import express, { Request, Response } from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
app.use(cors());
app.use(express.json());

// Configuración del Pool de conexiones
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Salinas978', 
    database: 'aqua_clean_pro',
    waitForConnections: true,
    connectionLimit: 10
});app.post('/api/auth/login', (req: Request, res: Response) => {
    const { correo, password } = req.body;

    // 1. PRIMERO BUSCAMOS EN LA TABLA 'admin' (Contraseña plana: Salinas978)
    const qAdmin = "SELECT id, nombre, correo, password, 'admin' as rol FROM admin WHERE correo = ?";
    
    db.query(qAdmin, [correo], (err, admins: any) => {
        if (err) return res.status(500).json({ message: " Error en tabla admin" });

        // Si existe en la tabla admin
        if (admins && admins.length > 0) {
            if (password === admins[0].password) {
                const { password: _, ...adminData } = admins[0];
                console.log("✅ Admin detectado:", adminData.nombre);
                return res.json({ user: adminData }); // Manda el rol 'admin'
            }
        }

        // 2. SI NO ES ADMIN, BUSCAMOS EN LA TABLA 'usuarios' (Contraseña Bcrypt)
        const qUser = "SELECT id, nombre, correo, password, direccion, 'user' as rol FROM usuarios WHERE correo = ?";
        
        db.query(qUser, [correo], async (err, users: any) => {
            if (err) return res.status(500).json({ message: "Error en tabla usuarios" });

            if (users && users.length > 0) {
                try {
                    const match = await bcrypt.compare(password, users[0].password);
                    if (match) {
                        const { password: _, ...userData } = users[0];
                        console.log("✅ Usuario detectado:", userData.nombre);
                        return res.json({ user: userData }); // Manda el rol 'user'
                    }
                } catch (e) {
                    return res.status(500).json({ message: "Error en Bcrypt" });
                }
            }

            // Si no está en ninguna de las dos tablas
            res.status(401).json({ message: "Credenciales incorrectas" });
        });
    });
});
app.listen(3000, () => console.log("🚀 Servidor Aqua Clean Pro activo en puerto 3000"));