'use strict';

const lala = require('@lala.js/core');
const MemberCountCounterSet = require('../models/MemberCountCounterSet');

class MemberCountService extends lala.Service {
    static isSupportedChannel(channel){
        return ['users', 'channels', 'bots'].indexOf(channel) !== -1;
    }

    #guildID = null;

    constructor(guildID){
        super();

        this.setGuildID(guildID);
    }

    setGuildID(guildID){
        if ( guildID === '' || typeof guildID !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid guild ID.', 1);
        }
        this.#guildID = guildID;
        return this;
    }

    getGuildID(){
        return this.#guildID;
    }

    async setCounterEnabled(counter, enabled){
        if ( counter === '' || typeof counter !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter type.', 1);
        }
        const memberCountCounterSet = await MemberCountCounterSet.findOrNew(this._guildConfig.getGuildID());
        switch ( counter ){
            case 'users': {
                memberCountCounterSet.setUserCounterEnabled(enabled);
            }break;
            case 'channels': {
                memberCountCounterSet.setChannelCounterEnabled(enabled);
            }break;
            case 'bots': {
                memberCountCounterSet.setBotCounterEnabled(enabled);
            }break;
        }
        await memberCountCounterSet.save();
    }

    async setCounterName(counter, name){
        if ( counter === '' || typeof counter !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter type.', 1);
        }
        if ( name === '' || typeof name !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 2);
        }
        const memberCountCounterSet = await MemberCountCounterSet.findOrNew(this._guildConfig.getGuildID());
        switch ( counter ){
            case 'users': {
                memberCountCounterSet.setUserCounterName(name);
            }break;
            case 'channels': {
                memberCountCounterSet.setChannelCounterName(name);
            }break;
            case 'bots': {
                memberCountCounterSet.setBotCounterName(name);
            }break;
        }
        await memberCountCounterSet.save();
    }
}

module.exports = MemberCountService;
