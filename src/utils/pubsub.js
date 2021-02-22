// PubNub
import PubNub from 'pubnub';

const pubnubCredentials = {
    publishKey: process.env.PUB_KEY,
    subscribeKey: process.env.SUB_KEY,
    secretKey: process.env.SECRET_KEY
};
const CHANNELS = {
    OPCOIN: 'OPCOIN',
    OPCOIN_MEMPOOL: 'OPCOIN_MEMPOOL:'
}

class PubSub{
    constructor(channels){
        try{
            this.pubnub = new PubNub(pubnubCredentials);
            this.pubnub.subscribe({channels: Object.values(channels)});
            this.myPublishIds = new Set();
        }catch(err){
            console.log(err);
            console.log('Some error occured while initializing PubNub in PubSub.js');
        }
    }

    addListener(listener){
        this.pubnub.addListener({
            message: msgObject => {
                // Prevent repetition 
                if(this.myPublishIds.has(msgObject.timetoken))
                    return;
                listener(msgObject);
            }
        });
    }

    publish(message="Ping", channel=CHANNELS.OPCOIN){
        if(typeof message === 'object'){
            if(!message.title)
                message.title = "Ping";
            if(!message.description)
                message.description = "Ping success OK";
        }
        return new  Promise((resolve, reject)=>{
            this.pubnub.publish({channel, message})
                .then(response => {
                    // Add newly published token to set for preventing repetition
                    this.myPublishIds.add(response.timetoken);
                    resolve(response);
                })
                .catch(reject);
        });
    }
}

export {
    CHANNELS
}
export default PubSub;