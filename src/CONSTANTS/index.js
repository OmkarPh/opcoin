const DIFFICULTY_ZEROES = '000';
const MAX_TRANSACTIONS = process.env.MAX_TRANSACTIONS || 5;
const PORT = process.argv[2] || process.env.PORT || 5000;
const SUBDOMAIN = process.argv[3] || process.env.SUBDOMAIN || "omkarphansopkar2003" 
const EXPOSE_GLOBALLY = process.env.EXPOSE_GLOBALLY || 'no'

export default {
    MAX_TRANSACTIONS,
    DIFFICULTY_ZEROES,
    PORT,
    SUBDOMAIN,
    EXPOSE_GLOBALLY
};

export {
    MAX_TRANSACTIONS,
    DIFFICULTY_ZEROES, 
    PORT,
    SUBDOMAIN,
    EXPOSE_GLOBALLY
}