import { ec, verifySignature } from './utils/ec.js';
import hashSha256 from './utils/hash.js';

class Wallet {
    constructor(){
        this.balance = 0,
        this.keyPair = ec.genKeyPair(),        
        this.publicKey = this.keyPair.getPublic().encode('hex'); 
    }
    sign(data){
        return this.keyPair.sign(hashSha256(data));
    }
}
const wallet = new Wallet()

export default wallet;