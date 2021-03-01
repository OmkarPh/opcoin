const DIFFICULTY_ZEROES = '000';
const MAX_TRANSACTIONS = 3;
const INIT_REWARD = 50;
const HALVING_RATE = 11;
const PORT = process.argv[2] || process.env.PORT || 5000;
const SUBDOMAIN = process.argv[3] || process.env.SUBDOMAIN || "omkarphansopkar2003" 
const EXPOSE_GLOBALLY = process.env.EXPOSE_GLOBALLY || 'no'
const INIT_LISTEN = process.env.INIT_LISTEN || 30000
const ENTRIES_PER_PAGE = process.env.ENTRIES_PER_PAGE || 3

// Necessary to link to my nodes, hence shared publicly.
// API keys are capped, misuse would disable them and I won't be billed XD . 
// No use of exploit :)
const pubnubCredentials = {
    PUB_KEY: process.env.PUB_KEY || 'pub-c-cae8e3a6-c9e7-4d60-85d1-7a816dac3eff',
    SUB_KEY: process.env.SUB_KEY || 'sub-c-bad9bf52-71b4-11eb-b241-92bcc7d4dfc4',
    SECRET_KEY: process.env.SECRET_KEY || 'sec-c-MzFiNzc1NzgtZTg3MC00MzY1LWI2ZGQtNTRkNzliNzA1OWQ2'
}


export {
    MAX_TRANSACTIONS,
    DIFFICULTY_ZEROES, 
    INIT_REWARD,
    HALVING_RATE,
    PORT,
    SUBDOMAIN,
    EXPOSE_GLOBALLY,
    ENTRIES_PER_PAGE,
    INIT_LISTEN
}