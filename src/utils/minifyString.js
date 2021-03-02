import _ from 'lodash';
const { truncate } = _;

const minifyString = (string, length=12) => {
  if(string.length < length+6)  
    return string;

  const options = {
    'length': length
  }  
  return truncate(string, options) + string.substring(string.length-5);
}

export default minifyString;