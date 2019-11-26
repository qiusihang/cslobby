import sys
sys.path.append("py")
from datetime import datetime
from websocket_server_local import WebsocketServer

channels = {} # users in each channel
history = {} # conversation history in each channel

def new_client(client, server):
    result = "Client(%d) has joined the lobby." % client['id']
    log(result)

def client_left(client, server):
    result = "Client(%d) left the lobby." % client['id']
    for channel in channels.keys():
        if client in channels[channel]:
            channels[channel].remove(client)
            broadcast(channel, "%s left the conversation." % (client['nickname']))
    log(result)

def message_back(client, server, message):
    nickname = message[1:message.index(')')].split('&')[0] # get nickname from message
    channel = message[1:message.index(')')].split('&')[1] # get channel from message
    message = message[message.index(')')+1:]  # get real message from message
    time = datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
    client['nickname'] = nickname
    if channel in channels.keys():
        if client not in channels[channel]:
            broadcast(channel, "%s has joined the conversation %s." % (nickname, channel))
            server.send_message(client, recent_history(channel)) # send conversational history to new user
            channels[channel].append(client)
            return
    else:
        channels[channel] = [client]
        broadcast(channel, "%s has joined the conversation %s." % (nickname, channel))
        return
    result = "%s:%s: %s" % (nickname, time, message)
    broadcast(channel, result, [client])
    server.send_message(client, "__you__:%s: %s" % (time, message))

def recent_history(channel, recent = 50): # get recent conversational history (default: 50 dialogues)
    res = ""
    if len(history[channel]) > recent:
        for i in range(-recent,0):
            res += "#$%^&" + history[channel][i]
    else:
        for h in history[channel]:
            res += "#$%^&" + h
    return res

def add_to_history(channel, message):
    if channel not in history.keys():
        history[channel] = [message]
    else:
        history[channel].append(message)

def broadcast(channel, message, excl = []): # broadcast to channel with message excluding users in the list-excl
    log(message)
    add_to_history(channel, message)
    for c in channels[channel]:
        if c in excl: continue
        server.send_message(c, message)

def log(message):
    print(message.encode('utf-8'))

server = WebsocketServer(5000, host='0.0.0.0')
server.set_fn_new_client(new_client)
server.set_fn_client_left(client_left)
server.set_fn_message_received(message_back)
server.run_forever()
