const modes = [
	[0, 2, 4, 5, 7, 9, 11], // ionian
	[0, 2, 3, 5, 7, 9, 10], // dorian
	[0, 1, 3, 5, 7, 8, 10], // phyrgian
	[0, 2, 4, 6, 7, 9, 11], // lydian
	[0, 2, 4, 5, 7, 9, 10], // mixolydian
	[0, 2, 3, 5, 7, 8, 10], // aeolian
	[0, 1, 3, 5, 6, 8, 10], // locrian
	[0, 2, 3, 5, 7, 8, 11] // harmonic minor
];

const chord_types = [
	[0, 2, 4], // Triad: root, 3rd, 5th
	[0, 2, 4, 5], // 6th: root, 3rd, 5th, 6th
	[0, 2, 4, 6], // 7th: root, 3rd, 5th, 7th
	[0, 3, 4], // sus4: root, 4th, 5th
	[0, 2, 4, 6, 8, 10], // 11th: root, 3rd, 5th, 7th, 9th, 11th
];

class MeatMelody {
	// Private variables
	#chord_progression = [];
	#last_chord = [];
	#chords = [0, 0, 0, 0, 0, 0];
	#chords_prob = [0.8, 0.05, 0.05, 0.2, 0.01, 0.05];
	#notes = [
		[0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0]
	];
	#last_note = 0;
	#notes_prob = [0.99, 0.6, 0.8, 0.95, 0.4, 0.8];
	#scales = [];
	#timesig = 6; // 6/8
	#every_other_drone = 0;

	constructor(key) {
		this.key = key;
		this.basekey = key;
		this.note_num = -1;
		this.note_pos = 0;
		this.bar_num = -1;
		this.bar_pos = 0;
		this.bars_since_change = 0;
		this.changeNotesChords();
	}

	makeNotes() {
		if (this.bar_pos === (this.#chord_progression.length - 1)) {
			// alternate
			let note = this.#notes[1][this.note_pos];
			return note > -1 ? this.#notes[1][this.note_pos] + this.key : -1;
		}
		// main
			let note = this.#notes[0][this.note_pos];
			return note > -1 ? this.#notes[0][this.note_pos] + this.key : -1;
	}

	makeChords() {
		let these_notes = [];

		// if there's a chord, add all notes
		let c = this.#chords[this.note_pos];
		if (c > -1) {
			let cc = chord_types[c];
			this.#last_chord = cc;
			// chords an octave down. TODO: change this
			cc.forEach(el => {these_notes.push(this.#scales[this.bar_pos][el % 7] + this.key - 12)});
		}
		
		return these_notes;
	}

	advancePosition() {
		// Advance to the next note
		this.note_num++;
		// Do we advance to the next bar?
		this.note_pos = this.note_num % this.#timesig;
		// If so...
		if (this.note_pos === 0) {
			// Increment the bar
			this.bar_num++;
			// Stay on a chord for 1 bar
			// TODO: allow this to change
			this.bar_pos = this.bar_num % this.#chord_progression.length;
			this.key = this.basekey + this.#chord_progression[this.bar_pos];
			// If we've looped back around to the beginning of the chord progression...
			if (this.bar_pos === 0) {
				this.bars_since_change++;
				// We can change chords when it's been 2, 4, 6, or 8 bars since the last time we changed.
				// (or if we're starting)
				// The probability increases linearly.
				// TODO: Maybe more exponential probability change?
				// TODO: Should the max be more than 8 bars?
				if (this.bars_since_change % 2 === 0 && Math.random() < this.bars_since_change / (this.#chords.length * 2)) {
					this.changeNotesChords();
					this.bars_since_change = 0;
				}
			}
		}
	}

	changeNotesChords() {
		for (let i = 0; i < this.#timesig; i++) {
			// Is there a note here?
			this.#notes[0][i] = this.whichNote(i);
			this.#notes[1][i] = this.whichNote(i);
			
			// Is there a chord here? Which chord? -1 is no chord
			this.#chords[i] = Math.random() < this.#chords_prob[i] ? Math.floor(Math.random() * chord_types.length) : -1;
		}
		this.#every_other_drone = (this.#every_other_drone + 1) % 3;
		console.log("new notes: " + this.#notes.join(" "));
		console.log("new chords: " + this.#chords.join(" "));
	}

	whichNote(i) {
		if (this.#every_other_drone !== 0 && this.#last_chord.length !== 0) {
			// half chance each of moving up the chord or moving down the chord
			let rand_dir = Math.random() < 0.5;
			this.#last_note += rand_dir ? 1 : -1;
			this.#last_note *= Math.random() < 0.1 ? 0 : 1; // 1/6th chance of root note
			// Wrap around if we go off the front end
			this.#last_note = this.#last_note % this.#last_chord.length;
			// Wrap around if we go off the back end
			if (this.#last_note < 0) {
				this.#last_note = this.#last_chord.length + this.#last_note;
			}
			// Always relative to the current scale
			let n = this.#scales[this.bar_pos][this.#last_chord[this.#last_note] % 7];
			return Math.random() < this.#notes_prob[i] ? n : -1;
		}
		return 0; // just drone until/unless we add chords
	}

	// chord progression: add, get
	addChord(chord) {
		this.#chord_progression.push(chord);
		this.#scales.push(modes[chord % modes.length]);
		/*this.makeChords();
		this.changeNotesChords();*/
	}

	chordProgression() {
		return this.#chord_progression.join(" ");
	}
}

module.exports = MeatMelody;