import express from 'express';
import sql from 'mssql';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

console.log('Verificando API Key:', process.env.GEMINI_API_KEY ? 'Cargada correctament' : 'NO CARGADA');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

// Cargar esquema para la IA
const rawSchema = fs.readFileSync('./db_schema.json', 'utf8');
const dbSchema = JSON.parse(rawSchema);

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

const dbConfig = {
    user: 'ICGAdmin',
    password: 'M4st3rk3y..',
    server: '10.10.10.6',
    database: 'FAMILY',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

app.get('/api/users', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query('SELECT * FROM Users');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.post('/api/clientes', async (req, res) => {
    const { Nombre, RIF, Direccion, Telefono, FechaInicio, FechaFin } = req.body;
    try {
        const pool = await sql.connect(dbConfig);

        // Obtener el último CODCLIENTE
        const lastCodeResult = await pool.request().query(`
            SELECT TOP 1 C.CODCLIENTE FROM CLIENTES AS C 
            ORDER BY CODCLIENTE DESC
        `);

        const newCodCliente = lastCodeResult.recordset.length > 0
            ? lastCodeResult.recordset[0].CODCLIENTE + 1
            : 1;

        // Insertar el nuevo cliente con el CODCLIENTE calculado
        const result = await pool.request()
            .input('CodCliente', sql.Int, newCodCliente)
            .input('Nombre', sql.NVarChar, Nombre)
            .input('RIF', sql.NVarChar, RIF)
            .input('Direccion', sql.NVarChar, Direccion)
            .input('Telefono', sql.NVarChar, Telefono)
            .input('FechaInicio', sql.Date, FechaInicio)
            .input('FechaFin', sql.Date, FechaFin)
            .query(`
                INSERT INTO CLIENTES (CODCLIENTE, NOMBRECLIENTE, CIF, DIRECCION1, TELEFONO1, RET_FECHAINIEXCLUSION, RET_FECHAFINEXCLUSION) 
                VALUES (@CodCliente, @Nombre, @RIF, @Direccion, @Telefono, @FechaInicio, @FechaFin)
            `);

        const responseData = {
            Nombre,
            RIF,
            Direccion,
            Telefono,
            FechaInicio,
            FechaFin
        };

        res.status(201).json(responseData);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.get('/api/clientes', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`
            SELECT TOP 10
            C.NOMBRECLIENTE AS Nombre,
            C.CIF AS RIF,
            ISNULL(NULLIF(C.DIRECCION1, ''), NULLIF(C.DIRECCION2, '')) AS Direccion,
            ISNULL(C.TELEFONO1, C.TELEFONO2) AS Telefono,
            ISNULL(C.RET_FECHAINIEXCLUSION, '2026-01-01') AS FechaInicio,
            ISNULL(C.RET_FECHAFINEXCLUSION, '2026-12-31') AS FechaFin
            FROM CLIENTES AS C
            WHERE C.TELEFONO1 <> '' AND C.CODCLIENTE NOT IN (3)
            ORDER BY C.CODCLIENTE DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.put('/api/clientes/:rif', async (req, res) => {
    const { rif } = req.params;
    const { Nombre, RIF, Direccion, Telefono, FechaInicio, FechaFin } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Nombre', sql.NVarChar, Nombre)
            .input('OldRIF', sql.NVarChar, rif)
            .input('NewRIF', sql.NVarChar, RIF)
            .input('Direccion', sql.NVarChar, Direccion)
            .input('Telefono', sql.NVarChar, Telefono)
            .input('FechaInicio', sql.Date, FechaInicio)
            .input('FechaFin', sql.Date, FechaFin)
            .query(`
                UPDATE CLIENTES 
                SET NOMBRECLIENTE = @Nombre,
                    CIF = @NewRIF,
                    DIRECCION1 = @Direccion,
                    TELEFONO1 = @Telefono,
                    RET_FECHAINIEXCLUSION = @FechaInicio,
                    RET_FECHAFINEXCLUSION = @FechaFin
                WHERE CIF = @OldRIF
            `);

        res.json({ message: 'Cliente actualizado exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});
app.get('/api/system-users', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT NOMBRE as nombre, ROL as rol, USUARIO as username FROM USUARIOS_UNISA ORDER BY NOMBRE');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.post('/api/system-users', async (req, res) => {
    const { nombre, rol, username, password } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('rol', sql.NVarChar, rol)
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword)
            .query(`
                INSERT INTO USUARIOS_UNISA (NOMBRE, ROL, USUARIO, CLAVEUSUARIO) 
                VALUES (@nombre, @rol, @username, @password)
            `);
        res.status(201).json({ message: 'Usuario de sistema creado exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.put('/api/system-users/:username', async (req, res) => {
    const { username: oldUsername } = req.params;
    const { nombre, rol, username, password } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        const request = pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('rol', sql.NVarChar, rol)
            .input('newUsername', sql.NVarChar, username)
            .input('oldUsername', sql.NVarChar, oldUsername);

        let query = `
            UPDATE USUARIOS_UNISA 
            SET NOMBRE = @nombre,
                ROL = @rol,
                USUARIO = @newUsername
        `;

        // Solo actualizar password si se proporciona
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            request.input('password', sql.NVarChar, hashedPassword);
            query += `, CLAVEUSUARIO = @password`;
        }

        query += ` WHERE USUARIO = @oldUsername`;

        await request.query(query);
        res.json({ message: 'Usuario de sistema actualizado exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Usuario maestro de recuperación (admin / admin1)
    if (username.toLowerCase() === 'admin' && password === 'admin1') {
        return res.json({
            name: 'Administrador Maestro',
            role: 'Administrador',
            username: 'admin'
        });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT NOMBRE as name, ROL as role, USUARIO as username, CLAVEUSUARIO as password FROM USUARIOS_UNISA WHERE USUARIO = @username');

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        // No enviar el password de vuelta al frontend
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    console.log("Mensaje recibido de UniAmigo:", message);

    if (!process.env.GEMINI_API_KEY) {
        return res.json({ reply: "UniAmigo no está configurado (Falta GEMINI_API_KEY). Por favor contacta al administrador.", error: "Missing API Key" });
    }

    try {
        const businessKnowledge = `
        DICCIONARIO DE DATOS Y REGLAS:
        - CIF: Es el RIF o Identificación Fiscal del cliente.
        - DIRECCION1: Es la dirección principal.
        - TELEFONO1: Es el teléfono principal.
        - CLIENTES Activos: Son aquellos que no tienen fecha de fin de exclusión o cuya fecha es futura.
        - USUARIOS_UNISA: Contiene los usuarios que acceden a ESTA plataforma (Unisa).
        `;

        const systemPrompt = `Eres UniAmigo, un asistente inteligente para la plataforma Unisa. 
        Tu tarea es ayudar al usuario a consultar información de negocio de forma amable.

        ESQUEMA DE DATOS DISPONIBLE (Uso interno, NO mencionar al usuario):
        ${JSON.stringify(dbSchema, null, 2)}

        ${businessKnowledge}
        
        REGLAS CRÍTICAS:
        1. PRIORIDAD DE NAVEGACIÓN Y ACCIÓN: Si el usuario pide ir a una sección o EDITAR/MODIFICAR un registro, responde con texto amable y un comando <UI_ACTION>.
           Comandos disponibles:
           - nav_clientes: Lleva a la tabla de gestión de clientes.
           - nav_home: Lleva a la pantalla de inicio (dashboard).
           - nav_config: Lleva a la configuración de usuarios de sistema.
           - open_create_client: Abre el formulario para crear un nuevo cliente.
           - edit_client:RIF : Abre el formulario de edición para el cliente con ese RIF (ej. <UI_ACTION>edit_client:J-123456</UI_ACTION>).
        2. ¿CUÁNDO USAR EDITAR?: Si el usuario dice "quiero cambiar el nombre de X", "edita el cliente Y" o "corrige la dirección de Z", debes identificar el RIF del cliente y usar el comando edit_client:RIF.
        3. CONSULTAS DE DATOS: Si el usuario pide información específica (ej. "¿quién es el cliente X?"), responde ÚNICAMENTE con la consulta SQL encerrada en <SQL>query</SQL>.
        4. SI NO ENTIENDES O NO TIENES DATOS: Responde: "Lo siento, no tengo registros disponibles..."
        5. NUNCA menciones términos técnicos ni nombres de tablas al usuario.
        6. Responde siempre en español de forma profesional y cercana.
        
        CONVERSACIÓN ACTUAL:
        ${history.map(m => `${m.role}: ${m.content}`).join('\n')}
        user: ${message}`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        // Verificar si la IA generó una consulta SQL
        const sqlMatch = text.match(/<SQL>([\s\S]*?)<\/SQL>/);

        if (sqlMatch) {
            const query = sqlMatch[1].trim();
            console.log("Ejecutando SQL sugerido por IA:", query);

            try {
                const pool = await sql.connect(dbConfig);
                const dbResult = await pool.request().query(query);

                // Segundio paso: Pedir a la IA que explique los resultados
                const explainPrompt = `El usuario preguntó: "${message}". 
                Obtuvimos estos datos de la plataforma: ${JSON.stringify(dbResult.recordset)}
                
                Instrucciones para la respuesta:
                1. Responde al usuario de forma amable, profesional y clara basándote en estos datos.
                2. NUNCA menciones la consulta SQL, nombres de tablas ni términos técnicos.
                3. Si no hay datos en el resultado (${JSON.stringify(dbResult.recordset)} está vacío), di educadamente que no se encontraron registros para esa solicitud.
                4. Responde siempre en español.`;

                const explainResult = await model.generateContent(explainPrompt);
                const finalReply = await explainResult.response.text();

                res.json({ reply: finalReply });
            } catch (dbErr) {
                console.error("Error ejecutando SQL de IA:", dbErr);
                res.json({ reply: "Tuve un pequeño inconveniente al procesar tu solicitud. ¿Podrías intentar ser más específico o preguntar de otra forma?" });
            }
        } else {
            console.log("Respuesta de IA enviada:", text);
            res.json({ reply: text });
        }
    } catch (err) {
        console.error("Error en Chat IA:", err);
        res.status(500).json({ error: "Error interno del servidor de IA" });
    }
});

app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});