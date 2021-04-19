'use strict';

const lala = require('@lala.js/core');
const Model = require('./Model');
const Database = require('../support/Database');

class MemberCountCounterSet extends Model {
    static async find(guildID){
        if ( guildID === '' || typeof guildID !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid guild ID.', 1);
        }
        let memberCountCounterSet = null;
        const properties = await Database.getConnection().collection('memberCountCounterSet').findOne({
            guildID: guildID
        });
        if ( properties !== null ){
            memberCountCounterSet = new MemberCountCounterSet(guildID);
            memberCountCounterSet.setProperties(properties);
        }
        return memberCountCounterSet;
    }

    static async findOrNew(guildID, save = false){
        let memberCountCounterSet = await MemberCountCounterSet.find(guildID);
        if ( memberCountCounterSet === null ){
            memberCountCounterSet = new MemberCountCounterSet(guildID);
            if ( save === true ){
                await memberCountCounterSet.save();
            }
        }
        return memberCountCounterSet;
    }

    static async getGlobalCounters(){
        const counters = await Database.getConnection().collection('memberCountCounterSet').aggregate([{
            $project: {
                users: { $sum: "$userCount" },
                textChannels: { $sum: "$textChannelCount" },
                voiceChannels: { $sum: "$voiceChannelCount" }
            }
        }]).toArray();
        return !Array.isArray(counters) || counters.length === 0 ? null : {
            users: counters[0].users,
            channels: ( counters[0].textChannels + counters[0].voiceChannels )
        };
    }

    #guildID = null;
    #userCount = 0;
    #textChannelCount = 0;
    #voiceChannelCount = 0;
    #botCount = 0;
    #staticEmojiCount = 0;
    #animatedEmojiCount = 0;
    #roleCount = 0;
    #memberCounterChannelID = null;
    #userCounterChannelID = null;
    #textChannelCounterChannelID = null;
    #voiceChannelCounterChannelID = null;
    #channelCounterChannelID = null;
    #botCounterChannelID = null;
    #staticEmojiCounterChannelID = null;
    #animatedEmojiCounterChannelID = null;
    #emojiCounterChannelID = null;
    #roleCounterChannelID = null;

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

    setUserCount(userCount){
        if ( userCount === null || isNaN(userCount) || userCount < 0 ){
            throw new lala.InvalidArgumentException('Invalid counter value.', 1);
        }
        this.#userCount = Math.floor(userCount);
        return this;
    }

    getUserCount(){
        return this.#userCount;
    }

    setTextChannelCount(textChannelCount){
        if ( textChannelCount === null || isNaN(textChannelCount) || textChannelCount < 0 ){
            throw new lala.InvalidArgumentException('Invalid counter value.', 1);
        }
        this.#textChannelCount = Math.floor(textChannelCount);
        return this;
    }

    getTextChannelCount(){
        return this.#textChannelCount;
    }

    setVoiceChannelCount(voiceChannelCount){
        if ( voiceChannelCount === null || isNaN(voiceChannelCount) || voiceChannelCount < 0 ){
            throw new lala.InvalidArgumentException('Invalid counter value.', 1);
        }
        this.#voiceChannelCount = Math.floor(voiceChannelCount);
        return this;
    }

    getVoiceChannelCount(){
        return this.#voiceChannelCount;
    }

    setBotCount(botCount){
        if ( botCount === null || isNaN(botCount) || botCount < 0 ){
            throw new lala.InvalidArgumentException('Invalid counter value.', 1);
        }
        this.#botCount = Math.floor(botCount);
        return this;
    }

    getBotCount(){
        return this.#botCount;
    }

    setStaticEmojiCount(staticEmojiCount){
        if ( staticEmojiCount === null || isNaN(staticEmojiCount) || staticEmojiCount < 0 ){
            throw new lala.InvalidArgumentException('Invalid counter value.', 1);
        }
        this.#staticEmojiCount = Math.floor(staticEmojiCount);
        return this;
    }

    getStaticEmojiCount(){
        return this.#staticEmojiCount;
    }

    setAnimatedEmojiCount(animatedEmojiCount){
        if ( animatedEmojiCount === null || isNaN(animatedEmojiCount) || animatedEmojiCount < 0 ){
            throw new lala.InvalidArgumentException('Invalid counter value.', 1);
        }
        this.#animatedEmojiCount = Math.floor(animatedEmojiCount);
        return this;
    }

    getAnimatedEmojiCount(){
        return this.#animatedEmojiCount;
    }

    setRoleCount(roleCount){
        if ( roleCount === null || isNaN(roleCount) || roleCount < 0 ){
            throw new lala.InvalidArgumentException('Invalid counter value.', 1);
        }
        this.#roleCount = Math.floor(roleCount);
        return this;
    }

    getRoleCount(){
        return this.#roleCount;
    }

    getMemberCount(){
        return this.#userCount + this.#botCount;
    }

    getChannelCount(){
        return this.#textChannelCount + this.#voiceChannelCount;
    }

