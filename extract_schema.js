
import sql from 'mssql';
import fs from 'fs';

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

async function getSchema() {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`
            SELECT 
                TABLE_NAME, 
                COLUMN_NAME, 
                DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('CLIENTES', 'USUARIOS_UNISA')
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        `);

        const schema = result.recordset.reduce((acc, col) => {
            if (!acc[col.TABLE_NAME]) acc[col.TABLE_NAME] = [];
            acc[col.TABLE_NAME].push(`${col.COLUMN_NAME} (${col.DATA_TYPE})`);
            return acc;
        }, {});

        fs.writeFileSync('db_schema.json', JSON.stringify(schema, null, 2));
        console.log('Schema saved to db_schema.json');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getSchema();
