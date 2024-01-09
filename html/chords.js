/*
These functions handle parsing the chord-pro text format
and transposing chords
*/


function parseChordProFormat(chordProLinesArray) {
  //parse the song lines with embedded
  //chord pro chords into individual movable words

  transposedByNSemitones = 0 //reset transposition in semitones

  //clear any newline or return characters as a precaution --might not be needed
  for (let i = 0; i < chordProLinesArray.length; i++) {
    chordProLinesArray[i] = chordProLinesArray[i].replace(/(\r\n|\n|\r)/gm, "");
  }


  //add the lines of text to html <p> elements
  let textDiv = document.getElementById("text-area")
  textDiv.innerHTML = ''

  for (let i = 0; i < chordProLinesArray.length; i++) {
    let line = chordProLinesArray[i]
    textDiv.innerHTML = textDiv.innerHTML + `<p> ${line}</p>`

    let lyricLine = '' // each lyric in a line
    let chordLine = '' // each chord in a line
    let isChord = 0  // If we are searching for a chord
    let isLyric = 1 // If we are searching for a lyric

    //separate chords and lyrics by a blank. Preserve the [] characters in chord symbols
    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      let ch = line.charAt(charIndex)
      // We are recording a lyric line
      if (ch == ']') {
        // lyricLine = lyricLine + ch + ' '
        isChord = 0
        isLyric = 1
      } else if (ch == '[') {
        // lyricLine = lyricLine + ' ' + ch
        isChord = 1
        isLyric = 0
      } else {
        // Looking for chords
        if (isChord == 1 && isLyric == 0){
          chordLine += ch
          lyricLine += ' '
        }
        // Looking for lyrics
        else if (isChord == 0 && isLyric == 1){
          lyricLine += ch
          chordLine += ' '
        }
      }
    }   

    //Now turn lyrics line into individual drag-able words
    //Create Movable Words
    const characterWidth = canvas.getContext('2d').measureText('m').width; //width of one character

    //Make drag-able words
    chordLine += ' '; //add blank to lyrics line just so it conveniently ends in a blank
    if (chordLine.trim().length > 0) {
      let theLyricWord = ''
      let theLyricLocationIndex = -1
      for (let j = 0; j < chordLine.length; j++) {
        let ch = chordLine.charAt(j)
        if (ch == ' ') {
          //start or end of word or chord symbol
          if (theLyricWord.trim().length > 0) {
            let chordSpace = 20
            let word = {
              word: theLyricWord,
              x: leftMargin + theLyricLocationIndex * characterWidth,
              y: topMargin + i * 2 * lineHeight + lyricLineOffset - chordSpace,
            }
            //designate word as either a lyric or a chord symbol
            if (word.word.endsWith(']')) word.chord = 'chord'
            else word.lyric = 'lyric'

            words.push(word)
            word.chord = 'chords'

          }
          theLyricWord = ''
          theLyricLocationIndex = -1

        } else {
          //its part of a lyric word
          theLyricWord += ch
          if (theLyricLocationIndex === -1) theLyricLocationIndex = j
        }
      }
    } //end make lyric chord words

    lyricLine += ' '; //add blank to lyrics line just so it conveniently ends in a blank
    if (lyricLine.trim().length > 0) {
      let theLyricWord = ''
      let theLyricLocationIndex = -1
      for (let j = 0; j < lyricLine.length; j++) {
        let ch = lyricLine.charAt(j)
        if (ch == ' ') {
          //start or end of word or chord symbol
          if (theLyricWord.trim().length > 0) {
            let word = {
              word: theLyricWord,
              x: leftMargin + theLyricLocationIndex * characterWidth,
              y: topMargin + i * 2 * lineHeight + lyricLineOffset,
            }
            //designate word as either a lyric or a chord symbol
            if (word.word.endsWith(']')) word.chord = 'chord'
            else word.lyric = 'lyric'

            words.push(word)
            word.lyric = 'lyrics'

          }
          theLyricWord = ''
          theLyricLocationIndex = -1

        } else {
          //its part of a lyric word
          theLyricWord += ch
          if (theLyricLocationIndex === -1) theLyricLocationIndex = j
        }
      }
    } //end make lyric chord words
  }
}

function transpose(theWords, semitones) {
  //Transpose any of the chords in the array of word objects theWords by
  //semitones number of musical steps or semi-tones.
  //semitones is expected to be an integer between -12 and +12

  if (semitones === 0) return //nothing to do

  transposedByNSemitones += semitones
  if (transposedByNSemitones >= 12) transposedByNSemitones -= 12
  if (transposedByNSemitones <= -12) transposedByNSemitones += 12

  for (let i = 0; i < words.length; i++) {
    if (words[i].chord) {
      words[i].word = transposeChord(words[i].word, semitones)
    }
  }
}

function transposeChord(aChordString, semitones) {
  console.log(`transposeChord: ${aChordString} by ${semitones}`)
  /*transpose aChordString by semitones
  aChordString is expected to be like: '[Gm7]' or '[F#maj7]'
  Strategy: look for the position of the chord letter name in hard-coded array of
  letter names and if found replace the characters with the ones offset by the argument
  semitones.
  For example to transpose A#m up by three semitones find for A# in RootNamesWithSharps
  array (which would be 1) then replace A# with the name found at RootsNamesWithSharps[1+3]
  which would be C#. Hence A#m transposed up three semitones would be C#m.
  */
  const RootNamesWithSharps = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
  const RootNamesWithFlats = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab']
  let rootNames = RootNamesWithSharps
  let rootNameIndex = -1
  let transposedChordString = ''
  for (let i = 0; i < aChordString.length; i++) {
    if (rootNames.findIndex(function(element) {
        return element === aChordString[i]
      }) === -1) {
      //character is not start of a chord root name (i.e. is not A,B,C,D,E,F, or G)
      if ((aChordString[i] !== '#') && (aChordString[i] !== 'b')) //skip # and b suffix
        transposedChordString += aChordString[i]
    } else {
      //character is start of a chord name root (i.e. A,B,C,D,E,F, or G)
      let indexOfSharp = -1
      let indexOfFlat = -1
      //check to see if we are dealing with names like A# or Bb
      if (i < aChordString.length - 1) {
        indexOfSharp = RootNamesWithSharps.findIndex(function(element) {
          return element === (aChordString[i] + aChordString[i + 1])
        })
        if (indexOfSharp !== -1) transposedChordString += RootNamesWithSharps[(indexOfSharp + 12 + semitones) % 12]
        indexOfFlat = RootNamesWithFlats.findIndex(function(element) {
          return element === (aChordString[i] + aChordString[i + 1])
        })
        if (indexOfFlat !== -1) transposedChordString += RootNamesWithFlats[(indexOfFlat + 12 + semitones) % 12]
      }
      if ((indexOfSharp === -1) && (indexOfFlat === -1)) {
        //chord name is letter without a # or b
        let index = rootNames.findIndex(function(element) {
          return element === aChordString[i]
        })
        if (index !== -1) transposedChordString += rootNames[(index + 12 + semitones) % 12]
      }
    }
  }
  return transposedChordString
}
