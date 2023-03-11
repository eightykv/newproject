class Motif {
  // TODO: figure out how to vary the number of notes -- more for rep/arp, fewer for jump

  static makeMotif(n, scale, rhythm) {
    let rand = Math.random();
    let motif;
    if (rand < 0.4) {
      motif = Motif.rep(n);
    }
    else if (rand < 0.7) {
      motif = Motif.arp(n, scale);
    }
    else {
      motif = Motif.jump(n, scale);
    }
    return [motif, Motif.applyRhythm(motif, rhythm)];
  }

  static makeEnding(n) {
    let mending = Array(n).fill(null);
    let rending = Array(n).fill(0);
 
    let rand = Math.random();
    if (rand < 0.5) {
      mending[0] = 0;
      rending[0] = n / 2; // n is time sig, will always be even
    }
    else {
      mending[0] = -1;
      rending[0] = 1;
      mending[1] = 0;
      rending[1] = 1;
    }
 
    return [mending, rending];
  }

  static rep(n) {
    let notes = [0];
    for (let i = 1; i < n; i++) {
      // random number between 0 and 99
      // just to make it easier for me to think about it
      let rand = Math.floor(Math.random() * 100);
      let ln = notes[i - 1]; // last note
      // if the last note wasn't a 0...
      if (ln !== 0) {
        // Sometimes ascend/descend three notes
        if (Math.abs(ln) === 2 && rand < 30) {
          notes.push(ln < 0 ? -1 : 1);
        }
        else {
          notes.push(0);
        }
      }
      else {
        // 50/50 chance of root note
        if (rand < 50) {
          notes.push(0);
        }
        else if (rand < 80) {
          // If rand is even, add -1, if rand is odd, add -2
          notes.push(rand % 2 === 0 ? -1 : 1);
        }
        else {
          notes.push(rand % 2 === 0 ? -2 : 2);
        }
      } 
    }
    // always end either one down or one up
    notes[notes.length - 1] = Math.random() < 0.5 ? -1 : 1;
    return notes;
  }

  static arp(n, scale) {
    if (scale.length < n) {
      throw new Error("Arp motif error: requested number of notes is larger than scale");
    }
    let ascend = Math.random() < 0.5; // true = ascend, false = descend
    let start0 = Math.random() < 0.5; // true = start at 0, false = end at 0
    let notes = Array(n);
    for (let i = 0; i < n; i++) {
      if (ascend && start0) {
        // Ascend and start at 0
        notes[i] = scale[i];
      }
      else if (ascend && !start0) {
        // Ascend and end at 0
        notes[n - i - 1] = 0 - (scale[scale.length - 1] - scale[scale.length - i - 1]);
      }
      else if (!ascend && start0) {
        // Descend and start at 0
        notes[i] = 0 - (scale[scale.length - 1] - scale[scale.length - i - 1]);
      }
      else {
        // Descend and end at 0
        notes[i] = scale[n - i - 1];
      }
    }
    return notes;
  }

  static jump(n, scale) {
    // 30% chance of starting on the 5th
    let notes = [Math.random() < 0.3 ? 4 : 0];
    for (let i = 1; i < n; i++) {
      if (notes[i - 1] === 0) {
        // to a random place in the scale (higher?)
        let floor = Math.floor(scale.length / 2);
        let range = scale.length - floor;
        notes.push(scale[Math.floor(Math.random() * range) + floor]);
      }
      else {
        // either repeat this note or go to 0
        notes.push(Math.random() < 0.25 ? notes[i - 1] : 0);
      }
    }
    return notes;
  }

  static makeRhythm(n, beats, probs) {
    if (n > beats) {
      throw new Error("Motif rhythm error: requested more notes than beats");
    }

    // Weighted random generation: is there a note here or not?
    let pattern = Array(beats).fill(false);

    if (n === beats) {
      pattern = pattern.fill(true);
    }
    else {
      let avail = [...Array(beats).keys()];
      avail.splice(0, 1);
      pattern[0] = true;
      let filled = 1;
      while (filled < n) {
        let randidx = Math.floor(Math.random() * avail.length);
        let idx = avail[randidx];
        let rand = Math.random();
        if (rand < probs[idx] && !pattern[idx]) {
          pattern[idx] = true;
          filled++;
          avail.splice(randidx, 1);
        }
      }
    }

    return this.lengths(pattern);
  }

  static lengths(pattern) {
    let length = 1;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i]) {
        if (i - length < 0) {
          pattern[0] = 0;
        }
        else {
          pattern[i - length] = length;
        }
        length = 1;
      }
      else {
        length++;
        pattern[i] = 0;
      }
    }
    pattern[pattern.length - length] = length;

    /*
    // Look I don't like these repeated for loops
    // Unfortunately it's the best way I could think
    // to do what I want
    for (let i = 0; i < pattern.length; i++) {
      // now scale
      let rand = Math.random();
      let pl = pattern[i];
      if (pl !== 0) {
        if (rand < 0.05) {
          // 5% chance of quarter length
          if (pl > 1) {
            pl = Math.max(1, Math.floor(pl/4));
          }
        }
        else if (rand < 0.15) {
          // 10% chance of length - 1
          if (pl > 1) {
            pl--;
          }
        }

        pattern[i] = pl;
      }
    }*/
    
    return pattern;
  }

  static applyRhythm(melody, rhythm) {
    let new_melody = [];
    let next_note = 0;
    for (let i = 0; i < rhythm.length; i++) {
      if (rhythm[i] !== 0) {
        new_melody.push(melody[next_note]);
        next_note++;
      }
      else {
        new_melody.push(null);
      }
    }
    return new_melody;
  }
}
/*
const pent = [0, 3, 5, 7, 10, 12];
console.log(Motif.jump(4, pent));

for (let i = 0; i < 10; i++) {
  let rhy = Motif.makeRhythm(4, 6, [0.95, 0.4, 0.4, 0.9, 0.4, 0.4]);
  let mot = Motif.makeMotif(4, [0, 3, 5, 7, 10, 12], rhy);
  //let mel = Motif.arp(4, [0, 3, 5, 7, 10, 12]);
  console.log(mot);
  //console.log(rhy);
  //console.log(nm);
}
*/
module.exports = Motif;