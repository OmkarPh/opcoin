// Setup
import crypto from 'crypto';

const hashSha256 = (string) => {
    
    if(typeof string === 'string' || Buffer.isBuffer(string))
        return crypto.createHash('sha256').update(string).digest('hex');

    return crypto.createHash('sha256').update(JSON.stringify(string)).digest('hex');
}

export default hashSha256;