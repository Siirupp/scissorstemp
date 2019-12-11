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
    currentConnections[client.id].pos['x'] = 150
    currentConnections[client.id].pos['y'] = -150
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
                currentConnections[client.id].pos['y'] += 5
                break
            case 'down':
                currentConnections[client.id].pos['y'] -= 5
                break
            case 'left':
                currentConnections[client.id].pos['x'] -= 5
                break
            case 'right':
                currentConnections[client.id].pos['x'] += 5
                break
            case 'rotate':
                currentConnections[client.id].pos['rotate'] = currentConnections[client.id].pos['rotate'] ? 0 : 1
                break
            case 'hold':
                currentConnections[client.id].pos['attacc'] = 1
                detectedhits = checkCollision(client.id)
                
                if(detectedhits.length > 0){
                    for(sorle in detectedhits){
                        flube = detectedhits[sorle]
                        currentConnections[flube].pos['x'] += Math.ceil(Math.random() * 50) - 25
                        currentConnections[flube].pos['y'] += Math.ceil(Math.random() * 50) - 25
                        
                        io.emit('position', flube, currentConnections[flube].pos)
                        currentConnections[flube].socket.emit('hitted')
                    }
                }

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

function checkCollision(clientid){
    cl = currentConnections[clientid]
    clhit = {}
    clhit.pos = {}
    if (cl.pos['rotate']){
        clhit.pos['x'] = (cl.pos['x']) + 5
        clhit.pos['y'] = (cl.pos['y']) - 65
    } else {
        clhit.pos['x'] = (cl.pos['x']) + 135
        clhit.pos['y'] = (cl.pos['y']) - 65
    }
    clhit.width = 10
    clhit.height = 10

    hits = []

    for(client in currentConnections){
        if (client != clientid){
            object2 = currentConnections[client]
            object2.width = 150
            object2.height = 150
            object1 = clhit
            if (object1.pos['x'] < object2.pos['x'] + object2.width  && object1.pos['x'] + object1.width  > object2.pos['x'] &&
                object1.pos['y'] > object2.pos['y'] - object2.height && object1.pos['y'] - object1.height < object2.pos['y'])
            {
                hits.push(client)
            }
        }
    }
    return hits
}

http.listen(port, function () {
    console.log('listening on *:' + port)
})