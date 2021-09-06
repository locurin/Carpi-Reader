//-------------------- NAVBAR (with JQuery) --------------------------------------------->

// create consts for every app's section in the navBar
const navbarAnalyze = $('#navBar__analyze');
const navbarLogs = $('#navBar__logs');
const navbarClear = $('#navBar__clear');

// when "analizar" btn is pressed, switch to analyse section view
navbarAnalyze.on('click', () => switchView(navbarAnalyze.attr('data-view')));

//  when "ver anteriores" btn is pressed, switch to logs section view and populate the logs
navbarLogs.on('click', () => {
    switchView(navbarLogs.attr('data-view'));
    fillLogs();
});


// when "borrar historial" btn is pressed, clean local storage from browser
navbarClear.on('click', () => {
    if (confirm('¿Desea eliminar toda la información de la app del Navegador? Una vez eliminada, no podrá recuperarse.')) {
        localStorage.clear();
        location.reload();
    }
});

// hide every view in the main element, then display requested view
function switchView(view) {
    let mainSections = $('.main__section');
    for (let i = 0; i < mainSections.length; i++) {
        $(mainSections[i]).css('display', 'none');
    }
    switch (view) {
        case 'analysis':
            displayAnalysisView(view);
            break;
        case 'logs':
            displayLogView(view);
            break;
        case 'stats':
            displayStatsView(view);
            break;
    }
}

// arrange styles of analysis view, then display it
function displayAnalysisView(view) {
    arrangeAnalysisView();
    displayWelcomeMessage();
    cleanListsView();
    $('#'+view).css('display', 'flex');
}

// arrange UI for correct display of analysis view
function arrangeAnalysisView() {
    $('#page-container').css('height', '100vh'),
    $('#newUl').remove();
    $('#textCounters').css('display', 'none');
    $('#textToAnalyze').val("");
    $('#stats ol').remove();
}

// if a big screen is being used, show welcome message on analysis view
function displayWelcomeMessage() {
    if ($('body').width() > 812) {
        $('#bienvenida').css('display', 'flex');
    }
}

// hide 'stats' view and empty its content
function cleanListsView() {
    const analysisLists = $('#stats__lists');
    analysisLists.parent().css('display', 'none');
    analysisLists.prev().html("");
    analysisLists.children().each( () => $(this).html(""));
}

// retrive log from local storage, then arrange styles for log view and display it
function displayLogView(view) {
    $('#newUl').remove();
    $('#'+view).html(localStorage.getItem('log'));
    $('#'+view).css('display', 'block');
    if ($('.log_entry').length > 4) {
        $('#page-container').css('height', '100%');
    } else {
        $('#page-container').css('height', '100vh');
    }
}

// arrange styles of stats view, then display it
function displayStatsView(view) {
    const counters = $('#textCounters').html();
    arrangeStatsViewStyles(counters);
    statsViewFadeIn(view);
}

//set styles for stats view depending the type of screen (mobile or desktop)
function arrangeStatsViewStyles(counters) {
    if ($('body').width() >= 481) {         // if desktop
        let newUl = document.createElement('ul');
        newUl.innerHTML = counters;
        newUl.id = "newUl";
        $('#footer__desktop').css('display', 'none');
        $('#stats__lists').append(newUl);
    }
    if ($('body').width() < 481) {          // if mobile
        $('#stats ol').remove();
        let newUl = document.createElement('ol');
        newUl.innerHTML = counters;
        newUl.style.margin = "5% 0% 5% 20%";
        newUl.style.listStyleType = "none";
        $('#stats').prepend(newUl);
    }
}

//make stats view contents appear using Jquery animations
function statsViewFadeIn(view) {
    $('#'+view).fadeIn('fast', () => {
        $('html, body').animate({ 
            scrollTop: $('#stats').offset().top 
        }, 500),
        $('#fullText').css('display', 'flex'),
        updateFooter();
    });
    $('html, body').animate({ 
        scrollTop: $('#stats').offset().top 
    }, 500); 
}

function updateFooter() {
    if ($('body').width() > 481) {
        $('#footer__desktop').fadeIn();
    }
}

