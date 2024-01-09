/*
Client-side javascript f
*/
let words = [] //array of drag-able lyrics or chord words

let timer //timer for animation //not used in this assignment
let wordBeingMoved //word being dragged by the mouse
let deltaX, deltaY //location where mouse is pressed relative to word origin
let canvas = document.getElementById('canvas1') //our drawing canvas
let fontPointSize = 18 //point size for chord and lyric text
let wordHeight = 20 //estimated height of a string in the editor
let editorFont = 'Courier New' //font for your editor -must be monospace font
let lineHeight = 40 //nominal height of text line
let lyricLineOffset = lineHeight * 5 / 8 //nominal offset for lyric line below chords
let topMargin = 40 //hard coded top margin white space of page
let leftMargin = 40 //hard code left margin white space of page

let transposedByNSemitones = 0 //current transposition in semitones

let wordTargetRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
} //used for debugging
//rectangle around word boundary


function getWordAtLocation(aCanvasX, aCanvasY) {

  //locate the word near aCanvasX,aCanvasY co-ordinates
  //aCanvasX and aCanvasY are assumed to be X,Y loc
  //relative to upper left origin of canvas

  //used to get the word mouse was clicked on

  let context = canvas.getContext('2d')

  for (let i = 0; i < words.length; i++) {
    let wordWidth = context.measureText(words[i].word).width
    if ((aCanvasX > words[i].x && aCanvasX < (words[i].x + wordWidth)) &&
      (aCanvasY > words[i].y - wordHeight && aCanvasY < words[i].y)) {
      //set word targeting rectangle for debugging
      wordTargetRect = {
        x: words[i].x,
        y: words[i].y - wordHeight,
        width: wordWidth,
        height: wordHeight
      }
      return words[i]
    } //return the word found
  }
  return null //no word found at location
}

function drawCanvas() {
  //Call this function whenever the canvas contents has changed
  let context = canvas.getContext('2d')
  let lyricFillColor = 'cornflowerblue'
  let lyricStrokeColor = 'blue'
  let chordFillColor = 'green'
  let transposedChordFillColor = 'orange'
  let chordStrokeColor = 'green'

  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height) //erase canvas

  context.font = '' + fontPointSize + 'pt ' + editorFont
  context.fillStyle = 'cornflowerblue'
  context.strokeStyle = 'blue'

  //draw drag-able lyric and chord words
  for (let i = 0; i < words.length; i++) {
    let data = words[i]
    if (data.lyric) {
      context.fillStyle = lyricFillColor
      context.strokeStyle = lyricStrokeColor
    }
    if (data.chord) {
      if (transposedByNSemitones === 0) {
        context.fillStyle = chordFillColor
        context.strokeStyle = chordStrokeColor

      } else {
        context.fillStyle = transposedChordFillColor
        context.strokeStyle = transposedChordFillColor
      }

    }

    context.fillText(data.word, data.x, data.y)
    context.strokeText(data.word, data.x, data.y)
  }


}
