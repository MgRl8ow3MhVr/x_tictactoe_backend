const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.json({ msg: "Hello World" });
});
const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });

const playersList = {};

wss.on("connection", connection => {
  connection.on("message", message => {
    // parse message
    message = JSON.parse(message);
    console.log(message);
    switch (message.object) {
      case "enterArena":
        playersList[message.username] = connection;
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                object: "newUser",
                playersList: Object.keys(playersList)
              })
            );
          }
        });

        break;
      case "challenge":
        console.log(message.challenger, message.opponent);
        playersList[message.opponent].send(
          JSON.stringify({ object: "challenged", by: message.challenger })
        );
        break;

      default:
        wss.clients.forEach(client => {
          if (client !== connection && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
        break;
    }
  });
});

server.listen(process.env.PORT || 8080, () => {
  console.log("Server started");
});