//-------------------- START A NEW TEXT ANALYSIS  -------------------------------------->

// when "Analizar" btn is pressed, trigger a new text analysis
$('#analyzeBtn').on('click', analyzeText);

// analyze a text string given by user, then display results on screen and save data in local storage
function analyzeText() {
    const newAnalysis = createAnalysisTextObject($('#textToAnalyze').val());
    updateLog(newAnalysis);
    displayDataOnScreen(newAnalysis);
    saveDataInLocalStorage(newAnalysis);
}

//-------------------- ANALYSE A STRING'S SINTAX -------------------------------------->

// return a new analysis object with numeric ID and data about the text
function createAnalysisTextObject(text) {
    let newAnalysis = new analysisObject(
        ID_COUNTER(),
        text, 
        countCharacters(text), 
        countCharactersWithSpaces(text), 
        countWords(text),
        countSentences(text), 
        countParagraphs(text),
    );
    newAnalysis.charStats = getStringStats(text, newAnalysis.characters, 'chars');
    newAnalysis.wordStats = getStringStats(text, newAnalysis.words, 'words');
    return newAnalysis;
}

// create an object which holds all important data about a text's analysis requested by user
function analysisObject (id, text, characters, charactersWithSpaces, words, sentences, paragraphs, charStats, wordStats) {
    this.id = id;
    this.text = text;
    this.characters = characters;
    this.charactersWithSpaces = charactersWithSpaces;
    this.words = words;
    this.sentences = sentences;
    this.paragraphs = paragraphs;
    this.charStats = charStats;
    this.wordStats = wordStats;
}

// set ID for analysis object. If data saved in localStorage, keep counting from it, else start from 1
var ID_COUNTER = () => {
    let currentID = localStorage.getItem('ID_COUNTER');
    if (currentID) {
        return ++currentID;
    }
    return 1;
}

// return total amount of characters in a string without whitespaces and line feeds
function countCharacters(text) {
    text = text.replace(/\n/g, "");
    text = text.replace(/ /g, "");
    return text.length;
}

// return total amount of characters in a string including whitespaces and line feeds
function countCharactersWithSpaces(text) {
    text = text.replace(/\n+/g, "");
    text = text.replace(/  +/g, " ");
    return text.length;
}

//  return total amount of words in a string
function countWords(text) {
    return text.match(/(\w+)/g).length;
}

