// Lets set some constants so we can easily target elements on the HTML.
const word1 = document.getElementById('word1');
const word2 = document.getElementById('word2');
const word3 = document.getElementById('word3');
const word4 = document.getElementById('word4');
const copybtn = document.getElementById('copybtn');
const sharebtn = document.getElementById('sharebtn');

var fullphrase = '';

// Create the arrays of words to choose from.
// NOTE: Shared links store each word's position in its array (e.g. ?w=3-12-5-20).
// Add new words to the END of an array so links people already shared keep working.
var buzzword1 = Array( //BLUE
    'fuel loads','minimums','credit hours','ACARS','LAX terminal','KMSP terminal','ASRS','jump seat','release','sink rate',
    'bids','jet bridge','INOP equipment','crew meals','reserve trips','night recurrent','GoGo™ Inflight Wifi','crew scheduling',
    'deadheads','duty times','FMS','MEL items','tail swaps','de-icing','pushback','ATIS','pitot heat','autothrottle',
    'go-around','fatigue calls','crew rest','hotel shuttle','layover','weight and balance','flight plan','TCAS RA',
    'holding pattern','ramp agent','lav service','coffee maker','cockpit door','crew bag','per diem','seniority list',
    'trip trade','CRM briefing','line check','PA announcement','oxygen mask check','APU','taxi time','block time',
    'METAR','galley cart'
);
var location_noun1 = Array( //GREY
    'the Airbus','the CRJ-900','the CRJ-200','salt lake overnight','the 737','the 737 MAX','our Hotel Van','my check ride','the simulator',
    'the A220','the E175','the 757','the 767','the 787','the A321neo','the Dash 8','the Cessna 172','the crew room',
    'the employee parking lot','the crew bus','the Denver layover','the red-eye','the ferry flight','my line check','the cargo run',
    'the training center','my commute'
);
var time = Array( //GREEN
    'last night','during my last leg','during my last 4 day trip','during my last trip','last month','while based in NY','during IOE',
    'after IOE','during captain upgrade','@ Oshkosh Airventure','@ Sun and Fun','@ JetBlue','@ Delta','@ SkyWest',
    'yesterday morning','on the red-eye','during my last commute','during reserve','over the holidays','during the ground stop',
    'during the weather delay','on my first day','on my last day before vacation','during recurrent','during the line check',
    'last Tuesday','at 3am local','during the de-ice','on the Hawaii turn','while based in ORD','while on standby','@ Spirit',
    '@ United','@ American','@ Southwest','@ Alaska','@ Republic','@ Envoy','@ FedEx','@ UPS','@ EAA','during the furlough'
);
var descriptor = Array( //YELLOW
    'really nuts','over-credited','not in-line with our mission statement','against the contract','against ALPA regulations',
    'in question by my chief pilot','questionable, at best','a bit sketchy','totally not legal','super f**ked up','enough to break guarantee',
    'a total gong show','above my pay grade','not in the FOM','a CRM nightmare','one for the ASAP report','definitely not stabilized',
    'a union grievance waiting to happen','surprisingly on time','way below minimums','pure chaos','straight out of an NTSB report',
    'an IRROPS special','beyond the duty limits','a fatigue call waiting to happen','honestly kind of fun','not briefed',
    'totally FAR 117 compliant (allegedly)','the talk of the crew room','a hard landing, emotionally','unforgivable',
    'mildly concerning','way over gross weight'
);

const wordMap = {
    'one': { array: buzzword1, element: word1 },
    'two': { array: location_noun1, element: word2 },
    'three': { array: time, element: word3 },
    'four': { array: descriptor, element: word4 },
};

// The words currently on screen, so the copied phrase always matches what's shown.
const currentWords = { one: '', two: '', three: '', four: '' };

const wordOrder = ['one', 'two', 'three', 'four'];

const buttonResetTimers = new Map();

// Load the phrase from a shared link if there is one, otherwise
// generate a phrase so the user has something to see from the start.
if (!loadPhraseFromUrl()) {
    generate_phrase();
}

