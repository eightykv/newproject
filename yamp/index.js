const osc = require("osc");
const MeatMelody = require("./meatmelody");

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

let mm = new MeatMelody(57);
mm.addChord(7);

mm.advancePosition();
setInterval(() => {
  let chords = mm.makeChords();
  mm.advancePosition();
  
  let msg = {
    address: "/chord",
    args: []
  };

  chords.forEach(val => {
    msg.args.push({
      "type": "i",
      "value": val
    })
  });

  udpPort.send(msg);

  let note = mm.makeNotes();
  if (note !== -1) {
    msg = {
      address: "/note",
      args: [{
        "type": "i",
        "value": note
      }]
    };
    udpPort.send(msg);
  }
}, 500);