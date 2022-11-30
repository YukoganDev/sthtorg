// Socket
const socket = io();

const loginBtn = document.querySelector('#login-btn');
let user = '<%=user%>';
console.log(`Logged in as ${user}`);
if (user) {
  loginBtn.innerHTML = `Logout (${user})`;
  loginBtn.href = '/logout';
} else {
  loginBtn.innerHTML = `Login`;
}

document.getElementById('start-btn').onclick = () => {
  document.querySelector('#start-btn').innerHTML =
    '<span class="material-symbols-outlined"> cached </span>';
  setTimeout(() => {
    document.querySelector('.info-div').hidden = true;
    document.querySelector('.learn-div').hidden = false;
  }, 500);
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
        name: document.getElementById(id).querySelector('.card-text')
          .innerText,
      });
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

function sendPkt(eventName, pkt) {
  socket.emit(eventName, pkt);
}

// function edit(el) {
//   console.log(el);
//   if (el.contentEditable) {
//     el.contentEditable = true;
//   }
//   el.onkeypress = (event) => {
//     if (event.key === 'Enter') {
//       event.preventDefault();
//       el.contentEditable = false;
//     }
//   };
// }

function generateId(length) {
  var result = '';
  var characters =
    'A-B-C-D-E-F-G-H-I-J-K-L-M-N-O-P-Q-R-S-T-U-V-W-X-Y-Z-a-b-c-d-e-f-g-h-i-j-k-l-m-n-o-p-q-r-s-t-u-v-w-x-y-z';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  return result;
}

function createCard({
  name,
  buttonName = 'Learn',
  extraButtonName = 'Edit',
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
    extraNameProps =
      'contentEditable = "true" style="background-color: #292d31;"';
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
          <div class="card shadow-sm bg-light">
            <div class="card-body align-items-center">
              <p class="card-text ${id}" ${extraNameProps}>
                ${name}
              </p>
              <div
                class="justify-content-between align-items-center"
              >
                <div class="${btnGroup} align-self-end">
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
  document.querySelector('#terms').hidden = false;
  document.querySelector('.cards').hidden = true;
}

function learn(cardId) {
  setCardId(cardId);
  console.log('learn');
  // socket.emit('requestTerms', { cardId: card.id });
  // document.querySelector('#terms').hidden = false;
  // document.querySelector('.cards').hidden = true;
}

socket.on('loadTerm', ({ term }) => {
  console.log('Got', term);
  createTerm({ term: term.term, definition: term.definition });
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
    // let term = createTerm({
    //   term: 'hello',
    //   definition: 'bonjour',
    // });
    sendPkt('saveTerm', {
      term: 'hello',
      definition: 'bonjour',
      cardId: getCardId(),
    });
  } else {
    console.error('Error while saving term');
  }
};

function removeTerm(el) {
  el.style.animation = 'error-and-delete 1s ease 1';
  socket.emit('removeTerm', {
    term: el.querySelector('.term').innerText,
    definition: el.querySelector('.definition').innerText,
    cardId: getCardId(),
  });
  setTimeout(() => {
    el.remove(el);
  }, 1000);
}

function updateTerm(el) {}

function createTerm({ term, definition }) {
  let el = `
  <a
        href="#"
        class="list-group-item list-group-item-action d-flex gap-3 py-3 item fullwidth termItem"
        aria-current="true"
      >
        <div class="d-flex gap-2 w-100 justify-content-between fullwidth">
          <div style="word-wrap: break-word;" id="termDiv">
            <p class="mb-1 term" onfocus="selectText(this);" onkeypress="preventEnter(event);">
              ${term}
            </p>
            <hr />
            <p class="mb-0 opacity-75 definition" onfocus="selectText(this);" onkeypress="preventEnter(event);">
              ${definition}
            </p>
          </div>
        <div>
          <button class="edit-btn" onclick="editTerm(this.parentNode);">
            <span class="material-symbols-outlined edit">
              edit
            </span>
          </button>
          <button class="delete-btn">
            <span class="material-symbols-outlined delete" onclick="removeTerm(this.parentNode.parentNode.parentNode.parentNode);"> delete </span>
          </button>
          </div>
        </div>
      </a>
  `;
  document.querySelector('.terms').insertAdjacentHTML('beforeend', el);
  return { term, definition };
}
socket.on('error', (msg) => {
  alert(msg);
});
const editTerm = (el) => {
  let mainElement = el.parentNode.parentNode;
  let termDiv = mainElement.querySelector('#termDiv');
  if (el.querySelector('span').innerText === 'done') {
    console.log(el);
    sendPkt('saveTerm', {
      cardId: getCardId(),
      term: el.parentNode.querySelector('.term').innerText,
      definition: el.parentNode.querySelector('.definition').innerText,
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
  el.parentNode.parentNode.style.animation = '';
  termDiv.querySelectorAll('p').forEach((cn) => {
    cn.contentEditable = true;
    cn.style = 'background-color: #CCC; padding: 3px;';
  });
  el.querySelector('span').innerText = 'done';
};

function preventEnter(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
}