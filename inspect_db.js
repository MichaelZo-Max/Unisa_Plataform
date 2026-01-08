
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

async function getColumns() {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'CLIENTES'
            AND (COLUMN_NAME LIKE '%FECHA%' OR COLUMN_NAME LIKE '%FIN%')
        `);
        result.recordset.forEach(row => console.log(row.COLUMN_NAME));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getColumns();
