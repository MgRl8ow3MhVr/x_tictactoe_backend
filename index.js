const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 }, () => {
  console.log("Server started");
});

wss.on("connection", connection => {
  connection.on("message", message => {
    // Transmettre un message à tous les autres utilisateurs connectés (broadcast)
    wss.clients.forEach(client => {
      if (client !== connection && client.readyState === WebSocket.OPEN) {
        //   if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
