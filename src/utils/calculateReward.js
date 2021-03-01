import { INIT_REWARD, HALVING_RATE } from '../CONSTANTS/index.js';

function calculateReward(height, fees=0){
    let reward = INIT_REWARD / Math.pow(2, (Math.floor(height / HALVING_RATE)));
    return Number(reward.toFixed(6).toLocaleString()) + fees;
}

// let tests = [];
// tests = [0, 1, 2, 10, 11, 15, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176, 187, 198, 209];
// for(let i=0; i<150; i++)
//     tests.push(11 * i);
// for(let n of tests)
//     console.log(`#${n}, reward: ${calculateReward(n)}`);

export default calculateReward;