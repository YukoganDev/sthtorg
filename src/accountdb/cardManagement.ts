import { prisma } from './prisma.server';

export async function createUserCard(title: string, name: string, cb: Function) {
  let userExists = await prisma.user.findUnique({
    where: {
      name,
    },
  });
  if (!userExists) {
    cb('Unexpected error');
    return;
  }
  let cardExists = await prisma.card.findUnique({
    where: {
        name: title
    }
  });
  if (cardExists) {
    cb('This card already exists');
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