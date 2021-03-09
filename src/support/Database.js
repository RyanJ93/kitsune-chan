'use strict';

const mongodb = require('mongodb');
const config = require('../../config/config.json');

class Database {
    static _connection = null;

    static _getConnectionURI(){
        let uri = 'mongodb://';
        if ( config.database.username !== '' && config.database.password !== '' ){
            uri += config.database.username + ':' + config.database.password + '@';
        }
        return uri + config.database.host + ':' + config.database.port;
    }

    static async setup(){
        const uri = Database._getConnectionURI();
        const client = new mongodb.MongoClient(uri, {
            useUnifiedTopology: true
        });
        await client.connect();
        Database._connection = await client.db(config.database.database);
    }

    static getConnection(){
        return Database._connection;
    }
}

module.exports = Database;
