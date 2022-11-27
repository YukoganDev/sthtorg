import { User } from '@prisma/client';
import { prisma } from "./prisma.server";

export type AccountResult = number;

export const AccountResult = {
  EMAIL_TAKEN: 0,
  NAME_TAKEN: 1,
  SUCCESS: 2,
  ERROR: 3,
  UNKNOWN_USER: 4
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
    cb(AccountResult.EMAIL_TAKEN, null);
    return;
  }
  if (nameExists) {
    cb(AccountResult.NAME_TAKEN, null);
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

type AccountData = { email: string, password: string };
export const checkCredentials = async ({ email, password }: AccountData, cb: Function) => {
  let exists = await prisma.user.findUnique({
    where: {
      email
    }
  });
  if (!exists) { cb(AccountResult.UNKNOWN_USER); return; }
  if (exists.password === password) {
    cb(AccountResult.SUCCESS, exists);
    return;
  }
  cb(AccountResult.ERROR);
}