// DOM Selectors
const backdrop = document.querySelector('.backdrop');
const wordContainer = document.querySelector('.main__container-word');
const wrongLettersContainer = document.querySelector('.wrong-letters');
const gameScoreSpan = document.querySelector('.score-current span');
const totalScoreSpan = document.querySelector('.score-total span');
const popupContainer = document.querySelector('.popup-container');
const notification = document.querySelector('.notification-container');
const playAgainBtn = document.querySelector('.play-again');
const figureParts = document.querySelectorAll('.figure-part');
const aboutBtn = document.querySelector('.footer__btn');
const closeAboutBtn = document.querySelector('.modal__close');
const modal = document.querySelector('.modal');
const headerBtn = document.querySelector('.header__btn');
const closeHighScores = document.querySelector('.high-score-container__btn');
const highScoreCon = document.querySelector('.high-score-container');
const btn = document.querySelector('.here');
const container = document.querySelector('.keyboard-container');
const mainContainer = document.querySelector('.main__container');
const letters = document.querySelectorAll('.letter');
const main = document.querySelector('.main');
const installBtn = document.getElementById('install');
const errorPage = document.querySelector('.error');
const playBtn = document.querySelector('.play-btn');

// Service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function (err) {
      console.log(err);
    });
}

// App installation
var deferredPrompt;

window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstallprompt fired');
  if (installBtn) {
    installBtn.style.display = 'block';
  }
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

if (installBtn) {
  installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choiceResult) {
        console.log(choiceResult.outcome);
        if (choiceResult.outcome === 'dismissed') {
          console.log('User cancelled installation');
          installBtn.style.display = 'none';
        } else {
          console.log('User added to home screen');
        }
      });
      deferredPrompt = null;
    }
  });
}

// Open/close about modal
const closeModal = () => {
  if (modal.classList.contains('show')) {
    modal.classList.remove('show');
    backdrop.classList.remove('show-backdrop');
  }
};

if (aboutBtn) {
  aboutBtn.addEventListener('click', () => {
    modal.classList.add('show');
    backdrop.classList.add('show-backdrop');
  });

  closeAboutBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
}

// Open/close high scores
const closeScores = () => {
  if (highScoreCon.classList.contains('open')) {
    highScoreCon.classList.remove('open');
    backdrop.classList.remove('show-backdrop');
  }
};

if (headerBtn) {
  headerBtn.addEventListener('click', () => {
    highScoreCon.classList.add('open');
    backdrop.classList.add('show-backdrop');
    container.classList.remove('show-keyboard');
  });

  backdrop.addEventListener('click', closeScores);
  if (closeHighScores) {
    closeHighScores.addEventListener('click', closeScores);
  }
}

// Get random word
const getRandomWord = async () => {
  const res = await axios({
    method: 'GET',
    url: 'https://random-word-api.herokuapp.com/word',
  });
  return res.data[0];
};

let selectedWord = await getRandomWord();
console.log(selectedWord);

let correctLetters = [];
let wrongLetters = [];

let gameScore = 0;
let totalScore = 0;

// Set total score in local storage on first page load
if (isNaN(parseInt(localStorage.getItem('totalScore')))) {
  localStorage.setItem('totalScore', 0);
}

let gameEnd = false;

// Display word
const displayWord = async (selectedWord) => {
  // playBtn.style.display = 'none';
  // wordContainer.style.display = 'flex';
  console.log(selectedWord);
  wordContainer.innerHTML = `${selectedWord
    .split('')
    .map(
      (letter) => `
      <div class="letter">
      ${correctLetters.includes(letter) ? letter : ''}
      </div>
      `
    )
    .join('')}`;
  displayGameScore(gameScore);
  totalScore = parseInt(localStorage.getItem('totalScore'));
  displayTotalScore(totalScore);
  const innerWord = wordContainer.innerText.replace(/\n/g, '');
  // Trigger won game
  if (innerWord === selectedWord) {
    totalScore += gameScore;
    localStorage.setItem('totalScore', totalScore);
    displayWonGame(gameScore, totalScore);
    notification.classList.add('show');
    backdrop.classList.add('show-backdrop');
    container.classList.remove('show-keyboard');
    gameEnd = true;
  }
};

// Display scores
const displayGameScore = (gameScore) => {
  gameScoreSpan.innerText = gameScore;
};

const displayTotalScore = (totalScore) => {
  totalScoreSpan.innerText = totalScore;
};

