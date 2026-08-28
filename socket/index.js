import express from "express"
import {Server} from "socket.io"
import cors from "cors"
import {createServer} from "node:http"


const app = express();
const server = createServer(app);
const io = new Server(server,
    {cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
    },}
);


app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Socket running from the socket speaking")
})


const onlineUsers = new Map();

const addUser = (userId,socketId) => {
    onlineUsers.set(userId, socketId);
}

const removeUser = (socketId) => {
    for (const [userId, id] of onlineUsers.entries()) {
        if (id === socketId) {
            onlineUsers.delete(userId);
            break;
        }
    }
}

const getUser = (userId) => onlineUsers.get(userId);

io.on("connection", (socket) => {
    console.log("A User Connected!");


    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
    })

    socket.on("sendMessage", ({ conversationId, recieverId, message }) => {
        console.log("Trying to reach:", recieverId, "| Online map:", [...onlineUsers.entries()]);
        const recieverSocketId = getUser(recieverId);
        console.log("Resolved socket id:", recieverSocketId);
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("getMessage", {
            conversationId,
            message,
            });
        }
    });

    socket.on("disconnect", () => {
        console.log(`A User disconnected:${socket.id}`)
        removeUser(socket.id)
    })
})

server.listen(7000, () => {
    console.log("Socket Running!")
})