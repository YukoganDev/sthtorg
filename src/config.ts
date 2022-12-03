export type SthtConfig = {
    PORT: number,
    VERBOSE: boolean,
    SESSION_SECRET: string,
    DEV_MODE: boolean
}

export const config: SthtConfig = {
    //
    PORT: 8080,

    //
    VERBOSE: true,

    //
    SESSION_SECRET: '9utv93p18491tvuqxb941',

    //
    DEV_MODE: true
}