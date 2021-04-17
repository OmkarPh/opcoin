import path from 'path';
import flatCache from 'flat-cache';

const defaultCache = flatCache.createFromFile(path.resolve('./src/config/defaultBlockchain'));

export default defaultCache.getKey('blockchain');