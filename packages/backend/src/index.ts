require('dotenv').config();

import makeApp from './app';

const server = makeApp()

//Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.info(`Server started on port ${PORT}`));