// Pick a random entry from an array, avoiding "exclude" when possible so a re-roll always changes something.
function pickRandom(array, exclude) {
    if (array.length < 2) return array[0];
    let choice;
    do {
        choice = array[Math.floor(Math.random() * array.length)];
    } while (choice === exclude);
    return choice;
}

// Build the full sentence from the words currently on screen.
function buildPhrase() {
    return 'The ' + currentWords.one + ' on ' + currentWords.two + ' ' + currentWords.three + ' was ' + currentWords.four;
}

// "Generate_phrase" will create a phrase by rolling through the arrays to populate each word.
function generate_phrase() {
    console.log('♻️ Generating phrase from array pool...');
    for (const id in wordMap) {
        currentWords[id] = pickRandom(wordMap[id].array, currentWords[id]);
    }
    console.log(buildPhrase());
    render_phrase();
    replayFadeIn();
    updateUrl();
}

function rerollSingleWord(wordid) {
    const wordData = wordMap[wordid];
    if (!wordData) return;

    currentWords[wordid] = pickRandom(wordData.array, currentWords[wordid]);
    wordData.element.textContent = currentWords[wordid];
    console.log(buildPhrase());
    updateUrl();
}

// Temporarily swap a button's contents (e.g. "Copied!") and restore it after 2 seconds.
function flashButton(button, html) {
    if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
    button.innerHTML = html;
    clearTimeout(buttonResetTimers.get(button));
    buttonResetTimers.set(button, setTimeout(() => {
        button.innerHTML = button.dataset.originalHtml;
    }, 2000));
}

async function copyText() {
    try {
        await navigator.clipboard.writeText(buildPhrase());
        flashButton(copybtn, '<i class="fas fa-check"></i> Copied!');
    } catch (err) {
        console.error('Copy failed:', err);
        flashButton(copybtn, '<i class="fas fa-triangle-exclamation"></i> Copy failed');
    }
}

// Build a link that reopens this exact phrase, e.g. ".../?w=3-12-5-20".
function buildShareUrl() {
    const indexes = wordOrder.map(id => wordMap[id].array.indexOf(currentWords[id]));
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('w', indexes.join('-'));
    return url.toString();
}

// Keep the address bar in sync so copying the URL also shares the current phrase.
function updateUrl() {
    try {
        history.replaceState(null, '', buildShareUrl());
    } catch (err) {
        // Some environments (e.g. file://) block this; sharing still works via the button.
    }
}

// Read "?w=a-b-c-d" from the address bar. Returns true if a valid phrase was loaded.
function loadPhraseFromUrl() {
    const param = new URLSearchParams(window.location.search).get('w');
    if (!param) return false;

    const indexes = param.split('-').map(Number);
    if (indexes.length !== wordOrder.length) return false;

    const words = wordOrder.map((id, i) => wordMap[id].array[indexes[i]]);
    if (words.some(word => word === undefined)) return false;

    wordOrder.forEach((id, i) => { currentWords[id] = words[i]; });
    render_phrase();
    return true;
}

// Use the phone's share sheet when available; otherwise copy the link.
async function sharePhrase() {
    const url = buildShareUrl();
    const text = buildPhrase();

    if (navigator.share) {
        try {
            await navigator.share({ title: 'Pilot Speak', text, url });
            return;
        } catch (err) {
            if (err.name === 'AbortError') return; // user closed the share sheet
            console.error('Share failed, falling back to copying the link:', err);
        }
    }

    try {
        await navigator.clipboard.writeText(text + '\n' + url);
        flashButton(sharebtn, '<i class="fas fa-check"></i> Link copied!');
    } catch (err) {
        console.error('Copy link failed:', err);
        flashButton(sharebtn, '<i class="fas fa-triangle-exclamation"></i> Share failed');
    }
}

// "Render Phrase" takes the current words and updates the HTML to show them.
function render_phrase() {
    for (const id in wordMap) {
        wordMap[id].element.textContent = currentWords[id];
    }
}

// Restart the card's fade-in animation so a re-roll feels like a fresh draw.
function replayFadeIn() {
    const card = document.querySelector('.lol1');
    if (!card) return;
    card.classList.remove('lol1');
    void card.offsetWidth; // force reflow so the animation restarts
    card.classList.add('lol1');
}
