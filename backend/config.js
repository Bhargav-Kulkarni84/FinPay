const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    JWT_SECRET:process.env.secret,
    mongoURL:process.env.mongoURL,
}