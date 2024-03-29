// Lets set some constants so we can easily target elements on the HTML.
const word1 = document.getElementById('word1');
const word2 = document.getElementById('word2');
const word3 = document.getElementById('word3');
const word4 = document.getElementById('word4');
const copybtn = document.getElementById('copybtn');

var fullphrase = '';

// Create the arrays of words to choose from.
var buzzword1 = Array('fuel loads','minimums','credit hours','ACARS','LAX terminal','KMSP terminal','ASRS','jump seat','release','sink rate','jump seat','bids','jet bridge','INOP equipment','crew meals','reserve trips','night recurrent','GoGo™ Inflight Wifi'); //BLUE
var location_noun1 = Array('the Airbus','the CRJ-900','the CRJ-200','salt lake overnight','the 737','the 737 MAX','our Hotel Van','my check ride','the simulator'); //GREY
var time = Array('last night','during my last leg','during my last 4 day trip','during my last trip','last month','while based in NY','during IOE','after IOE','during captain upgrade','@ Oshkosh Airventure','@ Sun and Fun','@ JetBlue','@ Delta','@ SkyWest'); //GREEN
var descriptor = Array('really nuts','over-credited','not in-line with our mission statement','against the contract','against ALPA regulations','in question by my chief pilot','questionable, at best','a bit sketchy','totally not legal','super f**ked up','enough to break guarantee'); //YELLOW

// Lets goahead and generate a phrase since the page is loaded and give the user
// something to see from the start.
generate_phrase();

const wordMap = {
    'one': { array: buzzword1, textContent: word1 },
    'two': { array: location_noun1, textContent: word2 },
    'three': { array: time, textContent: word3 },
    'four': { array: descriptor, textContent: word4 },
};

// "Generate_phrase" will create a phrase by rolling through the arrays to popular each word.
function generate_phrase() {
    console.log('♻️ Generating phrase from array pool...');
    setword1 = buzzword1[Math.floor(Math.random() * buzzword1.length)];
    setword2 = location_noun1[Math.floor(Math.random() * location_noun1.length)];
    setword3 = time[Math.floor(Math.random() * time.length)];
    setword4 = descriptor[Math.floor(Math.random() * descriptor.length)];
    fullphrase = 'The ' + setword1 + ' on ' + setword2 + ' ' + setword3 + ' was ' + setword4;
    console.log(fullphrase);
    render_phrase();
}

function copyText() {
    navigator.clipboard.writeText(fullphrase);
    copybtn.textContent = 'Copied!';
}

function rerollSingleWord(wordid) {
    const wordData = wordMap[wordid];

    if (wordData) {
        const randomWord = wordData.array[Math.floor(Math.random() * wordData.array.length)];
        wordData.textContent.textContent = randomWord;
        console.log(wordid);
    }
}

// "Render Phrase" will take the setword variables and update the HTML to show the new words.
function render_phrase() {
    word1.textContent = setword1;
    word2.textContent = setword2;
    word3.textContent = setword3;
    word4.textContent = setword4; 
}
