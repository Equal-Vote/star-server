import express from 'express';

const { innerGetGlobalElectionStats} = require('./Controllers/getElectionsController')

export default (app: express.Application) => {
    console.log('SETUP SOCKET')
    const server = require('http').createServer(app)
    const {Server} = require('socket.io')

    const io = new Server(server, {
        cors: {
            origin: process.env.ALLOWED_URLS?.split(',') || 'localhost'
        }
    })


    console.log(process.env.ALLOWED_URLS?.split(',') || 'localhost')

    io.on('connection', (socket: any) => {
        console.log('new connection')
        socket.on('join_landing_page', async () => {
            socket.join('landing-page')
            let stats = await innerGetGlobalElectionStats();
            console.log('stats', stats);
            socket.emit('updated_stats', stats);
        })
    })

    server.listen(5001, () => {
        console.log('running')
    })
}