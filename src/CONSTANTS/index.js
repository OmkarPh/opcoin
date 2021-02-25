const DIFFICULTY_ZEROES = '000';
const MAX_TRANSACTIONS = process.env.MAX_TRANSACTIONS || 5;
const PORT = process.argv[2] || process.env.PORT || 5000;
const SUBDOMAIN = process.argv[3] || process.env.SUBDOMAIN || "omkarphansopkar2003" 
const EXPOSE_GLOBALLY = process.env.EXPOSE_GLOBALLY || 'no'
const INIT_LISTEN = process.env.INIT_LISTEN || 30000
const ENTRIES_PER_PAGE = process.env.ENTRIES_PER_PAGE || 3

// Necessary in order to link my nodes, hence shared publicly.
// API keys are capped, misuse would disable them. Please don't exploit !
const pubnubCredentials = {
    PUB_KEY: process.env.PUB_KEY || 'pub-c-cae8e3a6-c9e7-4d60-85d1-7a816dac3eff',
    SUB_KEY: process.env.SUB_KEY || 'sub-c-bad9bf52-71b4-11eb-b241-92bcc7d4dfc4',
    SECRET_KEY: process.env.SECRET_KEY || 'sec-c-MzFiNzc1NzgtZTg3MC00MzY1LWI2ZGQtNTRkNzliNzA1OWQ2'
}



// export default {
//     MAX_TRANSACTIONS,
//     DIFFICULTY_ZEROES,
//     PORT,
//     SUBDOMAIN,
//     EXPOSE_GLOBALLY,
//     ENTRIES_PER_PAGE,
// };

export {
    MAX_TRANSACTIONS,
    DIFFICULTY_ZEROES, 
    PORT,
    SUBDOMAIN,
    EXPOSE_GLOBALLY,
    ENTRIES_PER_PAGE,
    INIT_LISTEN
}