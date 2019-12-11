$(function () {
    
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var socket = io()
    // character sprite
    var scratchcatsrc = 'img/scratch-cat.png'
    var scratchcatcutsrc = 'img/scratch-cat-cut.png'
    var character = new Image()
    var charactercut = new Image()
    character.src = scratchcatsrc
    charactercut.src = scratchcatcutsrc
    // reversed:
    var scratchcatsrcrev = 'img/scratch-cat-rev.png'
    var scratchcatcutsrcrev = 'img/scratch-cat-cut-rev.png'
    var characterrev = new Image()
    var charactercutrev = new Image()
    characterrev.src = scratchcatsrcrev
    charactercutrev.src = scratchcatcutsrcrev
    
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

    var hit_in_progress = 0

    socket.on('hitted', function(){
        if(!hit_in_progress){
            hit_in_progress = 1
            $("#myCanvas").css("background-color", "pink");
            setTimeout(function () {
                $("#myCanvas").css("background-color", "");
            }, 20)
            setTimeout(function(){
                hit_in_progress = 0
            }, 300)
        }
    })

    function reloadPos(currentConnections){
        ctx.clearRect(0, 0, c.width, c.height)
        for (client in currentConnections){
            let cl = currentConnections[client]
            if (cl.pos['attacc']){
                if (cl.pos['rotate']){
                    pic = charactercutrev
                } else {
                    pic = charactercut
                }
            } else {
                if (cl.pos['rotate']){
                    pic = characterrev
                } else {
                    pic = character
                }
            }
            ctx.drawImage(pic, cl.pos['x'], -cl.pos['y'], 150, 150)
            ctx.fillText(cl.data.hostname, cl.pos['x']+ 30 - (cl.data.hostname.length - 6), -cl.pos['y'] - 5, 150, 150)
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
            case 113:
                socket.emit('move', 'rotate')
                break
            default:
                break
        }
    })

    $(document).keydown(function(event){
        if (event.keyCode == 69){
            socket.emit('move', 'hold')
        }
    })

    $(document).keyup(function(event){
        if (event.keyCode == 69){
            socket.emit('move', 'release')
        }
    })
})