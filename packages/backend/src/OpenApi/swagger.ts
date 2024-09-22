import swaggerJsdoc from 'swagger-jsdoc';
import schema from '@equal-vote/star-vote-shared/schema.json'; // Adjust the import path to your schema file

const options = {
  encoding: 'utf-8',
  failOnErrors: true,
  verbose: true,
  format: 'json',
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
    },
    components: {
      schemas: {
        ...schema.components.schemas,
      },
    },
  },

  apis: ['./src/Routes/*routes.ts'], // Adjust the path to your route files
};

const openapiSpecification = swaggerJsdoc(options);

export default openapiSpecification;