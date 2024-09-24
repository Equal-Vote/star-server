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
    servers: [
      {
        url: '/API',
        description: 'Base URL for the API',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'id_token',
          description:  'This uses authenticaion token generated with keycloak, the token can be sent both as a cookie ' +
                        'or in the auth_key property of the election object. [More information about token generation can ' +
                        'be found here](https://github.com/Equal-Vote/star-server/blob/6fdb2f653266b5f2710f0701509f54e1e558ecc1/docs/api.md) ' +
                        'Unfortunately, the swagger-ui does not support ' +
                        'setting cookies, so you will need to manually set the cookie in your browser to test the API',
        }
      },
      schemas: {
        ...schema.components.schemas,
      },
    },
  },

  apis: ['./src/Routes/*routes.ts'], // Adjust the path to your route files
};

const openapiSpecification = swaggerJsdoc(options);

export default openapiSpecification;