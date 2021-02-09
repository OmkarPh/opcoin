import { v4 as uuidv4 } from 'uuid';
// import hasher from '../utils/hash.js';

export default class Transaction{
    constructor(sender, receiver, amount, fee){
        this.id = uuidv4();
        this.timeStamp = Date.now().toString();

        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;

        this.fee = fee;
    }
    static requiredKeys = ['sender', 'receiver', 'amount', 'fee']
    static sortDescending(t1, t2){
        return t2.fee - t1.fee
    }
    isValid(){
        for(let key of Object.keys(this))
            if(this[key] == null)
                return false;
        return true;
    }
}