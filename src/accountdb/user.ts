export interface User {
    name: string,
    password: string,
    email: string
}
export type AccountError = {
    EMAIL_TAKEN: 0,
    NAME_TAKEN: 1,
    OTHER: 2
}
interface AccountError1 {

}

let users: User[] = []

export function getUsers(): User[] {
    return users;
}
export function createUser(name: string, password: string, email: string, cb: (success: boolean, AccountError: AccountError) => void) {
    let user: User = {
        name,
        password,
        email
    }
    for (let user of users) {
        if (user.email.toLocaleLowerCase() === email) {
            cb(false, AccountError);
        }
    }
    users.push(user);
}