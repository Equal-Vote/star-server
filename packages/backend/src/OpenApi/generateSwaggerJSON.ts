import fs from 'fs';
import openapiSpecification from './swaggerSpec';
const dir = './build/src/OpenApi';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(`${dir}/swagger.json`, JSON.stringify(openapiSpecification, null, 2));
fs.writeFileSync('./build/src/OpenApi/swagger.json', JSON.stringify(openapiSpecification, null, 2));
