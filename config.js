/** Common config for bookstore. */

// read .env files and make environmental variables
require("dotenv").config();

// to deal with invalid characters in password
const URI_DB_PASSWORD = `${encodeURIComponent(process.env.DB_PASSWORD)}`

const DB_URI = (process.env.NODE_ENV === "test")
    ? `postgresql://${process.env.DB_USER}:${URI_DB_PASSWORD}@localhost:${process.env.DB_PORT}/books_test`
    : `postgresql://${process.env.DB_USER}:${URI_DB_PASSWORD}@localhost:${process.env.DB_PORT}/books`;

module.exports = { DB_URI };