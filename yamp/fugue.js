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
  #basemotifs = [];
  #motifs = {
    "a": [],
    "b": [],
    "c": [],
  };
  #rhythms = {
    "a": [],
    "b": [],
    "c": [],
  };
  #key; #basekey;
  #note_num; #note_pos; #bar_num; #bar_pos;
  #fugue;

  constructor(key) {
    this.#key = key;
		this.#basekey = key;
		this.#note_num = 0;
		this.#note_pos = 0;
		this.#bar_num = 0;
		this.#bar_pos = 0;
    this.generateMotifs(notes_prob);
    this.#fugue = 'a';
  }

  generateMotifs() {
    // Reset the variables
    this.#fugue = 'a';
    this.#motifs = {
      "a": [],
      "b": [],
      "c": [],
    };
    this.#rhythms = {
      "a": [],
      "b": [],
      "c": [],
    };
    let num_motifs = 3;
    let temp_rhythms = [];
    for (let i = 0; i < num_motifs; i++) {
      let num_notes = this.#num_notes_prob[Math.floor(Math.random() * this.#num_notes_prob.length)]; // between 2 and 6 notes
      // I don't love using the global variable here but don't have a better idea
      temp_rhythms.push(Motif.makeRhythm(num_notes, this.#timesig, notes_prob));
      let motif = Motif.makeMotif(num_notes, scales[0], temp_rhythms[i]);
      this.#basemotifs.push(motif[0]);
      this.#rhythms[this.#fugue].push(...temp_rhythms[i]);
      this.#motifs[this.#fugue].push(...motif[1]);
    }

    
    let ending = Motif.makeEnding(this.#timesig);

    this.#motifs[this.#fugue].push(...ending[0]);
    this.#rhythms[this.#fugue].push(...ending[1]);

    //console.log(this.#motifs);
  }

  getNote() {
    if (this.#motifs.length < 1) {
      throw new Error("No motifs!");
    }

    let not = this.#motifs[this.#fugue][this.#note_pos];
    let dur = this.#rhythms[this.#fugue][this.#note_pos];
    //let not = this.#motifs[this.#bar_num % this.#motifs.length][this.#note_pos];
    //let dur = this.#rhythms[this.#bar_num % this.#rhythms.length][this.#note_pos];

    let accent = 1;
    switch (this.#note_pos % 8) {
      case 1, 3, 5, 7:
        accent = 0.6;
        break;
      case 2, 6:
        accent = 0.75;
        break;
      case 4:
        accent = 0.9;
        break;
    }

    this.#advancePosition();

    return [not === null ? not : not + this.#key, dur, accent];
  }

  #advancePosition() {
    this.#note_num++;
    this.#note_pos = this.#note_num % this.#motifs[this.#fugue].length;
    if (this.#note_pos === 0) {
      this.#bar_num++;
      //this.#bar_pos = this.#bar_num % this.#motifs.length;

      if (this.#bar_num % 2 === 0) {
        this.generateMotifs();
      }
    }
  }

  #makeFugue() {
    // Change rhythms
    // Up/down an octave
    // Invert
    // Half speed
  }
}

/*let f = new Fugue(57);
f.generateMotifs(notes_prob);
for (let i = 0; i < 48; i++) {
  console.log(f.getNote());
}*/

module.exports = Fugue;