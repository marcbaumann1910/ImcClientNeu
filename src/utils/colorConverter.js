import Color from 'color';

//wandelt deutsche Farbnamen in englische um und gibt dann den Hexecode der Farbe zurück!

const germanToEnglishColors = {
    rot: 'red',
    blau: 'blue',
    grün: 'green',
    gelb: 'yellow',
    schwarz: 'black',
    weiß: 'white',
    weiss: 'white',
    grau: 'gray',
    violett: 'purple',
    orange: 'orange',
    rosa: 'pink',
    braun: 'brown',
}

//Farbnamen in Hex umwandeln

export function germanColorToHex(germanColor) {
    const englishColor = germanToEnglishColors[germanColor.toLowerCase()];
    if (!englishColor) {
        throw new Error(`Unbekannte Farbe: ${germanColor}`);
    }
    return Color(englishColor).hex();
}