    getEmojiCount(){
        return this.#staticEmojiCount + this.#animatedEmojiCount;
    }

    setMemberCounterChannelID(memberCounterChannelID){
        if ( memberCounterChannelID !== null && ( memberCounterChannelID === '' || typeof memberCounterChannelID !== 'string' ) ){
            throw new lala.InvalidArgumentException('Invalid channel ID.', 1);
        }
        this.#memberCounterChannelID = memberCounterChannelID;
        return this;
    }

    getMemberCounterChannelID(){
        return this.#memberCounterChannelID;
    }

    setUserCounterChannelID(userCounterChannelID){
        if ( userCounterChannelID !== null && ( userCounterChannelID === '' || typeof userCounterChannelID !== 'string' ) ){
            throw new lala.InvalidArgumentException('Invalid channel ID.', 1);
        }
        this.#userCounterChannelID = userCounterChannelID;
        return this;
    }

    getUserCounterChannelID(){
        return this.#userCounterChannelID;
    }

    setTextChannelCounterChannelID(textChannelCounterChannelID){
        if ( textChannelCounterChannelID !== null && ( textChannelCounterChannelID === '' || typeof textChannelCounterChannelID !== 'string' ) ){
            throw new lala.InvalidArgumentException('Invalid channel ID.', 1);
        }
        this.#textChannelCounterChannelID = textChannelCounterChannelID;
        return this;
    }

    getTextChannelCounterChannelID(){
        return this.#textChannelCounterChannelID;
    }

    setVoiceChannelCounterChannelID(voiceChannelCounterChannelID){
        if ( voiceChannelCounterChannelID !== null && ( voiceChannelCounterChannelID === '' || typeof voiceChannelCounterChannelID !== 'string' ) ){
            throw new lala.InvalidArgumentException('Invalid channel ID.', 1);
        }
        this.#voiceChannelCounterChannelID = voiceChannelCounterChannelID;
        return this;
    }

    getVoiceChannelCounterChannelID(){
        return this.#voiceChannelCounterChannelID;
    }

    setChannelCounterChannelID(channelCounterChannelID){
        if ( channelCounterChannelID !== null && ( channelCounterChannelID === '' || typeof channelCounterChannelID !== 'string' ) ){
            throw new lala.InvalidArgumentException('Invalid channel ID.', 1);
        }
        this.#channelCounterChannelID = channelCounterChannelID;
        return this;
    }

    getChannelCounterChannelID(){
        return this.#channelCounterChannelID;
    }

    setBotCounterChannelID(botCounterChannelID){
        if ( botCounterChannelID !== null && ( botCounterChannelID === '' || typeof botCounterChannelID !== 'string' ) ){
            throw new lala.InvalidArgumentException('Invalid channel ID.', 1);
        }
        this.#botCounterChannelID = botCounterChannelID;
        return this;
    }

    getBotCounterChannelID(){
        return this.#botCounterChannelID;
    }

    setStaticEmojiCounterChannelID(staticEmojiCounterChannelID){
        if ( staticEmojiCounterChannelID !== null && ( staticEmojiCounterChannelID === '' || typeof staticEmojiCounterChannelID !== 'string' ) ){
            throw new lala.InvalidArgumentException('Invalid channel ID.', 1);
        }
        this.#staticEmojiCounterChannelID = staticEmojiCounterChannelID;
        return this;
    }

    getStaticEmojiCounterChannelID(){
        return this.#staticEmojiCounterChannelID;
    }

    setAnimatedEmojiCounterChannelID(animatedEmojiCounterChannelID){
        if ( animatedEmojiCounterChannelID !== null && ( animatedEmojiCounterChannelID === '' || typeof animatedEmojiCounterChannelID !== 'string' ) ){
            throw new lala.InvalidArgumentException('Invalid channel ID.', 1);
        }
        this.#animatedEmojiCounterChannelID = animatedEmojiCounterChannelID;
        return this;
    }

    getAnimatedEmojiCounterChannelID(){
        return this.#animatedEmojiCounterChannelID;
    }

    setEmojiCounterChannelID(emojiCounterChannelID){
        if ( emojiCounterChannelID !== null && ( emojiCounterChannelID === '' || typeof emojiCounterChannelID !== 'string' ) ){
            throw new lala.InvalidArgumentException('Invalid channel ID.', 1);
        }
        this.#emojiCounterChannelID = emojiCounterChannelID;
        return this;
    }

    getEmojiCounterChannelID(){
        return this.#emojiCounterChannelID;
    }

    setRoleCounterChannelID(roleCounterChannelID){
        if ( roleCounterChannelID !== null && ( roleCounterChannelID === '' || typeof roleCounterChannelID !== 'string' ) ){
            throw new lala.InvalidArgumentException('Invalid channel ID.', 1);
        }
        this.#roleCounterChannelID = roleCounterChannelID;
        return this;
    }

    getRoleCounterChannelID(){
        return this.#roleCounterChannelID;
    }

