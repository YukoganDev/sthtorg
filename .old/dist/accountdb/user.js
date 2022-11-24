"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCredentials = exports.createUser = exports.getUsers = exports.AccountResult = void 0;
exports.AccountResult = {
    EMAIL_TAKEN: 0,
    NAME_TAKEN: 1,
    SUCCESS: 2,
    ERROR: 3,
    OTHER: 4
};
let users = [];
const EMPTY_USER = createUser('EMPTY', 'EMPTY', 'EMPTY', (result) => { });
function getUsers() {
    return users;
}
exports.getUsers = getUsers;
async function createUser(name, password, email, cb) {
    let user = {
        name,
        password,
        email
    };
    for (let user of users) {
        if (user.email.toLocaleLowerCase() === email) {
            cb(exports.AccountResult.EMAIL_TAKEN);
            return user;
        }
        if (user.name.toLocaleLowerCase() === name) {
            cb(exports.AccountResult.NAME_TAKEN);
            return user;
        }
    }
    users.push(user);
    cb(exports.AccountResult.SUCCESS);
    return user;
}
exports.createUser = createUser;
async function checkCredentials(name, password, email, cb) {
    for (let user of users) {
        if (user.name === name && user.password === password) {
            cb(exports.AccountResult.SUCCESS, user);
            return;
        }
    }
    cb(exports.AccountResult.ERROR);
}
exports.checkCredentials = checkCredentials;
createUser('Yukogan', 'yu.ry4507', 'yuko@gmx.li', (result) => {
    console.log(result);
});
createUser('Yukoga2n', 'yu.ry4507', 'yuko@gmx.li', (result) => {
    console.log(result);
});
