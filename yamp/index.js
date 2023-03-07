const osc = require("osc");
const Fugue = require("./fugue");
const eighth_note = 500;

const udpPort = new osc.UDPPort({
    // This is the port we're listening on.
    localAddress: "127.0.0.1",
    localPort: 57121,

    // This is where sclang is listening for OSC messages.
    remoteAddress: "127.0.0.1",
    remotePort: 57120,
    metadata: true
});

udpPort.open();

let fugue = new Fugue(57);

setInterval(() => {
  let note = fugue.getNote();
  if (note[0] !== null) {
    msg = {
      address: "/note",
      args: [{
        "type": "i",
        "value": note[0]
      }, {
        "type": "f",
        "value": (note[1] * eighth_note) / 1000
      }, {
        "type": "f",
        "value": note[2]
      }]
    };
    udpPort.send(msg);
  }
}, eighth_note);