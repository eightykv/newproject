const osc = require("osc");
const Fugue = require("./fugue");
const note_length = [450, 275];
let pos = 1;

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

function sendNextNote() {
  let note = fugue.getNote();
  if (note[0] !== null) {
    msg = {
      address: "/note",
      args: [{
        "type": "i",
        "value": note[0]
      }, {
        "type": "f",
        "value": (note[1] * note_length[pos % 2]) / 1000
      }, {
        "type": "f",
        "value": note[2]
      }]
    };
    udpPort.send(msg);
  }
  pos++;
  clearInterval(clock);
  clock = setInterval(sendNextNote, note_length[pos % 2]);
}

let clock = setInterval(sendNextNote, note_length[pos % 2]);