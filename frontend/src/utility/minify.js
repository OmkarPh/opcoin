import _ from 'lodash';
const { truncate } = _;

const minifyString = (string, length=12, extraEllipses = 0) => {
  if(string.length < length+6)  
    return string;
  return truncate(string, {'length': length-3}) + '.'.repeat(extraEllipses);
}

export default minifyString;