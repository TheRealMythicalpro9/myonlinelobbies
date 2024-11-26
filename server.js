const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public")); // Serve static files

// Serve the homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/homepage.html");
});

// Serve lobby pages dynamically
for (let i = 1; i <= 25; i++) {
  app.get(`/lobby${i}`, (req, res) => {
    res.sendFile(__dirname + `/public/lobbies/lobby${i}/lobby${i}.html`);
  });
}

// Socket.IO logic
const lobbies = {}; // Store sockets for each lobby

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a lobby
  socket.on("joinLobby", (lobbyName) => {
    if (!lobbies[lobbyName]) lobbies[lobbyName] = [];
    lobbies[lobbyName].push(socket.id);
    socket.join(lobbyName);
    console.log(`Socket ${socket.id} joined ${lobbyName}`);
  });

  // Handle chat messages
  socket.on("chatMessage", (data) => {
    const { lobbyName, message } = data;
    io.to(lobbyName).emit("chatMessage", message); // Broadcast to the lobby
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    for (const lobbyName in lobbies) {
      lobbies[lobbyName] = lobbies[lobbyName].filter((id) => id !== socket.id);
      if (lobbies[lobbyName].length === 0) delete lobbies[lobbyName];
    }
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
