require('dotenv').config();

import makeApp from './app';

const app = makeApp()

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
