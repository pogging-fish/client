import * as client from './client.js'
client.ClientEvents.on("connect", async (token) =>  {
    console.log("Connected to PogNet")
    client.ClientEvents.emit("open",[65535])
    client.ClientEvents.on("PORTOPENED", () => {
        // Do something
    })
    client.ClientEvents.on("port65535",(data) => {
        console.log(`${data[0]}: ${data[1]}`)
    })
})
