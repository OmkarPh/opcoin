import elliptic from 'elliptic';
import hashSha256 from './hash.js';

const ec = new elliptic.ec('secp256k1');

const verifySignature = ({publicKey, data, signature}) => {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
    return keyFromPublic.verify(hashSha256(data), signature);
}

export{
    ec,
    verifySignature
};
export default ec;