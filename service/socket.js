import {Server} from "socket.io"
import cookie from "cookie"
import { validateUserCookie } from "./userMap.js";

const connectedUser = new Map();
let io;


function initSocket(server) {

  io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000', // frontend URL in production
      methods: ['GET', 'POST'],
     credentials: true
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    const Cookie = cookie.parse(socket.handshake.headers.cookie || "")
    const token = Cookie?.token || ""
  if (!token) {
      socket.emit("auth-error", "No token provided");
      socket.disconnect(); // optional: disconnect unauthorized socket
      return;
    }

    const { isAuthorized, user_id, error } = validateUserCookie(token);

    if (!isAuthorized) {
      socket.emit("auth-error", error || "Unauthorized");
      socket.disconnect(); // optional: disconnect unauthorized socket
      return;
    }

connectedUser.set(user_id, socket.id);
console.log(connectedUser);            // need to make it for multi logins later

socket.on("call-offer",({recipientId,offer})=>{
  const recipienSocketId = connectedUser.get(recipientId)
  if(recipienSocketId){
    console.log("emitted",user_id);
    
    socket.to(recipienSocketId).emit("incoming-call",{fromSocket:socket.id,fromUserId:user_id,offer})
  }
})

socket.on("call-rejection",({callerId,timestamp})=>{
console.log(callerId,timestamp,"call-rejection");
const senderSocketId = connectedUser.get(callerId);
if(senderSocketId){
  socket.to(senderSocketId).emit("call-declined")
}

})

socket.on("disconnect", () => {
  connectedUser.forEach((s_id, u_id) => {
    if (socket.id === s_id) {
      connectedUser.delete(u_id);
    }
  });
  console.log("User disconnected:", socket.id);
});
  });

  return io;
}

// Optional: export io instance if you want to emit events elsewhere
function getIO() {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
}

export{ initSocket, getIO };
