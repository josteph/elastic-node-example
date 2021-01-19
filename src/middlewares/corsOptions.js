let whitelist = [
  'localhost',
  '127.0.0.1',
].concat(''.split(','));

module.exports = {
  origin: (origin, cb) => {
    if (__PROD__) {
      whitelist = ['\\.web.app(:[1-9][0-9]+)?/?$'];
    }

    const tested = new RegExp(whitelist.join('|')).test(origin) ? '*' : false;

    cb(null, tested);
  },
  credentials: true,
};
