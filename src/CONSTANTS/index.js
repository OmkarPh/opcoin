const DIFFICULTY_ZEROES = '000';
const MAX_TRANSACTIONS = 3;
const INIT_REWARD = 50;
const HALVING_RATE = 11;
const PORT = process.argv[2] || process.env.PORT || 5000;
const SUBDOMAIN = process.env.SUBDOMAIN || "omkarphansopkar2003" 
const EXPOSE_GLOBALLY = process.env.EXPOSE_GLOBALLY || 'no'
const INIT_LISTEN = process.env.INIT_LISTEN || 30000
const ENTRIES_PER_PAGE = process.env.ENTRIES_PER_PAGE || 3
const BALANCE_TIMEOUT = process.env.BALANCE_TIMEOUT || 15000
const DEFAULT_KEY = process.env.DEFAULT_KEY || undefined;

export {
    MAX_TRANSACTIONS,
    BALANCE_TIMEOUT,
    DEFAULT_KEY,
    DIFFICULTY_ZEROES, 
    INIT_REWARD,
    HALVING_RATE,
    PORT,
    SUBDOMAIN,
    EXPOSE_GLOBALLY,
    ENTRIES_PER_PAGE,
    INIT_LISTEN
}