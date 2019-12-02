// Jimi Toiviainen

var express = require('express')
var app = express()
var bodyParser = require('body-parser')

app.use(express.static('public'))
// support parsing of application/json type post data
app.use(bodyParser.json())
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }))

var http = require('http').Server(app)
var port = process.env.PORT || 3030
var io = require ('socket.io')(http)

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
})

var currentConnections = {}
var clientIndex = 0

io.sockets.on('connection', function(client){
    console.log(client.id + ' connected')

    currentConnections[client.id] = {socket: client}
    currentConnections[client.id].pos = {}
    currentConnections[client.id].pos['x'] = 5
    currentConnections[client.id].pos['y'] = 5
    currentConnections[client.id].pos['rotate'] = 0
    currentConnections[client.id].pos['attacc'] = 0
    currentConnections[client.id].data = {}
    currentConnections[client.id].data.hostname = "Unknown_" + clientIndex++
    currentConnections[client.id].data.clientid = client.id

    for (id in currentConnections){
        let cl = currentConnections[id]
        io.emit('clientConnected', id, cl.pos, cl.data)
    }

    client.on('move', function(direction){
        switch(direction){
            case 'up':
                currentConnections[client.id].pos['y'] += 1
                break
            case 'down':
                currentConnections[client.id].pos['y'] -= 1
                break
            case 'left':
                currentConnections[client.id].pos['x'] -= 1
                break
            case 'right':
                currentConnections[client.id].pos['x'] += 1
                break
            case 'rotate':
                currentConnections[client.id].pos['rotate'] = currentConnections[client.id].pos['rotate'] ? 0 : 1
                break
            case 'hold':
                currentConnections[client.id].pos['attacc'] = 1
                break
            case 'release':
                currentConnections[client.id].pos['attacc'] = 0
                break
            default:
                break
        }
        io.emit('position', client.id, currentConnections[client.id].pos)
    })

    client.on('setdata', function(data){
        for(key in data){
            currentConnections[client.id].data[key] = data[key]
        }
        let cl = currentConnections[client.id]
        io.emit('clientConnected', id, cl.pos, cl.data)
    })

    client.on('disconnect', function(){
        console.log('user disconnected');
        delete currentConnections[client.id]
        io.emit('clientDisconnected', client.id)
    })
})

http.listen(port, function () {
    console.log('listening on *:' + port)
})