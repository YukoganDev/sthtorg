document.addEventListener('DOMContentLoaded', (aa) => {
  const socket = io();

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
        if (qi.value === currentQuestion.answer) {
          qi.disabled = true;
          setTimeout(() => {
            check();
            qi.disabled = false;
          }, 800);
        }
      }, 0);
    }
  }

  const characters = ['.', ',', ';', ':', ' ', '*', '`'];

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
      qt.innerHTML = `Done. No bads! Returning to the learn page...`;
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
        '<p style="color: red;">Unknown or empty card. Retrying in 5 seconds...</p>';
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

  socket.on('loadTerm', ({ term }) => {
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
  });

  let i = 0;
  let imax = 3;
  let dots = '';
  let a = setInterval(() => {
    i++;
    if (i > imax) {
      i = 0;
      dots = '';
    }
    for (let j = 0; j < i; j++) {
      dots += '.';
    }
    qt.innerText = 'Waiting for card data' + dots;
  }, 300);

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

  setTimeout(() => {
    window.requestAnimationFrame(() => {
      clearInterval(a);
      parseTerms();
      nextQuestion();
      console.log('No DOM errors');
    });
  }, 1000);
});
