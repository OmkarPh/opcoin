// PubNub
import PubNub from 'pubnub';

const pubnubCredentials = {
    publishKey: process.env.PUB_KEY,
    subscribeKey: process.env.SUB_KEY,
    secretKey: process.env.SECRET_KEY
};


// Useful for input-consistency across modules
const KEYWORDS = {
    REQUEST_INIT_CHAIN: 'REQUEST_INIT_CHAIN',
    DELETE_TRANSACTIONS: 'DELETE_TRANSACTION'
}
const CHANNELS = {
    OPCOIN: 'OPCOIN',
    OPCOIN_MEMPOOL: 'OPCOIN_MEMPOOL:',
    NEW_NODE_REQUESTS: 'NEW_NODE_REQUESTS',
    NEW_NODE_RESPONSES: 'NEW_NODE_RESPONSES'
}

class PubSub{
    constructor(channels){
        try{
            this.pubnub = new PubNub(pubnubCredentials);
            this.pubnub.subscribe({channels: Object.values(channels)});
            this.myPublishIds = new Set();
            this.defaultChannel = channels[0];
        }catch(err){
            console.log(err);
            console.log('Some error occured while initializing PubNub in PubSub.js');
        }
    }

    addListener(listener){
        this.pubnub.addListener({
            message: msgObject => {

                // Fields of message Object for reference:
                // const {message, actualChannel, channel, publisher, subscribedChannel, subscription, timetoken} = messageObject;

                // Prevent repetition 
                if(this.myPublishIds.has(msgObject.timetoken))
                    return;
                

                if(typeof msgObject.message === 'string')
                    listener(msgObject.message);
                else
                    listener(msgObject.message.description, msgObject);
            }
        });
    }

    unsubscribeAll(){
        this.pubnub.unsubscribeAll();
    }

    publish(message="Ping", channel=this.defaultChannel){
        if(typeof message === 'object'){
            if(!message.title)
                message.title = "Ping";
            if(!message.description)
                message.description = "Ping success OK";
        }
        return new  Promise((resolve, reject)=>{
            this.pubnub.publish({channel, message})
                .then(response => {
                    // Add newly published token to the self-publishes-set for preventing repetition
                    this.myPublishIds.add(response.timetoken);
                    resolve(response);
                })
                .catch(reject);
        });
    }
}

export {
    CHANNELS,
    KEYWORDS
}

export default PubSub;