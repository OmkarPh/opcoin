import { INIT_REWARD, HALVING_RATE } from '../CONSTANTS/index.js';

function calculateReward(height, fees=0){
    let reward = INIT_REWARD / Math.pow(2, (Math.floor(height / HALVING_RATE)));
    return Number(reward.toFixed(7).toLocaleString()) + fees;
}

export default calculateReward;