require('dotenv').config();
import { Star } from "./Tabulators/Star";

import makeApp from './app';

const app = makeApp()

const server = require("http").createServer(app);
const { Server } = require("socket.io")
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_URLS?.split(',') || 'https://star-vote.herokuapp.com/'
    }
})

const electionData = new Map()
io.on("connection", (socket: any) => {
    socket.on("create-room", (roomData: any) => {
        try {
            if (!roomData.roomname) return
            const existingRoom = electionData.get(roomData.roomname)
            if (existingRoom) return
            electionData.set(roomData.roomname, {
                roomname: roomData.roomname,
                owner: socket.id,
                candidates: roomData.candidates,
                methods: roomData.methods,
                nWinners: roomData.nWinners,
                ballots: [],
                results: null,
            })
            socket.join(roomData.roomname)
            socket.emit("update-room", electionData.get(roomData.roomname))
        } catch (err) {
            console.log(err)
            return
        }
    })
    socket.on("update-room", (roomData: any) => {
        try {
            const oldRoomData = electionData.get(roomData.roomname)
            oldRoomData.candidates = roomData.candidates
            oldRoomData.methods = roomData.methods
            oldRoomData.nWinners = roomData.nWinners
            socket.broadcast.emit("update-room", oldRoomData)
        } catch (err) {
            console.log(err)
            return
        }
    })
    socket.on("join-room", (roomname: any) => {
        try {
            socket.join(roomname)
            socket.emit("update-room", electionData.get(roomname))
        } catch (err) {
            console.log(err)
            return
        }
    })
    socket.on("vote", (roomname: any, ballot: any) => {
        try {
            const oldRoomData = electionData.get(roomname)
            oldRoomData.ballots.push(ballot)
            const cvr = oldRoomData.ballots.map((ballot: any) => ballot.star)
            oldRoomData.results = Star(oldRoomData.candidates, cvr, oldRoomData.nWinners)
            socket.nsp.to(roomname).emit("update-room", oldRoomData)
        } catch (err) {
            console.log(err)
            return
        }
    });
});

//Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));