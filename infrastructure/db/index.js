const db = require("./client");

module.exports = {
  query: (text, params) => db.query(text, params),
};