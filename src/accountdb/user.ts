export interface IUser {
    name: string,
    password: string,
    email: string
}
export const AccountResult = {
    EMAIL_TAKEN: 0,
    NAME_TAKEN: 1,
    SUCCESS: 2,
    ERROR: 3,
    OTHER: 4
}

let users: IUser[] = []

export function getUsers(): IUser[] {
    return users;
}
export async function createUser(name: string, password: string, email: string, cb: (accountResult: number) => void) {
    let user: IUser = {
        name,
        password,
        email
    }
    for (let user of users) {
        if (user.email.toLocaleLowerCase() === email.toLocaleLowerCase()) {
            cb(AccountResult.EMAIL_TAKEN);
            return;
        }
        if (user.name.toLocaleLowerCase() === name.toLocaleLowerCase()) {
            cb(AccountResult.NAME_TAKEN);
            return;
        }
    }
    users.push(user);
    cb(AccountResult.SUCCESS);
    return user;
}
export async function checkCredentials(name: string, password: string, email: string, cb: (accountResult: number, user: IUser) => void) {
    for (let user of users) {
        if (user.email === email && user.password === password) {
            
            cb(AccountResult.SUCCESS, user);
            return;
        }
    }
    cb(AccountResult.ERROR, { email: 'ERROR', name: 'ERROR', password: 'error' });
}

createUser('Yukogan', 'yu.ry4507', 'yuko@gmx.li', (result) => {
    console.log(result);
});
createUser('Yukogan', 'yu.ry4507', 'yukoe@gmx.li', (result) => {
    console.log(result);
});