const { Pool } = require('pg');

var _postgresClient:any;

function postgres():any {
    if (_postgresClient == null){
        if (process.env.DEV_DATABASE === 'TRUE') {
            _postgresClient = new Pool({
                connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
                ssl: {
                    rejectUnauthorized: false
                }
            });
        } else {
            _postgresClient = new Pool({
                connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
                ssl: false
            });
        }
    }
    return _postgresClient;
}

export  default { postgres };