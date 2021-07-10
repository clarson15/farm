from random import randint
import socket
import time

HOST = '127.0.0.1'
PORT = 48307

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((HOST, PORT))
s.settimeout(1.0)
s.listen()
lights = True
Humidity = 60.54
Temperature = 30.8
while True:
    try:
        conn, addr = s.accept()
        data = conn.recv(1024)
        print(data)
        if data == b'status':
            print('received status request')
            conn.send(('%s,%.2f,%.2f' %
                       (lights, Temperature + (randint(-10, 10) / 10), Humidity + (randint(-10, 10) / 10))).encode('ascii'))
        elif data == b'toggle false':
            lights = False
            print('received toggle off request')
            conn.send(b'1')
        elif data == b'toggle true':
            lights = True
            print('received toggle on request')
            conn.send(b'1')
        else:
            conn.send(b'0')
        print('responded')
        conn.close()
    except:
        pass
    time.sleep(1)
