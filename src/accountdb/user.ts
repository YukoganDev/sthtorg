import { User } from '@prisma/client';
import { prisma } from "./prisma.server";

export const AccountResult = {
  EMAIL_TAKEN: 0,
  NAME_TAKEN: 1,
  SUCCESS: 2,
  ERROR: 3,
  OTHER: 4,
};

export const createUser = async (name: string, email: string, password: string, cb: Function) => {
  let emailExists = await prisma.user.findUnique({
    where: {
      email
    }
  });
  let nameExists = await prisma.user.findUnique({
    where: {
      name
    }
  });
  if (emailExists) {
    cb(AccountResult.EMAIL_TAKEN);
    return;
  }
  if (nameExists) {
    cb(AccountResult.NAME_TAKEN);
    return;
  }
  let user = await prisma.user.create({
    data: {
      name,
      email,
      password
    }
  });

  cb(AccountResult.SUCCESS, user);
}