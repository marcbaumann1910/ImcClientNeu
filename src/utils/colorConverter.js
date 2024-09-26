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
    hellblau: 'lightblue',
    dunkelblau: 'darkblue',
    hellgrün: 'lightgreen',
    dunkelgrün: 'darkgreen',
    hellrot: 'lightcoral',
    dunkelrot: 'darkred',
    pink: 'pink',
    magenta: 'magenta',
    cyan: 'cyan',
    türkis: 'turquoise',
    gold: 'gold',
    silber: 'silver',
    lila: 'purple',  // Alternativ für violett
    beige: 'beige',
    oliv: 'olive',
    indigo: 'indigo',
    elfenbein: 'ivory',
    lavendel: 'lavender',
    koralle: 'coral',
    pfirsich: 'peach',
    minze: 'mint',
    marineblau: 'navy',
    limone: 'lime',
    himmelblau: 'skyblue',
    graphit: 'charcoal',
    schokolade: 'chocolate',
    sand: 'sandybrown',
    creme: 'cream',
    karminrot: 'crimson',
    flieder: 'orchid',
    khaki: 'khaki',
    dunkelgrau: 'darkgray',
    hellgrau: 'lightgray',
    silbergrau: 'silver',
    violettgrau: 'violet',
    petrol: 'teal',
    bordeaux: 'maroon',
    fuchsia: 'fuchsia',
    apricot: 'apricot',
    zitrone: 'lemon',
    purpur: 'purple',
    mintgrün: 'mintgreen',
    zitronengelb: 'lemonchiffon',
    karmesinrot: 'crimson',
    anthrazit: 'darkslategray',
}

//Farbnamen in Hex umwandeln

export function germanColorToHex(germanColor) {
    const englishColor = germanToEnglishColors[germanColor.toLowerCase()];
    if (!englishColor) {
        throw new Error(`Unbekannte Farbe: ${germanColor}`);
    }
    return Color(englishColor).hex();
}

