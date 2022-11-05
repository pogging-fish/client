import io from 'socket.io-client'
import fs from 'fs'
import EventEmitter from 'events';
import { exit } from 'process';
export const ClientEvents = new EventEmitter();
export async function open(port){
    ClientEvents.emit("open", [port])
    return new Promise((res) => {
        ClientEvents.on("PORTOPENED", () => {res(true)})
    })
}
const socket = io("ws://pognet.pogging.fish")
let token = ""
const data = fs.readFileSync('./login.json', 'utf8')
const login = JSON.parse(data)
socket.on("connect", () => {
    let previous_message = ""
    socket.on("message", message => {
        if (message == "CONNECTIONPACKET"){
            socket.send(`IP ${login["IP"]}`)
        }
        else if (message == "PASSWORDPACKET"){
            socket.send(`PASS ${login["PASS"]}`)
        }
        else if (message == "NEWDATA"){
            socket.send(`DATACALLBACK ${token}`)
        }
        else if (message.startsWith("DATA")){
            let data = message.split(" ")
            let port = parseInt(data[2])
            let sender = data[1]
            data = data.slice(3).join(" ")
            ClientEvents.emit(`port${port}`,[sender,data])
        }       
        else if (message.startsWith("AUTH")){
            token = message.split(" ")[1]
            ClientEvents.emit('connect',[token])
        }
        else if (message == "FAILURE"){
            console.log(`Something went wrong at: ${previous_message}`)
            socket.disconnect()
        }
        else if (message == "EXISTSFAILURE"){
            console.log("IP already connected. Safely disconnecting.")
            socket.disconnect()
        }
        else if (message == "OPEN"){
            ClientEvents.emit("PORTOPENED")
        }
        else if (message == "PORTAUTH"){
            socket.send(`PORTAUTH ${token}`)
        }
        previous_message = message
    })
    socket.on("disconnect", ()=>{
        console.log("Whoops... Failed")
        exit(1)
    })
})
ClientEvents.on("open", port => {
    socket.send(`OPENPORT ${port}`)
})
ClientEvents.on("send", (data) => {
    socket.send(`SEND ${token} ${data[0]} ${data[1]} ${data[2]}`)
})
