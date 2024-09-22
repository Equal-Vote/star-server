import fs from 'fs';
import openapiSpecification from './swagger';

fs.writeFileSync('./src/OpenApi/openapi.json', JSON.stringify(openapiSpecification, null, 2));
