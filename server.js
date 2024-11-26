const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public")); // Serve static files

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Serve lobby pages dynamically
for (let i = 1; i <= 25; i++) {
  app.get(`/lobby${i}`, (req, res) => {
    res.sendFile(__dirname + `/public/lobbies/lobby${i}/lobby${i}.html`);
  });
}

// Store connected users by socket ID
let users = {};
let lobbies = {}; // Store sockets for each lobby

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Set username for the user
  socket.on("setUsername", (username) => {
    users[socket.id] = username;
    console.log(`${username} connected with socket id: ${socket.id}`);
  });

  // Join a specific lobby
  socket.on("joinLobby", (lobbyName) => {
    if (!lobbies[lobbyName]) lobbies[lobbyName] = [];
    lobbies[lobbyName].push(socket.id);
    socket.join(lobbyName);
    console.log(`Socket ${socket.id} joined lobby ${lobbyName}`);
  });

  // Handle chat messages from clients
  socket.on("chatMessage", (data) => {
    const { lobbyName, message } = data;
    io.to(lobbyName).emit("chatMessage", message); // Broadcast message to specific lobby
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    // Remove user from all lobbies they were in
    for (const lobbyName in lobbies) {
      lobbies[lobbyName] = lobbies[lobbyName].filter((id) => id !== socket.id);
      if (lobbies[lobbyName].length === 0) delete lobbies[lobbyName]; // Cleanup empty lobbies
    }
    delete users[socket.id]; // Remove user from the list
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
