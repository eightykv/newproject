const Motif = require("./motif");
const scales = [
  // Pentatonic minor scale, in semitones from root
  [0, 3, 5, 7, 10, 12, 15, 17]
];
//const notes_prob = [1, 0.1, 0.2, 0.9, 0.1, 0.4]; //6/8
const notes_prob = [1, 0.1, 0.5, 0.3, 0.9, 0.1, 0.4, 0.4]; 

class Fugue {
  #timesig = 8; // 6/8 time
  #num_notes_prob = [2, 3, 3, 3, 4, 4, 4, 5, 5, 6]; // poor man's gaussian distribution
  #motifs = [];
  #rhythms = [];
  #key; #basekey;
  #note_num; #note_pos; #bar_num; #bar_pos;

  constructor(key) {
    this.#key = key;
		this.#basekey = key;
		this.#note_num = 0;
		this.#note_pos = 0;
		this.#bar_num = 0;
		this.#bar_pos = 0;
    this.generateMotifs(notes_prob);
  }

  generateMotifs() {
    this.#motifs = [];
    this.#rhythms = [];
    let num_motifs = 3;
    for (let i = 0; i < num_motifs; i++) {
      let num_notes = this.#num_notes_prob[Math.floor(Math.random() * this.#num_notes_prob.length)]; // between 2 and 6 notes
      // I don't love using the global variable here but don't have a better idea
      this.#rhythms.push(Motif.makeRhythm(num_notes, this.#timesig, notes_prob));
      this.#motifs.push(Motif.makeMotif(num_notes, scales[0], this.#rhythms[i]));
    }
    let m = Array(this.#timesig).fill(null);
    m[0] = 0;
    let r = Array(this.#timesig).fill(0);
    r[0] = this.#timesig / 2;

    this.#motifs.push(m);
    this.#rhythms.push(r);
    console.log(this.#rhythms)
    console.log(this.#motifs)
  }

  getNote() {
    if (this.#motifs.length < 1) {
      throw new Error("No motifs!");
    }
    
    let not = this.#motifs[this.#bar_num % this.#motifs.length][this.#note_pos];
    let dur = this.#rhythms[this.#bar_num % this.#rhythms.length][this.#note_pos];

    let accent = 1;
    switch (this.#note_pos) {
      case 1, 3, 5, 7:
        accent = 0.4;
        break;
      case 2, 6:
        accent = 0.6;
        break;
      case 4:
        accent = 0.8;
        break;
    }

    this.#advancePosition();

    return [not === null ? not : not + this.#key, dur, accent];
  }

  #advancePosition() {
    this.#note_num++;
    this.#note_pos = this.#note_num % this.#timesig;
    if (this.#note_pos === 0) {
      this.#bar_num++;
      this.#bar_pos = this.#bar_num % this.#motifs.length;

      if (this.#bar_num % this.#timesig === 0) {
        this.generateMotifs();
      }
    }
  }
}
/*
let f = new Fugue(57);
f.generateMotifs(notes_prob);
for (let i = 0; i < 12; i++) {
  console.log(f.getNote());
}
*/
module.exports = Fugue;