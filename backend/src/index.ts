import express from 'express';
var electionRouter = require('./Routes/elections.routes')
var debugRouter = require('./Routes/debug.routes')

const app = express();

const frontendPath = '../../../../frontend/build/';

const path = require('path');
app.use(express.static(path.join(__dirname, frontendPath)));
app.use(express.json());

//Routes
app.use('/API',electionRouter)
app.use('/debug',debugRouter)

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, frontendPath + "index.html"));
})

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
