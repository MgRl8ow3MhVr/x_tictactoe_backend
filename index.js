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
// to give IDs to new connections
let id_s = 0;

//players list
const playersList = {};

// send playerslist only to connections with a username
const sendPLayersList = () => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.username) {
      client.send(
        JSON.stringify({
          object: "newUser",
          playersList: Object.keys(playersList)
        })
      );
    }
  });
};

wss.on("connection", connection => {
  connection.on("close", () => {
    //delete player from playerslist and send updated list to everybody
    console.log("closed ", connection.username);
    delete playersList[connection.username];
    sendPLayersList();
  });

  connection.on("message", message => {
    message = JSON.parse(message);
    if (message.object) {
      console.log(message);
    } else {
      console.log(message.username);
    }
    switch (message.object) {
      case "enterArena":
        //Completer la userlist
        playersList[message.username] = connection;
        //Aussi ajouter à la connection
        connection.username = message.username;
        //Update playerslist to all players
        sendPLayersList();

        break;
      case "challenge":
        console.log(message.challenger, message.opponent);
        playersList[message.opponent].send(
          JSON.stringify({ object: "challenged", by: message.challenger })
        );
        break;

      default:
        playersList[message.opponent].send(JSON.stringify(message));
        break;
    }
  });
});

// //Update de la liste des joueurs si certains ont quitté
// const interval = setInterval(function ping() {
//   wss.clients.forEach(function each(ws) {
//     console.log(Object.keys(playersList));
//     // Faire un nouvel Objet
//     // Si sa longueur est differente de Playerslist
//     // Remplacer playerslist
//     // Remvoyer playersList a tout le monde
//     // Cote FRONT. FILTRER le tableau avec ceux qui sont en train de jouer
//   });
// }, 3000);

server.listen(process.env.PORT || 8080, () => {
  console.log("Server started");
});
