// 2.4.1 CORS
// const allowedOrigins = ["http://localhost:3000"];
// 13.3
const allowedOrigins = ["https://susie-complaints-system.onrender.com"];

module.exports = allowedOrigins;

// Testing
// at google: fetch("http://localhost:3000/") = ok
// at google: fetch("http://localhost:3500/") = CORS error msg
