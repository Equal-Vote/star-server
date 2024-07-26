import express from 'express';

const { innerGetGlobalElectionStats} = require('./Controllers/getElectionsController')

export default (app: express.Application) => {
    const server = require('http').createServer(app)
    const {Server} = require('socket.io')

    const io = new Server(server, {
        cors: {
            origin: process.env.ALLOWED_URLS?.split(',') || 'localhost'
        }
    })

    io.on('connection', (socket: any) => {
        socket.on('join_landing_page', async () => {
            socket.join('landing_page');
            socket.emit('updated_stats', await innerGetGlobalElectionStats());
        })

        socket.on('new_vote', (socket: any) => {
            // use timeout so that there's time for the database to have the new vote applied
            setTimeout(async () => {
                io.to('landing_page').emit('updated_stats', await innerGetGlobalElectionStats());
            }, 1000)
        })
    })

    

    return server;
}