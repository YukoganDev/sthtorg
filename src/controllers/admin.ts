import { createUser } from './../accountdb/user';
export async function parseCommand(cmd: any) {
    console.warn('Got admin command:', cmd);
    
    let fcmd: string = 'a_' + cmd.command + '(';
    for (let i = 0; i < cmd.args.length; i++) {
        fcmd += cmd.args[i];
        if (i < cmd.args.length - 1) {
            fcmd += ', ';
        }
    }
    fcmd += ');';
    console.warn('Executing', fcmd, '...');
    try {

        await eval(fcmd);
    } catch (e) {

    }
}


// Bridge functions
function a_createUser(...args: any) {
    createUser(args[0], args[1], args[2], () => {});
}