$(function () {
    
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var socket = io()
    var scratchcatsrc = 'img/scratch-cat.png'
    var character = new Image()
    character.src = scratchcatsrc
    
    ctx.fillStyle = "black";
    ctx.font = "bold 16px Arial";

    var currentConnections = []

    socket.on('clientConnected', function(clientid, pos, data){
        console.log(clientid + " connected")
        currentConnections[clientid] = {}
        currentConnections[clientid].pos = pos
        currentConnections[clientid].data = data
        $('.add-contact').trigger("click", data)
        reloadPos(currentConnections)
    })

    socket.on('clientDisconnected', function(clientid){
        console.log("Client disconnected")
        removeTab(clientid)
        delete currentConnections[clientid]
        reloadPos(currentConnections)
    })

    socket.on('position', function(clientid, pos) {
        currentConnections[clientid].pos = pos
        reloadPos(currentConnections)
    })

    function reloadPos(currentConnections){
        ctx.clearRect(0, 0, c.width, c.height)
        for (client in currentConnections){
            let cl = currentConnections[client]
            ctx.drawImage(character, cl.pos['x']*5, -cl.pos['y']*5, 150, 150)
            ctx.fillText(cl.data.hostname, cl.pos['x']*5+ 30 - (cl.data.hostname.length - 6)*5, -cl.pos['y']*5 - 5, 150, 150)
        }
    }

    $(document).keypress(function(event){
        switch(event.charCode){
            case 119:
                socket.emit('move', 'up')
                break
            case 97:
                socket.emit('move', 'left')
                break
            case 115:
                socket.emit('move', 'down')
                break
            case 100:
                socket.emit('move', 'right')
                break
            default:
                break
        }
    })
})