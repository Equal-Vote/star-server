import fs from 'fs';
import openapiSpecification from './swaggerSpec';
fs.writeFileSync('./src/OpenApi/swagger.json', JSON.stringify(openapiSpecification, null, 2));
