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

async function createTable() {
    try {
        await sql.connect(dbConfig);
        await sql.query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SISTEMA_USUARIOS]') AND type in (N'U'))
            BEGIN
                CREATE TABLE [dbo].[SISTEMA_USUARIOS](
                    [id] [int] IDENTITY(1,1) NOT NULL,
                    [nombre] [nvarchar](100) NOT NULL,
                    [rol] [nvarchar](50) NOT NULL,
                    [username] [nvarchar](50) NOT NULL UNIQUE,
                    [password] [nvarchar](100) NOT NULL,
                    [created_at] [datetime] DEFAULT GETDATE(),
                    PRIMARY KEY CLUSTERED ([id] ASC)
                )
            END
        `);
        console.log("Table SISTEMA_USUARIOS created or already exists.");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        process.exit(0);
    }
}

createTable();
