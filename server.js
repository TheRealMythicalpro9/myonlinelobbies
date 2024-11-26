<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Immuno Chat - Lobby 1</title>
    <link rel="shortcut icon" type="image/x-icon" href="Logo.ico" />
    <script src="/socket.io/socket.io.js"></script>
    <style>
      /* Your previous styles here */
    </style>
    <script>
      const socket = io();
      let username = localStorage.getItem("username");
      let lobbyName = "lobby1"; // Define the lobby name for this page

      if (!username) {
        username = prompt("Enter Username");
        while (
          !username ||
          username.trim().length < 3 ||
          username.trim().length > 20
        ) {
          username = prompt("Enter a valid username (3-20 characters):");
        }
        username = username.trim();
        localStorage.setItem("username", username); // Save username to localStorage
      }

      socket.emit("setUsername", username); // Set username on the server
      socket.emit("joinLobby", lobbyName); // Join a specific lobby

      // Listen for incoming chat messages
      socket.on("chatMessage", function (data) {
        const chatBox = document.getElementById("chat");
        const messageElement = document.createElement("div");
        messageElement.className = "chatmessage";
        messageElement.innerHTML = data;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
      });

      // Send a message to the server
      function enter() {
        const textbox = document.getElementById("textbox");
        const message = textbox.value;
        if (message.replace(/\s/g, "").length) {
          textbox.value = "";
          const formattedMessage =
            "<b>[" +
            username +
            "]: </b>" +
            message +
            "<span style='color:grey;'> [" +
            new Date().toLocaleTimeString().split(":")[0] +
            ":" +
            new Date().toLocaleTimeString().split(":")[1] +
            "]</span>";
          socket.emit("chatMessage", { lobbyName, message: formattedMessage }); // Send to specific lobby
        }
      }

      // Clear the username and reload
      function clearUsername() {
        localStorage.removeItem("username");
        location.reload();
      }
    </script>
  </head>
  <body>
    <header>
      <h1>Welcome to Immuno Chat - Lobby 1</h1>
      <p>Your username: <span id="username-display"></span></p>
    </header>
    <div id="chat"></div>
    <div>
      <input
        type="text"
        id="textbox"
        placeholder="Type your message here..."
        onkeypress="if(event.keyCode == 13) enter();"
      />
      <button onclick="enter()">Send</button>
    </div>
    <button id="change-username-btn" onclick="clearUsername()">
      Change Username
    </button>
    <script>
      document.getElementById("username-display").textContent = username;
    </script>
    <footer>
      <!-- Your footer content here -->
    </footer>
  </body>
</html>
