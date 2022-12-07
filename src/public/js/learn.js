const socket = io();

const loginBtn = document.querySelector('#login-btn');

let user = document.getElementById('user').dataset.user;
console.log(`Logged in as ${user}`);
if (user) {
  loginBtn.innerHTML = `Logout (${user})`;
  loginBtn.href = '/logout';
} else {
  loginBtn.innerHTML = `Login`;
}

document.getElementById('start-btn').onclick = () => {
  loadCards();
};

function loadCards() {
  socket.emit('requestCards');
  setLoadingScreen(true, 'Loading cards...');
}

socket.on('doneLoadingCards', () => {
  setLoadingScreen(false, null);
});

socket.on('doneLoadingTerms', () => {
  setLoadingScreen(false, null);
});

const renameCard = (el) => {
  console.log(el.target);
};

const addLoadingCard = (el) => {
  let card = createCard({
    name: '<div class="loader mt-1 mb-2"></div><p class="small text-muted m-0 mb-1">Validating card...</p>',
    buttonActions: (id) => {},
    extraButtonActions: (id) => {},
  });
  card.querySelector('button').parentNode.remove();
};

document.querySelector('.create-btn').onclick = () => {
  createCard({
    name: 'Name this card...',
    nameEditable: true,
    buttonName: 'Cancel',
    extraButtonName: 'Save',
    buttonType: 'danger',
    extraButtonType: 'success',
    space: true,
    buttonActions: (id) => {
      document.getElementById(id).remove();
    },
    extraButtonActions: (id) => {
      console.log(
        document.getElementById(id).querySelector('.card-text').innerText
      );
      sendPkt('saveCard', {
        name: document.getElementById(id).querySelector('.card-text').innerText,
      });
      addLoadingCard();
      document.getElementById(id).remove();
    },
  });
};

function cancel(el, id) {
  if (id) {
    document.getElementById(id).remove();
    return;
  }
  el.remove();
}

function sendPkt(pktName, pkt) {
  socket.emit(pktName, pkt);
}

function generateId(length) {
  var result = '';
  var characters =
    'A-B-C-D-E-F-G-H-I-J-K-L-M-N-O-P-Q-R-S-T-U-V-W-X-Y-Z-a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function createCard({
  name,
  buttonName = '<span class="material-symbols-outlined gicon-btn"> school </span>',
  extraButtonName = '<span class="material-symbols-outlined gicon-btn"> edit </span>',
  buttonType = 'secondary',
  extraButtonType = 'secondary',
  space = false,
  nameEditable = false,
  buttonActions = null,
  extraButtonActions = null,
  card = null,
}) {
  let btnGroup = 'btn-group';
  if (space) {
    btnGroup = '';
  }
  let extraNameProps = '';
  if (nameEditable) {
    extraNameProps = 'contentEditable = "true" style="background-color: #CCC;"';
  }
  console.log(card);
  let id = generateId(10);

  let buttonAction = ``;
  if (buttonActions) {
    buttonAction = `(${buttonActions})('${id}');`;
  } else {
    buttonAction = `learn(${card.id});`;
  }
  let extraButtonAction = ``;
  if (extraButtonActions) {
    extraButtonAction = `(${extraButtonActions})('${id}');`;
  } else {
    extraButtonAction = `edit(${card.id});`;
  }

  console.log(id);
  let el = `
        <div class="col" id="${id}">
                <div class="card shadow-sm text-bg-light">
                  <div class="card-body align-items-center">
                    <p class="card-text loader-parent ${id}" ${extraNameProps}>
                      ${name}
                      
                    </p>
                    
                    <div
                      class="justify-content-between align-items-center"
                    >
                      <div class="${btnGroup} align-self-end align-items-center">
                        <button
                          type="button"
                          onclick="${buttonAction}"
                          class="btn btn-sm btn-outline-${buttonType}"
                        >
                          ${buttonName}
                        </button>
                        <button
                          type="button"
                          onclick="${extraButtonAction}"
                          class="btn btn-sm btn-outline-${extraButtonType}"
                        >
                          ${extraButtonName}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          `;
  document.querySelector('.cards').insertAdjacentHTML('beforeend', el);

  if (nameEditable) {
    let node = document.querySelector(`.${id.toString()}`);
    node.focus();
    selectText(node);
  }
  return document.getElementById(id);
}