    setProperties(properties){
        if ( properties.hasOwnProperty('guildID') ){
            this.setGuildID(properties.guildID);
        }
        if ( properties.hasOwnProperty('userCount') ){
            this.setUserCount(properties.userCount);
        }
        if ( properties.hasOwnProperty('textChannelCount') ){
            this.setTextChannelCount(properties.textChannelCount);
        }
        if ( properties.hasOwnProperty('voiceChannelCount') ){
            this.setVoiceChannelCount(properties.voiceChannelCount);
        }
        if ( properties.hasOwnProperty('botCount') ){
            this.setBotCount(properties.botCount);
        }
        if ( properties.hasOwnProperty('staticEmojiCount') ){
            this.setStaticEmojiCount(properties.staticEmojiCount);
        }
        if ( properties.hasOwnProperty('animatedEmojiCount') ){
            this.setAnimatedEmojiCount(properties.animatedEmojiCount);
        }
        if ( properties.hasOwnProperty('roleCount') ){
            this.setRoleCount(properties.roleCount);
        }
        if ( properties.hasOwnProperty('memberCounterChannelID') ){
            this.setMemberCounterChannelID(properties.memberCounterChannelID);
        }
        if ( properties.hasOwnProperty('userCounterChannelID') ){
            this.setUserCounterChannelID(properties.userCounterChannelID);
        }
        if ( properties.hasOwnProperty('textChannelCounterChannelID') ){
            this.setTextChannelCounterChannelID(properties.textChannelCounterChannelID);
        }
        if ( properties.hasOwnProperty('voiceChannelCounterChannelID') ){
            this.setVoiceChannelCounterChannelID(properties.voiceChannelCounterChannelID);
        }
        if ( properties.hasOwnProperty('channelCounterChannelID') ){
            this.setChannelCounterChannelID(properties.channelCounterChannelID);
        }
        if ( properties.hasOwnProperty('botCounterChannelID') ){
            this.setBotCounterChannelID(properties.botCounterChannelID);
        }
        if ( properties.hasOwnProperty('staticEmojiCounterChannelID') ){
            this.setStaticEmojiCounterChannelID(properties.staticEmojiCounterChannelID);
        }
        if ( properties.hasOwnProperty('animatedEmojiCounterChannelID') ){
            this.setAnimatedEmojiCounterChannelID(properties.animatedEmojiCounterChannelID);
        }
        if ( properties.hasOwnProperty('emojiCounterChannelID') ){
            this.setEmojiCounterChannelID(properties.emojiCounterChannelID);
        }
        if ( properties.hasOwnProperty('roleCounterChannelID') ){
            this.setRoleCounterChannelID(properties.roleCounterChannelID);
        }
        return this;
    }

    getProperties(){
        return {
            guildID: this.#guildID,
            textChannelCount: this.#textChannelCount,
            voiceChannelCount: this.#voiceChannelCount,
            userCount: this.#userCount,
            botCount: this.#botCount,
            staticEmojiCount: this.#staticEmojiCount,
            animatedEmojiCount: this.#animatedEmojiCount,
            roleCount: this.#roleCount,
            memberCounterChannelID: this.#memberCounterChannelID,
            userCounterChannelID: this.#userCounterChannelID,
            textChannelCounterChannelID: this.#textChannelCounterChannelID,
            voiceChannelCounterChannelID: this.#voiceChannelCounterChannelID,
            channelCounterChannelID: this.#channelCounterChannelID,
            botCounterChannelID: this.#botCounterChannelID,
            staticEmojiCounterChannelID: this.#staticEmojiCounterChannelID,
            animatedEmojiCounterChannelID: this.#animatedEmojiCounterChannelID,
            emojiCounterChannelID: this.#emojiCounterChannelID,
            roleCounterChannelID: this.#roleCounterChannelID
        };
    }

    getChannelIDs(){
        return {
            memberCounterChannelID: this.#memberCounterChannelID,
            userCounterChannelID: this.#userCounterChannelID,
            textChannelCounterChannelID: this.#textChannelCounterChannelID,
            voiceChannelCounterChannelID: this.#voiceChannelCounterChannelID,
            channelCounterChannelID: this.#channelCounterChannelID,
            botCounterChannelID: this.#botCounterChannelID,
            staticEmojiCounterChannelID: this.#staticEmojiCounterChannelID,
            animatedEmojiCounterChannelID: this.#animatedEmojiCounterChannelID,
            emojiCounterChannelID: this.#emojiCounterChannelID,
            roleCounterChannelID: this.#roleCounterChannelID
        };
    }

    async save(){
        const properties = this.getProperties();
        delete properties.guildID;
        await Database.getConnection().collection('memberCountCounterSet').updateOne({
            guildID: this.#guildID
        }, {
            $set: properties
        }, {
            upsert: true
        });
    }

    async delete(){
        await Database.getConnection().collection('memberCountCounterSet').deleteOne({
            guildID: this.#guildID
        });
    }
}

module.exports = MemberCountCounterSet;
