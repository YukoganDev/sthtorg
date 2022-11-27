import { prisma } from './prisma.server';

export async function createUserCard(title: string, name: string, cb: Function) {
  let userExists = await prisma.user.findUnique({
    where: {
      name,
    },
  });
  if (!userExists) {
    cb('Unexpected error', null);
    return;
  }
  let cardExists = await prisma.card.findUnique({
    where: {
        name: title
    }
  });
  if (cardExists) {
    cb('This card already exists', null);
    return;
  }
  let card = await prisma.card.create({
    data: {
      authorId: userExists.id,
      name: title
    }
  });

  const cardsByUser = await prisma.card.findMany({
    where: { authorId: userExists.id },
  });
  cb(null, card);
  console.log(cardsByUser);
}

export async function createTerm(term: string, definition: string, name: string, cardName: string, cb: Function) {
  let userExists = await prisma.user.findUnique({
    where: {
      name
    }
  });
  if (!userExists) {
    cb('Unexpected error (no such user)');
    return;
  }
  let cardExists = await prisma.card.findUnique({
    where: {
      name: cardName
    }
  });
  if (!cardExists) {
    cb('Unexpected error (no such card)');
    return;
  }
  // let termExists = await prisma.term.findUnique({
  //   where: {
  //     term
  //   }
  // });
  // if (termExists) {
  //   cb('Term alrea')
  // }
  let existingTerm = await prisma.term.create({
    data: {
      term,
      definition,
      authorId: userExists.id,
      cardId: cardExists.id
    }
  });
}

export async function getUserCards(name: string, cb: Function) {
  let userExists = await prisma.user.findUnique({
    where: {
      name
    }
  });
  if (!userExists) {
    cb('Unexpected error (no such user)', null);
    return;
  }
  let cards = await prisma.card.findMany({
    where: {
      authorId: userExists.id
    }
  });
  cb(null, cards);
}

export async function getCardTerms(cardId: number, cb: Function) {
  if (!cardId) {
    cb('Unexpected error (no card id provided)');
    return;
  }
  let cardExists = await prisma.card.findUnique({
    where: {
      id: cardId
    }
  }).catch((e) => {
    console.log('Unexpected GET');
    return;
  });
  if (!cardExists) {
    cb('Unexpected error (no such user)', null);
    return;
  }
  let terms = await prisma.term.findMany({
    where: {
      cardId: cardId
    }
  });
  if (!terms) {
    cb('No terms found', null)
    return;
  }
  cb(null, terms);
}