import fs from 'fs';
import { folderDir } from './user';

export async function createUserCard(name: string) {
    let card = {
        name: name,

    }
    fs.readFile(`${folderDir}db.json`, 'utf-8', (err, data) => {
        
    });
}