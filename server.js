const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 5000
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

    connections[playerIndex] = false

    //Tell everyone what player number just connected
    socket.broadcast.emit('player-connection', playerIndex)

    //Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Player ${playerIndex} disconnected`)
        connections[playerIndex] = null
        //Tell everyone what player number just disconnected
        socket.broadcast.emit('player-connection', playerIndex)
    })

    //On ready 
    socket.on('player-ready', () => {
        socket.broadcast.emit('enemy-ready', playerIndex)
        connections[playerIndex] = true
    })

    socket.on('check-players', () => {
        const players = []
        for(const i in connections){
            connections[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]})
            
        }
        socket.emit('check-players', players)
    })

    //On fire received 
    socket.on('fire', id => {
        console.log(`Shot fired from ${playerIndex}`)

        //Emit the move to the other player
        socket.broadcast.emit('fire', id)
    })

    //On fire reply
    socket.on('fire-reply', square => {
        console.log(square)

        //Forward the reply to the other player
        socket.broadcast.emit('fire-reply', square)
    })

    //Timeout connections 
    setTimeout(() => {
        connections[playerIndex] = null
        socket.emit('timeout')
        socket.disconnect()
    }, 600000)//10 minute limit per player
})