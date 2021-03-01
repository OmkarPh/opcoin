import { ec, verifySignature } from './utils/ec.js';
import hashSha256 from './utils/hash.js';
import Transaction, {CoinbaseTransaction} from './classes/Transaction.js';

class Wallet {
    constructor(){
        this.balance = 50,
        this.keyPair = ec.genKeyPair(),        
        this.publicKey = this.keyPair.getPublic().encode('hex'); 
    }
    sign(data){
        return this.keyPair.sign(hashSha256(data));
    }
    createTransaction({receiverPublicKey, amount}){
        if(amount > this.balance)
            throw new Error('Input amount exceeds, Transaction not possible');
        let tr = new Transaction({senderWallet: this, receiverPublicKey, amount});


        // console.log(Transaction.validate(tr));
        // console.log(tr.isValid());

        // tr.outputMap.ds = 523;
        // console.log(Transaction.validate(tr));
        // console.log(tr.isValid());
        
        return tr;
    }
    createCoinbase(height, fees){
        return new CoinbaseTransaction(height, this.publicKey, fees);
    }
}
const wallet = new Wallet()

export default wallet;