export type SthtConfig = {
  PORT: number;
  VERBOSE: boolean;
  SESSION_SECRET: string;
  DEV_MODE: boolean;
  VERSION: number
};

export const config: SthtConfig = {
  //
  PORT: 80,

  //
  VERBOSE: true,

  //
  SESSION_SECRET: 'a5f5ff89ebb1afde2066890ef11932d937447defe8f823934e12503a4f6073482a4441a6ff5832d45d58994179492ecb3e3913dc287d07cb1dfbe43f3564ee86',

  //
  DEV_MODE: true,

  //
  VERSION: 660 + Math.floor(Math.random() * 1000000)
};