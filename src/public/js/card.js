document.addEventListener('DOMContentLoaded', (aa) => {
  const socket = io();

socket.emit('getPreferences');
function parsePreference(preference, value) {
  if (preference === 'scale') {
    if (value === 0) {
      return 0.9;
    }
    if (value === 1) {
      return 1;
    }
    if (value === 2) {
      return 1.1;
    }
    if (value === 3) {
      return 1.2;
    }
    if (value === 4) {
      return 1.3;
    }
    if (value === 5) {
      return 1.4;
    }
    return 1;
  }
  if (preference === 'theme') {
    if (value === 0) {
      return 'warning';
    }
    if (value === 1) {
      return 'light';
    }
    if (value === 2) {
      return 'dark';
    }
    return 'dark';
  }
  return null;
}

let zoom = 1;
let width = 100;
let height = 100;
let themeColor = 'dark';
let themeBgColor = 'light';
socket.on('loadPreferences', (preferences) => {
  zoom = parsePreference('scale', preferences.scale);
  width = 100 / zoom;
  height = 100 / zoom;

  document.body.style.transformOrigin = 'left top';
  document.body.style.transform = 'scale(' + zoom + ')';
  document.body.style.width = width + '%';
  document.body.style.maxHeight = height + '%';

  themeColor = parsePreference('theme', preferences.theme);
  document.body.classList.add('text-bg-' + themeColor);
  if (themeColor === 'light') {
    themeBgColor = 'white';
  }
});

  const qc = document.querySelector('#qc');
  const qt = qc.querySelector('#qq');
  const qf = qc.querySelector('#qf');
  const qb = document.querySelector('#qb');
  const qi = document.querySelector('#qi');
  const sb = document.querySelector('#sb');

  const inputChangeAnimationTime = 30;

  let questions = [];
  let questionsToGo = [];
  let currentQuestion = null;
  let round = 1;
  let ended = false;

  let canContinue = true;

  qi.onkeypress = (event) => {
    checkIfWrong();
    if (event.key === 'Enter') {
      event.preventDefault();
      check();
    }
  };

  qb.onclick = () => {
    check();
  };

  let canUpdateText = true;
  sb.onclick = () => {
    navigator.clipboard.writeText(window.location.href);
    if (canUpdateText) {
      canUpdateText = false;
      let prevHTML = sb.innerHTML;
      sb.innerText = 'Copied to clipboard!';
      setTimeout(() => {
        sb.innerHTML = prevHTML;
        canUpdateText = true;
      }, 3000);
    }
  };

  if (window.chrome) {
    console.log('%cChromium browser detected', 'color: green;');
  }

  const characters = ['.', ',', ';', ':', ' ', '*', '`'];

  function checkIfWrong() {
    if (ended) {
      ended = false;
      nextQuestion(true);
    }
    if (!canContinue) {
      setTimeout(() => {
        if (!currentQuestion) {
          check();
          return;
        }
        let val = qi.value.toString().toLowerCase();
        let ans = currentQuestion.answer.toString().toLowerCase();
        let correct = false;
        for (let char of characters) {
          val = val.replace(char, '');
          ans = ans.replace(char, '');
        }
        if (val === ans) {
          correct = true;
        }
        if (correct) {
          qi.disabled = true;
          qi.classList.add('disabled');
          setTimeout(() => {
            check();
            qi.disabled = false;
            qi.classList.remove('disabled');
          }, 800);
        }
      }, 0);
    }
  }

  function check() {
    qi.style.animation = '';
    if (!currentQuestion) {
      nextQuestion();
      return;
    }
    let val = qi.value.toString().toLowerCase();
    let ans = currentQuestion.answer.toString().toLowerCase();
    let correct = false;
    for (let char of characters) {
      val = val.replace(char, '');
      ans = ans.replace(char, '');
    }
    if (val === ans) {
      correct = true;
    }
    if (correct) {
      qf.innerHTML = 'Correct';
      canContinue = true;
      qi.classList.remove('incorrect');
      qi.classList.add('correct');
      qi.style.animation = 'resetScale .3s ease-out 1';
      setTimeout(() => {
        qi.style.animation = '';
        qi.classList.remove('correct');
      }, 300);
      qt.innerHTML += '<br />';
      if (questionsToGo.length <= 0) {
        console.log('ending...');
        end();
        return;
      }
    } else {
      qf.innerHTML = 'Oops!';
      canContinue = false;
      qi.classList.remove('correct');
      qi.classList.add('incorrect');
      qt.innerHTML = `Type: <br />\'<b>${currentQuestion.answer}</b>\'`;
      let q = questions.find((cq) => cq.id === currentQuestion.id);
      if (q) {
        q.wrong = true;
        console.log(questions, 'addsad');
      }
    }
    if (shouldContinue()) {
      nextQuestion();
    } else {
      qi.style.animation = 'shake .5s ease 1';
      currentQuestion.wrong = true;
    }

    setTimeout(() => {
      qi.select();
    }, 0);
  }

  function end() {
    ended = true;
    canContinue = false;
    let count = 0;
    let newQs = [];
    for (let q of questions) {
      if (q.wrong) {
        count++;
        q.wrong = false;
        newQs.push(q);
        questions.push(q);
        questionsToGo.push(q);
      }
    }
    console.log(questions);
    qf.innerHTML = `<br />`;
    qi.value = '';
    if (newQs.length <= 0) {
      qt.innerHTML =
        '<div class="loader mt-1 mb-2 text-danger"></div><p class="small text-muted m-0 mb-1">Done. No bads! Returning to the learn page...</p>';
      qi.disabled = true;
      setTimeout(() => {
        if (
          !document.querySelector('#user').dataset.user ||
          document.querySelector('#user').dataset.user === ''
        ) {
          qt.innerHTML = `Returning failed; you are logged in as a guest`;
          return;
        }

        window.location.href = '/learn';
      }, 2000);
    } else {
      qt.innerHTML = `Round <b>${round}</b> complete, made <b>${count}</b> bads. Press any key to continue`;
      // questions = newQs;
      // questionsToGo = newQs;
      currentQuestion = null;
      round++;
      canContinue = true;
      setTimeout(() => {
        qi.select();
      }, 0);
      //nextQuestion();
    }
    console.log(newQs, '-> New array');
  }
  function shouldContinue() {
    return canContinue;
  }

  function nextQuestion(reset) {
    if (reset) {
      canContinue = false;
      setTimeout(() => {
        canContinue = true;
      }, 0);
    }
    if (!canContinue) {
      return;
    }
    console.log(questionsToGo, questionsToGo.length);
    let random = Math.floor(Math.random() * (questionsToGo.length - 1));
    currentQuestion = questionsToGo[random];
    console.log(currentQuestion);
    if (!questions[0]) {
      qt.innerHTML =
        '<div class="loader mt-1 mb-3 text-danger"></div><p class="small text-muted m-0 mb-1">Unknown or empty card. Retrying in 5 seconds...</p>';
      setTimeout(() => {
        window.location.reload();
      }, 5000);
      return;
    }
    qt.innerText = currentQuestion.text;
    questionsToGo.splice(random, 1);
  }
  console.log(parseInt(document.getElementById('cardid').dataset.cardid));
  socket.emit('requestTerms', {
    cardId: parseInt(document.getElementById('cardid').dataset.cardid),
  });

  // socket.on('loadTerm', ({ term, percentage }) => {
  //   qt.querySelector('p').innerHTML = `<p class="small text-muted m-0 mb-1">Loading card (${percentage.toFixed(1)}%)...</p>`;
  //   console.log('Got', term);
  //   questions.push({
  //     text: term.term,
  //     answer: term.definition,
  //     id: term.id,
  //     starred: term.star,
  //     wrong: false,
  //   });
  //   questionsToGo.push({
  //     text: term.term,
  //     answer: term.definition,
  //     id: term.id,
  //     starred: term.star,
  //     wrong: false,
  //   });
  // });

  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  socket.on('loadTerms', async ({ terms }) => {
    qt.querySelector(
      'p'
    ).innerHTML = `<p class="small text-muted m-0 mb-1">Extracting terms...</p>`;
    //console.log('Got', term);
    for (let i = 0; i < terms.length; i++) {
      await timeout();
      let term = terms[i];

      console.log('Got', term);
      questions.push({
        text: term.term,
        answer: term.definition,
        id: term.id,
        starred: term.star,
        wrong: false,
      });
      questionsToGo.push({
        text: term.term,
        answer: term.definition,
        id: term.id,
        starred: term.star,
        wrong: false,
      });
    }
    qt.innerHTML =
      '<div class="loader mt-1 mb-3 text-danger"></div><p class="small text-muted m-0 mb-1">Validating...</p>';
    window.requestAnimationFrame(() => {
      console.log('%cLoaded all terms', 'color: yellow;');
      parseTerms();
      nextQuestion();
      console.log('%cNo DOM errors', 'color: green;');
    });
  });

  qt.innerHTML =
    '<div class="loader mt-1 mb-3 text-danger"></div><p class="small text-muted m-0 mb-1">Waiting for server...</p>';

  function parseTerms() {
    let starredArr = [];
    for (let q of questions) {
      if (q.starred) {
        starredArr.push(q);
      }
    }
    console.log(starredArr);
    if (starredArr.length > 0) {
      questions = [];
      questionsToGo = [];
      for (let q of starredArr) {
        questions.push(q);
        questionsToGo.push(q);
      }
    }
  }

  socket.on('doneLoadingTerms', () => {
    qt.innerHTML =
      '<div class="loader mt-1 mb-3 text-danger"></div><p class="small text-muted m-0 mb-1">Validating...</p>';
    setTimeout(() => {
      window.requestAnimationFrame(() => {
        console.log('%cLoaded all terms', 'color: yellow;');
        parseTerms();
        nextQuestion();
        console.log('%cNo DOM errors', 'color: green;');
      });
    }, 200);
  });
});