let currentCardId;
socket.on('loadCard', ({ card }) => {
  createCard({ name: card.name, card });
});

function setCardId(id) {
  if (typeof id === 'number') {
    currentCardId = id;
    return;
  }
  console.error(id, 'is not a number');
}
function getCardId() {
  return currentCardId;
}

function edit(cardId) {
  setCardId(cardId);
  console.log('edit');
  socket.emit('requestTerms', { cardId });
  setLoadingScreen(true, 'Loading terms...');
}
function setLoadingScreen(on, title) {
  if (on) {
    document.querySelector('.info-div').hidden = false;
    document.querySelector('.learn-div').hidden = true;
    document.querySelector(
      '#start-btn'
    ).innerHTML = `<div class="loader mt-1 mb-2"></div><p class="small text-muted m-0 mb-1">${title}</p>`;
    return;
  }
  document.querySelector('.info-div').hidden = true;
  document.querySelector('.learn-div').hidden = false;
}

socket.on('doneLoadingTerms', () => {
  document.querySelector('.info-div').hidden = true;
  document.querySelector('.learn-div').hidden = false;
  document.querySelector('#terms').hidden = false;
  document.querySelector('.cards').hidden = true;
});

function learn(cardId) {
  console.log('Opening card...');
  window.location.href = '/card/' + cardId;
}

socket.on('loadTerm', ({ term }) => {
  console.log('Got', term);
  createTerm(term);
});

function selectText(node) {
  let finalNode = node;
  if (!node) {
    finalNode = document.getElementById('empty');
  }
  if (document.body.createTextRange) {
    const range = document.body.createTextRange();
    range.moveToElementText(finalNode);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(finalNode);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    console.warn('Could not select text: Unsupported browser');
  }
}

document.querySelector('#create-term-btn').onclick = () => {
  if (getCardId()) {
    setLoadingScreen(true, 'Waiting for server...');
    sendPkt('saveTerm', {
      term: 'hello',
      definition: 'bonjour',
      cardId: getCardId(),
    });
  } else {
    console.error('Error while saving term');
  }
};

document.querySelector('#delete-card-btn').onclick = (el) => {
  if (window.confirm('Are you sure? The card will be removed forever')) {
    setLoadingScreen(true, 'Removing card...');
    sendPkt('removeCard', {
      cardId: getCardId(),
    });
  }
};

document.querySelector('#rename-card-btn').onclick = (el) => {
  document.querySelector('#cardRenameField').hidden = false;
  setTimeout(() => {
    document.querySelector('#cardRenameField').style.opacity = 1;
    document.querySelector('#cardRenameField').focus();
  }, 1);
};

function cardRenameFieldTyping(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    setLoadingScreen(true, 'Saving card...');
    document.querySelector('#cardRenameField').style.opacity = 0;
    let text = document.querySelector('#cardRenameField').value;
    document.querySelector('#cardRenameField').value = 'Saving...';
    setTimeout(() => {
      document.querySelector('#cardRenameField').hidden = true;
      sendPkt('renameCard', { cardId: getCardId(), name: text });
    }, 300);
  }
}

socket.on('reloadCards', () => {
  window.location.href = 'learn';
});

function removeTerm(el) {
  if (window.confirm('Are you sure? This term will be removed forever')) {
    let mainEl = el.parentNode;
    mainEl.style.animation = 'error-and-delete 1s ease 1';
    socket.emit('removeTerm', {
      termId: parseInt(mainEl.querySelector('#termDiv').dataset.termid),
      cardId: parseInt(mainEl.querySelector('#termDiv').dataset.cardid),
    });
    setTimeout(() => {
      mainEl.remove();
    }, 1000);
  }
}

