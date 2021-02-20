// PubNub
import PubNub from 'pubnub';

const pubnubCredentials = {
    publishKey: process.env.PUB_KEY,
    subscribeKey: process.env.SUB_KEY,
    secretKey: process.env.SECRET_KEY
};
const CHANNELS = {
    OPCOIN: 'OPCOIN'
}

class PubSub{
    constructor(channels){
        try{
            this.pubnub = new PubNub(pubnubCredentials);
            this.pubnub.subscribe({channels: Object.values(channels)});
        }catch(err){
            console.log(err);
            console.log('Some error occured while initializing PubNub in PubSub.js');
        }
    }
    addListener(listener){
        this.pubnub.addListener({
            message: listener
        });
    }
    publish(message="Ping", channel=CHANNELS.OPCOIN){
        if(typeof message === 'object'){
            if(!message.title)
                message.title = "Ping";
            if(!message.description)
                message.description = "Ping success OK";
        }
        try{
            this.pubnub.publish({channel, message});
        }catch(err){
            console.log(err);
            console.log('Some error occured while publishing message in PubSub');
        }
    }
}

export {
    CHANNELS
}
export default PubSub;