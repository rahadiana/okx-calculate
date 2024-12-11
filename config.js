const crypto = require('crypto');
myArgs = process.argv.slice(2);
redis_primary = myArgs[0];
redis_secondary = myArgs[1];


function generateNanoId(length = 9) {
  // Generate random bytes
  const bytes = crypto.randomBytes(length);

  // Encode to Base64 and make URL-friendly
  return bytes
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '') // Remove padding
      .substring(0, length); // Truncate to desired length
}


const BaseConfig = {
  redis_primary: {
    ip: redis_primary == undefined ? 'localhost' : redis_primary.split(':')[0],
    port: redis_primary == undefined ? 6379 : parseInt(redis_primary.split(':')[1])
  },
  redis_secondary: {
    ip: redis_secondary == undefined ? 'localhost' : redis_secondary.split(':')[0],
    port: redis_secondary == undefined ? 6379 : parseInt(redis_secondary.split(':')[1])
  },
  CountTime: myArgs[2]*86400 || 86400 * 1,// default cache 1 day
  PublishChannel : generateNanoId()
};

module.exports = BaseConfig;