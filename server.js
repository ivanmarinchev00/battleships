const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 4000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

//set static folder
app.use(express.static(path.join(__dirname, "public")))

//Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

//Handle connections requests from web client
const connections = [null, null]

io.on('connection', socket => {
    // console.log('New WS connection')
    let playerIndex = -1 
    for(const i in connections){
        if(connections[i] === null){
            playerIndex = i 
            break
        }
    }

    

    //Tell the connecting client what number they are
    socket.emit('player-number', playerIndex)

    console.log(`Player ${playerIndex} has connected`)

    if(playerIndex === -1) return
})