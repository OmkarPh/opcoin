// Setup
import crypto from 'crypto';

const hashSha256 = (string) => {
    return crypto.createHash('sha256').update(string).digest('hex');
}

export default hashSha256;