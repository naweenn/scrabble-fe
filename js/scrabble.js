const BASE_URL = "http://localhost:8080/api";
const ENDPOINT_GET_RULES = BASE_URL + "/score/rules";
const ENDPOINT_SAVE_SCORE = BASE_URL + "/score";
const ENDPOINT_GET_TOP_SCORES = BASE_URL + "/score/top-scores";

const RESPONSE_STATUS_SUCCESS = "SUCCESS";
const RESPONSE_STATUS_NO_RECORDS_FOUND = "NO_RECORDS_FOUND";

const MIN_WORD_LENGTH = 1;
const MAX_WORD_LENGTH = 10;
const STRING_SPACE = " ";

const letterInputs = document.querySelectorAll('.letter-input');
const spanScore = document.getElementById('score');
const btnResetTiles = document.getElementById('btnResetTiles');
const btnSaveScore = document.getElementById('btnSaveScore');
const btnDisplayTopScores = document.getElementById('btnDisplayTopScores');

var scoreRules;

letterInputs.forEach(input => {
    input.addEventListener("input", function () {
        validateLetterInputs(input);
        displayScore();
    });
});

// Load score rules
document.addEventListener("DOMContentLoaded", function () {
    loadScoreRules();
});

// Reset tiles
btnResetTiles.addEventListener("click", function () {
    resetTiles();
});

// Save score
btnSaveScore.addEventListener("click", function () {
    saveScore();
});

// Display top scores
btnDisplayTopScores.addEventListener("click", function () {
    displayTopScores();
});

function loadScoreRules() {
    fetch(ENDPOINT_GET_RULES)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {

            if(data.status != RESPONSE_STATUS_SUCCESS) {
                displayMessage("Error occurred!", "Please try again later!");
                return;
            }

            scoreRules = data.scoringRules;

        })
        .catch(error => {
            console.error("Fetch error:", error);
            displayMessage("Error occurred!", "Please try again later!");
        });
}

function saveScore() {
    let word = buildWord();
    if(!isValidWord(word)) {
        return;
    }

    const data = { word : buildWord() };

    const requestOptions = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }

    fetch(ENDPOINT_SAVE_SCORE, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {

            if(data.status == RESPONSE_STATUS_SUCCESS) {
                displayMessage("Score Saved Successfully!",
                    "Thank you for playing!");
                resetTiles();
            } else {
                displayMessage("Error!", data.message);
            }

        })
        .catch(error => {
            displayMessage("Error!", "Please try again later.");
            console.error('There was a problem with the fetch operation:', error);
        });
}

function displayTopScores() {

    fetch(ENDPOINT_GET_TOP_SCORES)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {

            if(data.status == RESPONSE_STATUS_NO_RECORDS_FOUND) {
                displayMessage("No saved scores to display ...",
                    "Try playing more! No saved scores to display!");
                return;
            }

            if(data.status != RESPONSE_STATUS_SUCCESS) {
                displayMessage("Error Occurred!",
                    "Unable to fetch top scores. Please try again later.");
                return;
            }

            if(data.topScores.length < 1) {
                displayMessage("No saved scores to display ...",
                    "Try playing more! No saved scores to display!");
                return;
            }

            $('#modalTopScores').modal('show');

            const topScoresTableBody = document.getElementById('topScoresTableBody');

            while (topScoresTableBody.firstChild) {
                topScoresTableBody.removeChild(topScoresTableBody.firstChild);
            }

            let rowNumber = 1;
            data.topScores.forEach(topScore => {
                const tableRow = document.createElement("tr");

                const cellScoreNumber = document.createElement("td");
                cellScoreNumber.textContent = "" + rowNumber;
                tableRow.appendChild(cellScoreNumber);

                const cellWord = document.createElement("td");
                cellWord.textContent = topScore.word;
                tableRow.appendChild(cellWord);

                const cellScore = document.createElement("td");
                cellScore.textContent = topScore.score;
                tableRow.appendChild(cellScore);

                topScoresTableBody.appendChild(tableRow);
                rowNumber++;

            });

        })
        .catch(error => {
            console.error("Fetch error:", error);
        });
}

function displayMessage(title, message) {
    $('#modalShowMessageTitle').text(title);
    $('#modalShowMessageBody').text(message);
    $('#modalShowMessage').modal('show');
}

function validateLetterInputs(input) {
    let letter = input.value;
    letter = letter.substring(0, 1);
    letter = letter.toUpperCase();
    input.value = letter;
}

function resetTiles() {
    letterInputs.forEach(letterInput => letterInput.value = '');
    spanScore.textContent = 0;
}

function displayScore() {
    spanScore.textContent = calculateScore();
}

function calculateScore() {
    let word = buildWord();

    if(!isValidWord(word)) {
        return 0;
    }

    let score = 0;
    let letters = word.split('');
    letters.forEach(letter => scoreRules.filter(scoreRule => {
        if(letter == scoreRule.letter) {
            score += scoreRule.score;
        }
    }));

    return score;
}


function buildWord() {
    let word = "";
    letterInputs.forEach(input => {
        if(input.value.length < 1) {
            word += STRING_SPACE;
        }
        word += input.value;
    });
    word = word.trim();
    word = word.toUpperCase();
    return word;
}

function isValidWord(word) {
    word = word.trim();

    if(word.length < MIN_WORD_LENGTH || word.length > MAX_WORD_LENGTH) {
        return false;
    }

    if(word.includes(STRING_SPACE)) {
        displayMessage("Error!", "Word can not contain spaces");
        return false;
    }

    return true;

}