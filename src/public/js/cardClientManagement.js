let currentCardId;
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
