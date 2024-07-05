require('dotenv').config();

import makeApp from './app';

const app = makeApp()

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.info(`Server started on port ${PORT}`));
