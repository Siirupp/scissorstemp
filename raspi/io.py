import sys
import subprocess
import pifacedigitalio as p
import time
import socketio
import socket


def get_host_name_IP(): 
  try: 
    host_name = socket.gethostname()
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    host_ip = s.getsockname()[0]
    s.close()
    return (host_name, host_ip)
  except: 
    print("Unable to get Hostname and IP")  
    

def getPiData():
  data = {}
  data['hostname'], data['ip'] = get_host_name_IP()
  
  return data

sio = socketio.Client()

@sio.event
def connect():
    print('connection established')
    sio.emit('setdata', getPiData())

@sio.event
def disconnect():
    print('disconnected from server')

@sio.event
def clientConnected(client_id, pos, data):
    print("Connection with client id " + client_id + ", data: " + str(data) + ", at position { x: " + str(pos['x']) + ", y: " + str(pos['y']) + "}." )

led = 0

@sio.event
def hitted():
    global led
    led = led + 1
    if led >= 256:
        led = 0
    print("you got hit")
    subprocess.call(["/home/pi/remote-debugging/lab3", str(led)], stdin = sys.stdin)

sio.connect('http://hindulaatti.ddns.net:3030/')
#sio.connect('http://172.27.241.221:3030/')

p.init()

while True:
  reads = [p.digital_read(0), p.digital_read(1), p.digital_read(2), p.digital_read(3)]
  if 1 in reads:
    if(reads[0] == 1):
      sio.emit('move', 'right')
    if(reads[1] == 1):
      sio.emit('move', 'down')
    if(reads[2] == 1):
      sio.emit('move', 'up')
    if(reads[3] == 1):
      sio.emit('move', 'left') 
  time.sleep(0.1)

sio.disconnect()
