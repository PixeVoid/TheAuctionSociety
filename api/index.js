const server = require('../server.js');

module.exports = (req, res) => {
  return server.default(req, res);
};
