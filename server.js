import express from 'express';
import sql from 'mssql';
import cors from 'cors';
import bcrypt from 'bcryptjs';

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

app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});