// Display won game notification
const displayWonGame = (gameScore, totalScore) => {
  notification.innerHTML = `<h4> Congratulations! You've Won!</h4>
  <p> Your game score is ${gameScore}.</p>
  <p> Your total score is ${totalScore}.</p>
  <p> Click the play again botton to continue adding to your total score.</p>
  <button class='play-again' id='playAgain' title='Play Again'>Play Again</button>
  <p>Or enter you name and see if you made the top 20 high scores. <span class='warning'>Warning, this will reset you total score.</span></p>
  <form id='score-form' action='/' method='POST'>
    <label for='user'>Name:</label>
    <input id='user' name='user' type='text' required maxlength='16' >
    <input type='hidden' id='totalScore' name='totalScore' value=${totalScore}>
    <button id='submit' title='Submit'>Submit</button>
  </form>`;
};

// Lost game logic
const displayWrongLetters = (wrongLetters) => {
  wrongLettersContainer.innerHTML = `${wrongLetters
    .map(
      (letter) => `
      <div class="letter">
      ${letter},
      </div>
      `
    )
    .join('')}`;
};

const updateFigure = (wrongLetters) => {
  figureParts.forEach((part, index) => {
    if (index < wrongLetters.length) {
      part.style.display = 'block';
    } else {
      part.style.display = 'none';
    }
  });
  totalScore = parseInt(localStorage.getItem('totalScore'));
  // Trigger lost game
  if (figureParts.length === wrongLetters.length) {
    totalScore += gameScore;
    localStorage.setItem('totalScore', totalScore);
    displayLostGame(gameScore, totalScore);
    notification.classList.add('show');
    backdrop.classList.add('show-backdrop');
    container.classList.remove('show-keyboard');
    gameEnd = true;
  }
};

// Display lost game notification
const displayLostGame = (gameScore, totalScore) => {
  notification.innerHTML = `<h4> Oh Dear! You've Lost!</h4>
  <p> Your game score is ${gameScore}.</p>
  <p> Your total score is ${totalScore}.</p>
  <p> Click the play again botton to continue adding to your total score.</p>
  <button class='play-again' id='playAgain' title='Play Again'>Play Again</button>
  <p>Or enter you name and see if you made the top 20 high scores. <span class='warning'>Warning, this will reset you total score.</span></p>
  <form id='score-form' action='/' method='POST'>
    <label for='user'>Name:</label>
    <input id='user' name='user' type='text' required maxlength='16' >
    <input type='hidden' id='totalScore' name='totalScore' value=${totalScore}>
    <button id='submit' title='Submit'>Submit</button>
  </form>`;
};

// Show popup for duplicate letters
const showPopup = () => {
  popupContainer.classList.add('show');
  setTimeout(() => {
    popupContainer.classList.remove('show');
  }, 1500);
};

// Game play function
const playGame = async (letter) => {
  // Only turn game play on when endGame is false
  if (!gameEnd) {
    if (selectedWord.includes(letter)) {
      if (!correctLetters.includes(letter)) {
        correctLetters.push(letter);
        gameScore += 1;
        displayGameScore(gameScore);
        displayWord(selectedWord);
      } else {
        showPopup();
      }
    } else {
      if (!wrongLetters.includes(letter)) {
        wrongLetters.push(letter);
        gameScore -= 1;
        displayGameScore(gameScore);
        displayWrongLetters(wrongLetters);
        updateFigure(wrongLetters);
      } else {
        showPopup();
      }
    }
  }
};

// Physical keyboard event listeners
window.addEventListener('keydown', (e) => {
  if ((e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 109) {
    let letter = e.key;
    playGame(letter);
  }
});

if (notification) {
  // Play again
  notification.addEventListener('click', (e) => {
    if (e.target.id === 'playAgain') {
      backdrop.classList.remove('show-backdrop');
      notification.classList.remove('show');
      setTimeout(() => {
        location.reload();
      }, 700);
    }
  });
  // Reset total score
  notification.addEventListener('click', (e) => {
    if (e.target.id === 'submit') {
      localStorage.setItem('totalScore', '0');
    }
  });
}

// Show keyboard for touch screen devices
if (btn) {
  btn.addEventListener('click', () => {
    container.classList.toggle('show-keyboard');
  });
}

//  Virtual keyboard event listeners
if (letters) {
  letters.forEach((letter) => {
    letter.addEventListener('click', (e) => {
      let letter = e.target.innerText;
      playGame(letter);
    });
  });
}

if (main) {
  displayWord(selectedWord);
}
