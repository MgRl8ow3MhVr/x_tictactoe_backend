const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const cors = require('cors')

const app = express()
app.use(cors())

app.get('/', (req, res) => {
  res.json({ msg: 'Hello World' })
})
const server = http.createServer(app)
const wss = new WebSocket.Server({ server: server })
// to give IDs to new connections
let id_s = 0

//players list
const playersList = {}

// send playerslist only to connections with a username
const sendPLayersList = () => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.username) {
      client.send(
        JSON.stringify({
          object: 'newUser',
          playersList: Object.keys(playersList)
        })
      )
    }
  })
}

wss.on('connection', connection => {
  connection.on('close', () => {
    //delete player from playerslist and send updated list to everybody
    console.log('closed ', connection.username)
    delete playersList[connection.username]
    sendPLayersList()
  })

  connection.on('message', message => {
    message = JSON.parse(message)
    if (message.object) {
      console.log(message)
    } else {
      console.log(message.username, 'played')
    }
    switch (message.object) {
      case 'enterArena':
        //Completer la userlist
        playersList[message.username] = connection
        //Aussi ajouter à la connection
        connection.username = message.username
        //Update playerslist to all players
        sendPLayersList()
        break
      case 'challenge':
        console.log(message.challenger, message.opponent)
        playersList[message.opponent].send(
          JSON.stringify({ object: 'challenged', by: message.challenger })
        )
        break

      case 'ping':
        console.log('just a ping from', message.player)
        break

      default:
        playersList[message.opponent].send(JSON.stringify(message))
        break
    }
  })
})

// //Ping régulier sur les joueurs pour garder le serveur eveillé
// setInterval(function ping () {
//   console.log('send ping to all')
//   wss.clients.forEach(client => {
//     if (client.readyState === WebSocket.OPEN && client.username) {
//       client.send(
//         JSON.stringify({
//           object: 'ping'
//         })
//       )
//     }
//   })
// }, 3000)

server.listen(process.env.PORT || 8080, () => {
  console.log('Server started on port 8080')
})