// return total amount of sentences in a string
function countSentences(text) {
    const endOfSentence = /[.!?]+\s+[A-Z¡¿0-9"'$€¥£({[#@<%\\\/]/;
    text = text.split(endOfSentence);
    return text.length;
}

// return total amount of paragraphs in a string
function countParagraphs(text) {
    text = text.replace(/\n+/g, "\n");
    text = text.split(/\n/);
    return text.length;
}

// return a sorted array of objects with data about words usage in a string
function getStringStats(text, total, parseType) {
    let stringArray = [];
    let statsObjectsArray = [];
    parseType === 'words' ? splitter = ' ' : splitter = '';
    text = textFormat(text, parseType);
    text.split(splitter).forEach(string => {
        if (!stringArray.includes(string)) {
            let statsObject = newStatsObject(text, string, total);
            if (string != '') {
                statsObjectsArray.push(statsObject);
            }
        }
        stringArray.push(string);
    })
    return sortObjectsArray(statsObjectsArray, parseType);
}

// return a different string format depending on if the string is a word or a character
function textFormat(text, parseType) {
    if (parseType === 'words') {
        text = text.replace(/\n+/g, " ");
        text = text.replace(/  +/g, " ");
        return text.replace(/[^a-zA-Z0-9ÁáÄäéÉéËëÍíÏïÓóÖöÚúÜüÇçñÑ ]/g, "").toLowerCase();
    } else {
        text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return text.replace(/[^0-9a-zÁáÄäéÉéËëÍíÏïÓóÖöÚúÜüÇçñÑ]/gi, '').toUpperCase();
    } 
}

// get amount of occurences of a word/character, calculate its percentage and return it in an object
function newStatsObject(text, string, total) {
    const occurences = text.split(string).length - 1;
    const percentage = ((occurences / total) * 100).toFixed(2); 
    return {name: string, occurences:occurences, percentage: percentage};
}

// if string is a word, sort from more usages to less, if is a char sort alphabetically
function sortObjectsArray(array, parseType) {
    if (parseType === 'words') {
        return array.sort((a, b) => b.occurences - a.occurences);
    }
    return array.sort((a, b) => a.name.localeCompare(b.name));
}

//-------------------- UPDATE DOM WITH DATA FROM THE NEW ANALYSIS -------------------------------------->

// display analysis's results on DOM
function displayDataOnScreen(analysis) {
    $('#stats__title').html(`Análisis #${analysis.id} - Resultados`);
    createTextCountersElement(analysis);
    createStatsElements(analysis.wordStats, 'textWordStats');
    createStatsElements(analysis.charStats, 'textCharStats');
    arrangeDataStyles(analysis.text);
}

// populate template of analytics and display it on DOM
function createTextCountersElement(analysis) {
    const template = `<h3><b>CONTADORES:</b></h3>
                        <li><b>Párrafos</b>: &nbsp&nbsp&nbsp<span class="badge rounded-pill bg-secondary">${analysis.paragraphs}</span></li>
                        <li><b>Oraciones</b>: <span class="badge rounded-pill bg-secondary">${analysis.sentences}</span></li>
                        <li><b>Palabras</b>: &nbsp&nbsp&nbsp<span class="badge rounded-pill bg-secondary">${analysis.words}</span></li>
                        <li><b>Caracteres</b>: <span class="badge rounded-pill bg-secondary">${analysis.characters}</span></li>
                        <li><b>Caracteres con espacios</b>: <span class="badge rounded-pill bg-secondary">${analysis.charactersWithSpaces}</span></li>`;
    $('#textCounters').html(template);
}

// populate stats lists and display them on DOM
function createStatsElements(stats, id) {
    const statsList = document.getElementById(id);
    if (id === 'textWordStats') {
        statsList.innerHTML = '<h3><b>Uso de palabras:</b></h3>';
    } else {
        statsList.innerHTML = '<h3><b>Uso de caracteres:</b></h3>';
    }
    let newDiv = statsList.appendChild(document.createElement('div'));
    newDiv.id = "newDiv";
    populateStatsList(stats, id, newDiv);
}

// populate stats list with correct data
function populateStatsList(stats, id, newDiv) {
    for (let stat in stats) {
        setCharListStyles(stat, id, newDiv);
        let listElement = document.createElement('li');
        listElement.innerHTML = `<b>${stats[stat].name} &nbsp;<img src="images/flecha.png" alt="flecha apuntando a la derecha"></b>&nbsp; ${stats[stat].occurences} 
        <b> veces (%${stats[stat].percentage})</b>`;
        hideLessUsedWords(stat, id, listElement);
        newDiv.appendChild(listElement);
    }
}

// arrange characters list height depending on the amount received, then append a 'see less' button
function setCharListStyles(stat, id, newDiv) {
    if (stats.length <= 12) {
        $('#textCharStats #newDiv').css('height', 'auto');
    } else {
        $('#textCharStats #newDiv').css('height', '330px');
    }
    if (stat === '13' && id === 'textWordStats') {
        appendSeeAllBtn(newDiv);
    }
}

// after ten elements are displayed, create a "ver todos" button
function appendSeeAllBtn(statsList) {
    const seeAllBtn = document.createElement('button');
    seeAllBtn.innerHTML = 'Ver todas';
    seeAllBtn.classList.add("btn");
    seeAllBtn.classList.add("btn-success");
    seeAllBtn.classList.add("btn-sm");
    seeAllBtn.id = "seeAllBtn";
    seeAllBtn.style.margin = "5% auto 5% 25%";
    statsList.append(seeAllBtn);
}

// after 13 words have been displayed on the list, set display none for the rest of them
function hideLessUsedWords(stat, id, listElement) {
    if (parseInt(stat) > 12 && id === 'textWordStats') {
        listElement.style.display = 'none';
        listElement.classList.add("hiddenElement");
    }
}

// when 'ver todas' button is clicked, call showAllWords function
$("#textWordStats").on('click','#seeAllBtn', () => showAllWords() );

// create a "Ver menos" button and display every hidden word in the word analysis list
function showAllWords() {
    const elements = $(".hiddenElement");
    $("#seeAllBtn").remove();
    createSeeLessButton();
    for (let element in elements) {
        elements[element].style.display = 'list-item';
    }  
}

// create a "Ver menos" button 
function createSeeLessButton() {
    let seeLessBtn = document.createElement('button');
    seeLessBtn.innerHTML = "Ver menos";
    seeLessBtn.classList.add("btn");
    seeLessBtn.classList.add("btn-success")
    seeLessBtn.style.margin = "5% 20% 5% 20%";
    seeLessBtn.classList.add("btn-sm");
    seeLessBtn.id = "seeLessBtn";
    $("#textWordStats").append(seeLessBtn);
}

// when 'ver menos' button is clicked, call hideAllWords function
$("#textWordStats").on('click','#seeLessBtn', () => hideAllWords() );


// hides every word of the word analysis list excepting the 13 most used
function hideAllWords() {
    const elements = document.getElementsByClassName("hiddenElement");
    $("#seeLessBtn").remove();
    appendSeeAllBtn($('#newDiv'));
    for (let element in elements) {
        elements[element].style.display = 'none';
    }
}

// arrange styles to display new analysis data
function arrangeDataStyles(text) {
    $('#fullText__textarea').val(text);
    $('#bienvenida').css('display', 'none');
    $('#page-container').css('height', '100%');
    $('#textCounters').css('display', 'flex');
    $("#stats").slideDown(); 
}

// -------------------  UPDATE LOG VIEW AND STORAGE ----------------------------------------->

// update log view by preppending a new element with the data
function updateLog(entry) {
    const newDiv = document.createElement('div');
    newDiv.innerHTML = logEntryTemplate(entry);
    $('#logs__list').prepend(newDiv);
}

// populate a template for a log entry
function logEntryTemplate(entry) {
    return `<div class='log_entry'><h3><b>Entrada #${entry.id}:</b></h3>
    <li><b>Texto</b>: ${entry.text.substring(0, 20)}...</li>
    <li><b>Caracteres</b>: ${entry.characters}</li>
    <li><b>Palabras</b>: ${entry.words}</li>
    <li><b>Fecha</b>: ${timestamp()}</li>
    <div id="btnContainer"><button class="btn btn-secondary btn-sm log__btn" data-entryid='${entry.id}'>Ver todo</button></div></div>`;
}

// retun current date with format dd/mm/yy 
function timestamp() {
    const time = new Date().toISOString();
    return `${time.slice(8,10)}/${time.slice(5,7)}/${time.slice(2,4)}`;
}

// save log entry in local storage for future access
function saveDataInLocalStorage(entry) {
    localStorage.setItem('ID_COUNTER', ID_COUNTER());
    localStorage.setItem('log', $('#logs').html());
    localStorage.setItem(`entryN°${entry.id}`, JSON.stringify(entry));
}

// -------------------  DISPLAY A PREVIOUS ANALYSIS LOCALLY STORAGED ----------------------------------------->

// get every instance of "ver todo" btn, when one is clicked, display its storage data
function fillLogs() {
    document.querySelectorAll('.log__btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $('#page-container').css('height', '100%'),
            displayEntryData(btn.dataset.entryid);
            }
        );
    });
}

// display data from an previous locally storaged log entry
function displayEntryData(entryid) {
    const entry = JSON.parse(localStorage.getItem(`entryN°${entryid}`));
    displayDataOnScreen(entry);
    switchView('stats');
}

// when "copiar" button is clicked, trigger copyText function
$('#fullText__btn').on('click', copyText);

// copy text from old log entry to clipboard and display an alert
function copyText() {
    const text = $('#fullText__textarea');
    text.select();
    document.execCommand("copy");
    $('#fullText__alert').css('opacity', '1');
    setTimeout( () => {$('#fullText__alert').css('opacity', '0')}, 700);
}
