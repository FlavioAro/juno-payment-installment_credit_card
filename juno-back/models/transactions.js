const Sequelize = require('sequelize');
const database = require('../config/db');
 
const Transactions = database.define('transactions', {
    transactionId: Sequelize.STRING,
    installments: Sequelize.INTEGER(2),
    payments: Sequelize.JSON
}, {
    timestamps: false,
})

module.exports = Transactions;