// File-based caching
import flatCache from 'flat-cache';
import path from 'path'

import { PORT } from '../CONSTANTS/index.js';

export class Cache{
    constructor(cacheId, cachedir = path.resolve('./.cache')){
        this.cacheID = cacheId;
        if(process.env.NODE_ENV && process.env.NODE_ENV  !== 'production')
            this.cacheID += PORT
        this.cache = flatCache.load(this.cacheID, cachedir);
    }
    getID(){
        return this.cacheID;
    }
    setKey(key, value){
        this.cache.setKey(key, value);
        this.cache.save();
    }
    getKey(key){
        return this.cache.getKey(key);
    }
    keys(){
        return this.cache.keys();
    }    
    destroy(){
        this.cache.destroy();
    }
    removeCacheFile(){
        return this.cache.removeCacheFile();
    }
}

export default Cache;