function updateTerm(el) {
  setLoadingScreen(true, 'Waiting for server...');
  sendPkt('updateTerm', { el });
}

function createTerm({ term, definition, cardId, id, star }) {
  let starIconStr = 'toggle_off';
  let starColor = '';
  if (star) {
    starIconStr = 'toggle_on';
    starColor = 'rgb(243, 179, 16)';
  }
  let el = `
        <a
              href="#"
              class="list-group-item list-group-item-action d-flex gap-3 py-3 item fullwidth termItem"
              aria-current="true"
            >
              <div class="d-flex gap-2 w-100 btn-group justify-content-between fullwidth">
                <div style="word-wrap: break-word;" id="termDiv" data-cardId="${cardId}" data-termId="${id}">
                  <p class="mb-1 term" onfocus="selectText(this);" onkeypress="preventEnter(event);">
                    ${term}
                  </p>
                  <hr />
                  <p class="mb-0 opacity-75 definition" onfocus="selectText(this);" onkeypress="preventEnter(event);">
                    ${definition}
                  </p>
                </div>
              <div>
                <div class="btn-group-stht">
                  <button class="edit-btn gicon-btn" onclick="editTerm(this.parentNode);">
                    <span class="material-symbols-outlined edit">
                      edit
                    </span>
                  </button>
                  <button class="delete-btn gicon-btn">
                    <span class="material-symbols-outlined delete" onclick="removeTerm(this.parentNode.parentNode.parentNode.parentNode);">delete</span>
                  </button>
                  <button class="star-btn gicon-btn">
                    <span class="material-symbols-outlined star" style="color: ${starColor};" onclick="starTerm(this.parentNode.parentNode.parentNode.parentNode.parentNode);">${starIconStr}</span>
                  </button>
                  </div>
                </div>
              </div>
            </a>
        `;
  document.querySelector('.terms').insertAdjacentHTML('beforeend', el);
  return { term, definition, cardId, id, star };
}

function starTerm(el) {
  console.log(el);
  let starSpan = el.querySelector('.star');
  if (starSpan.innerHTML === 'toggle_off') {
    sendPkt('starTerm', {
      id: parseInt(el.querySelector('#termDiv').dataset.termid),
    });
    starSpan.innerHTML = 'toggle_on';
    starSpan.style.color = 'rgb(243, 179, 16)';
    return;
  }
  sendPkt('unstarTerm', {
    id: parseInt(el.querySelector('#termDiv').dataset.termid),
  });
  starSpan.innerHTML = 'toggle_off';
  starSpan.style.color = '';
}

socket.on('error', (msg) => {
  alert(msg);
});

// const editCard = (el) => {
//   let cardDiv =
// };

const editTerm = (el) => {
  let mainElement = el.parentNode.parentNode.parentNode;
  let termDiv = mainElement.querySelector('#termDiv');
  if (el.querySelector('span').innerText === 'done') {
    sendPkt('updateTerm', {
      cardId: parseInt(termDiv.dataset.cardid),
      term: el.parentNode.parentNode.querySelector('.term').innerText,
      definition:
        el.parentNode.parentNode.querySelector('.definition').innerText,
      termId: parseInt(termDiv.dataset.termid),
    });
    mainElement.style.animation = 'success 1s ease 1';
    termDiv.querySelectorAll('p').forEach((cn) => {
      cn.contentEditable = false;
      cn.style = '';
      selectText(null);
    });
    el.querySelector('span').innerText = 'edit';
    return;
  }
  termDiv.querySelectorAll('p')[0].focus();
  mainElement.style.animation = '';
  termDiv.querySelectorAll('p').forEach((cn) => {
    cn.contentEditable = true;
    cn.style = 'background-color: #CCC; padding: 3px;';
  });
  el.querySelector('span').innerText = 'done';
};

// Utils
function preventEnter(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
}

// Fast load

// const urlSearchParams = new URLSearchParams(window.location.search);
// const params = Object.fromEntries(urlSearchParams.entries());
// if (params && params.fastload === '1') {
//   loadCards();
// }
loadCards();
