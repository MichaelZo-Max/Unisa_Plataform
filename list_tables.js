import sql from 'mssql';

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

async function listTables() {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%USER%' OR TABLE_NAME LIKE '%USUARIO%' ORDER BY TABLE_NAME");
        console.log("User-related tables found:");
        console.log(result.recordset.map(r => r.TABLE_NAME).join(', '));
    } catch (err) {
        console.error("Error connecting to DB:", err);
    } finally {
        process.exit(0);
    }
}

listTables();
