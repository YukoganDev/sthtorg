import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const queue = [];
var isDone = true;

export interface IUser {
  name: string;
  password: string;
  email: string;
  uuid: string;
  cards: [];
}
export const AccountResult = {
  EMAIL_TAKEN: 0,
  NAME_TAKEN: 1,
  SUCCESS: 2,
  ERROR: 3,
  OTHER: 4,
};

let users: IUser[] = [];
export const folderDir: string = `${__dirname}/json/`;

export function getUsers(): IUser[] {
  return users;
}
function isSame(a: string, b: string) {
  if (a.toLocaleLowerCase() === b.toLocaleLowerCase()) {
    return true;
  }
  return false;
}
export async function createUser(
  name: string,
  password: string,
  email: string,
  cb: (accountResult: number) => void
) {
  if (!isDone) {
    let user: IUser = {
      name,
      password,
      email,
      uuid: uuidv4(),
      cards: [],
    };
    queue.push(user);
  }
  await fs.readFile(`${folderDir}db.json`, 'utf-8', (err, data) => {
    if (err) { throw err; }
    let parsed = JSON.parse(data);
    for (let user of parsed.users) {
      if (isSame(user.name, name)) {
        cb(AccountResult.NAME_TAKEN)
        return;
      }
      if (isSame(user.email, email)) {
        cb(AccountResult.EMAIL_TAKEN);
        return;
      }
    }
    let user: IUser = {
      name,
      password,
      email,
      uuid: uuidv4(),
      cards: [],
    };
    console.log(parsed);
    parsed.users.push(user);
    fs.writeFile(`${folderDir}db.json`, JSON.stringify(parsed, null, 2), (err) => {
      if (err) { throw err; }
    });
  });
}
export async function checkCredentials(
  name: string,
  password: string,
  email: string,
  cb: (accountResult: number, user: IUser) => void
) {
  fs.readFile(`${folderDir}db.json`, 'utf-8', (err, data) => {
    if (err) { throw err; }
    let parsed = JSON.parse(data);
    for (let user of parsed.users) {
      if (isSame(user.email, email) && isSame(user.password, password)) {
        cb(AccountResult.SUCCESS, user);
        return;
      }
    }
  cb(AccountResult.ERROR, {
    email: "ERROR",
    name: "ERROR",
    password: "error",
    uuid: "error",
    cards: [],
  });
  });

  // for (let user of users) {
  //   if (user.email === email && user.password === password) {
  //     cb(AccountResult.SUCCESS, user);
  //     return;
  //   }
  // }
}

createUser("Yukogan", "yu.ry4507", "yuko@gmx.li", (result) => {
  console.log(result);
});
createUser("Yuko2gan", "yu.ry4507", "yuko@gmx.li", (result) => {
  console.log(result);
});
