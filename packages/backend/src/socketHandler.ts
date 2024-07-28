import express from 'express';
import { Server } from 'socket.io';

const { innerGetGlobalElectionStats} = require('./Controllers/getElectionsController')


export let io: Server|null = null;

export const setupSockets = (app: express.Application) => {
    const server = require('http').createServer(app)

    io = new Server(server, {
        cors: {
            origin: process.env.ALLOWED_URLS?.split(',') || 'localhost'
        }
    })

    io.on('connection', (socket: any) => {
        socket.on('join_landing_page', async () => {
            socket.join('landing_page');
            socket.emit('updated_stats', await innerGetGlobalElectionStats());
        })
    })

    return server;
}