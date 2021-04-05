'use strict';

const crypto = require('crypto');
const lala = require('@lala.js/core');
const MemberCountCounterSet = require('../models/MemberCountCounterSet');
const MemberCountConfig = require('../models/MemberCountConfig');

class MemberCountService extends lala.Service {
    /**
     *
     * @param {module:"discord.js".GuildChannel} channel
     *
     * @returns {Promise<boolean>}
     */
    static async #channelShouldBeIgnored(channel){
        const memberCountCounterSet = await MemberCountCounterSet.findOrNew(channel.guild.id);
        const transactionCache = lala.CacheRepository.get('transactionCache');
        let shouldBeIgnored = Object.values(memberCountCounterSet.getChannelIDs()).indexOf(channel.id) >= 0;
        if ( !shouldBeIgnored ){
            const fingerprint = crypto.createHash('md5').update(channel.name).digest().toString('hex');
            const results = await transactionCache.hasMulti([
                'memberCount.counterChannel.#' + fingerprint,
                'memberCount.counterChannel.#' + channel.id
            ]);
            shouldBeIgnored = Object.values(results).some((result) => result === true);
        }
        return shouldBeIgnored;
    }

    /**
     *
     * @param {string} channel
     *
     * @returns {boolean}
     */
    static isSupportedChannel(channel){
        return ['members', 'users', 'text-channels', 'voice-channels', 'channels', 'bots'].indexOf(channel) !== -1;
    }

    /**
     *
     * @param {module:"discord.js".Client} client
     *
     * @returns {Promise<void>}
     */
    static async refreshEveryGuildCounters(client){
        const processes = [];
        for ( const [guildID, guild] of client.guilds.cache ){
            processes.push(new Promise((resolve, reject) => {
                const memberCountService = new MemberCountService(guild);
                memberCountService.refreshCounters(true, true).then(() => {
                    resolve();
                }).catch((ex) => {
                    reject(ex);
                });
            }));
        }
        await Promise.all(processes);
    }

    /**
     *
     * @param {module:"discord.js".GuildMember} member
     *
     * @returns {Promise<void>}
     */
    static triggerMembersCountRefresh(member){
        const memberCountService = new MemberCountService(member.guild);
        return memberCountService.refreshCounters(true, false);
    }

    /**
     *
     * @param {module:"discord.js".GuildChannel} channel
     *
     * @returns {Promise<void>}
     */
    static async triggerChannelsCountRefresh(channel){
        const shouldBeIgnored = await MemberCountService.#channelShouldBeIgnored(channel);
        if ( !shouldBeIgnored ){
            const memberCountService = new MemberCountService(channel.guild);
            await memberCountService.refreshCounters(false, true);
        }
    }

    /**
     *
     * @param {module:"discord.js".Client} client
     */
    static installObservers(client){
        client.on('guildMemberAdd', (member) => {
            MemberCountService.triggerMembersCountRefresh(member);
        });
        client.on('guildMemberRemove', (member) => {
            MemberCountService.triggerMembersCountRefresh(member);
        });
        client.on('channelCreate', (channel) => {
            MemberCountService.triggerChannelsCountRefresh(channel);
        });
        client.on('channelDelete', (channel) => {
            MemberCountService.triggerChannelsCountRefresh(channel);
        });
    }

    /**
     * @type {module:"discord.js".Guild}
     */
    #guild = null;

    /**
     * @type {?MemberCountCounterSet}
     */
    #memberCountCounterSet = null;

    /**
     * @type {?MemberCountConfig}
     */
    #memberCountConfig = null;

    /**
     *
     * @param {string} fullChannelName
     *
     * @returns {Promise<module:"discord.js".Channel>}
     */
    async #createCounterChannel(fullChannelName){
        const transactionCache = lala.CacheRepository.get('transactionCache');
        const fingerprint = crypto.createHash('md5').update(fullChannelName).digest().toString('hex');
        await transactionCache.set('memberCount.counterChannel.#' + fingerprint, true, {ttl: 600, overwrite: true});
        const channel = await this.#guild.channels.create(fullChannelName, {type: 'voice', userLimit: 0, position: 0});
        await transactionCache.set('memberCount.counterChannel.#' + channel.id, true, {ttl: 600, overwrite: true});
        return channel;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateMembersCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getMemberCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getMemberCounterName() + ': ' + this.#memberCountCounterSet.getMemberCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getMemberCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setMemberCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getMemberCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getMemberCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setMemberCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateUserCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getUserCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getUserCounterName() + ': ' + this.#memberCountCounterSet.getUserCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getUserCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setUserCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getUserCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getUserCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setUserCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateBotCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getBotCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getBotCounterName() + ': ' + this.#memberCountCounterSet.getBotCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getBotCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setBotCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getBotCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getBotCounterChannelID());
            if ( channel != null ){
                await channel.delete();
                this.#memberCountCounterSet.setBotCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateChannelCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getChannelCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getChannelCounterName() + ': ' + this.#memberCountCounterSet.getChannelCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getChannelCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setChannelCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getChannelCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getChannelCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setChannelCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateTextChannelCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getTextChannelCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getTextChannelCounterName() + ': ' + this.#memberCountCounterSet.getTextChannelCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getTextChannelCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setTextChannelCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getTextChannelCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getTextChannelCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setTextChannelCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<boolean>}
     */
    async #updateVoiceChannelCounterChannel(){
        let shouldBeSaved = false;
        if ( this.#memberCountConfig.getVoiceChannelCounterEnabled() ){
            const fullChannelName = this.#memberCountConfig.getVoiceChannelCounterName() + ': ' + this.#memberCountCounterSet.getVoiceChannelCount();
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getVoiceChannelCounterChannelID());
            if ( channel === null ){
                const channel = await this.#createCounterChannel(fullChannelName);
                this.#memberCountCounterSet.setVoiceChannelCounterChannelID(channel.id);
                shouldBeSaved = true;
            }else if ( channel.name !== fullChannelName ){
                await channel.setName(fullChannelName);
            }
        }else if ( this.#memberCountCounterSet.getVoiceChannelCounterChannelID() !== null ){
            const channel = await this.#guild.channels.resolve(this.#memberCountCounterSet.getVoiceChannelCounterChannelID());
            if ( channel !== null ){
                await channel.delete();
                this.#memberCountCounterSet.setVoiceChannelCounterChannelID(null);
                shouldBeSaved = true;
            }
        }
        return shouldBeSaved;
    }

    /**
     *
     * @returns {Promise<{bots: number, textChannels: number, voiceChannels: number, users: number}>}
     */
    async #countGuildEntities(){
        const counters = {users: 0, bots: 0, textChannels: 0, voiceChannels: 0};
        const members = await this.#guild.members.fetch();
        members.forEach((member) => {
            if ( member.user.bot ){
                counters.bots++;
            }else{
                counters.users++;
            }
        });
        const ignoredChannelIDs = Object.values(this.#memberCountCounterSet.getChannelIDs());
        for ( const [channelID, channel] of this.#guild.channels.cache ){
            if ( ignoredChannelIDs.indexOf(channelID) === -1 ){
                if ( channel.type === 'text' ){
                    counters.textChannels++;
                }else if ( channel.type === 'voice' ){
                    counters.voiceChannels++;
                }
            }
        }
        return counters;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async #updateCounterChannels(){
        const results = await Promise.all([
            this.#updateMembersCounterChannel(),
            this.#updateUserCounterChannel(),
            this.#updateTextChannelCounterChannel(),
            this.#updateVoiceChannelCounterChannel(),
            this.#updateChannelCounterChannel(),
            this.#updateBotCounterChannel()
        ]);
        const shouldBeSaved = results.some((element) => { return element === true });
        if ( shouldBeSaved ){
            await this.#memberCountCounterSet.save();
        }
    }

    /**
     *
     * @param {module:"discord.js".Guild} guild
     */
    constructor(guild){
        super();

        this.setGuild(guild);
    }

    /**
     *
     * @param {module:"discord.js".Guild} guild
     *
     * @returns {MemberCountService}
     */
    setGuild(guild){
        this.#guild = guild;
        return this;
    }

    /**
     *
     * @returns {module:"discord.js".Guild}
     */
    getGuild(){
        return this.#guild;
    }

    /**
     *
     * @param {boolean} includeMembers
     * @param {boolean} includeChannels
     *
     * @returns {Promise<void>}
     */
    async refreshCounters(includeMembers = true, includeChannels = true){
        if ( this.#memberCountCounterSet === null ){
            this.#memberCountCounterSet = await MemberCountCounterSet.findOrNew(this.#guild.id);
        }
        if ( this.#memberCountConfig === null ){
            this.#memberCountConfig = await MemberCountConfig.findOrNew(this.#guild.id);
        }
        const counters = await this.#countGuildEntities();
        if ( includeMembers === true ){
            this.#memberCountCounterSet.setUserCount(counters.users).setBotCount(counters.bots);
        }
        if ( includeChannels === true ){
            this.#memberCountCounterSet.setTextChannelCount(counters.textChannels).setVoiceChannelCount(counters.voiceChannels);
        }
        await Promise.all([
            this.#updateCounterChannels(),
            this.#memberCountCounterSet.save()
        ]);
    }

    /**
     *
     * @param {string} counter
     * @param {boolean} enabled
     *
     * @returns {Promise<void>}
     */
    async setCounterEnabled(counter, enabled){
        if ( this.#memberCountConfig === null ){
            this.#memberCountConfig = await MemberCountConfig.findOrNew(this.#guild.id);
        }
        switch ( counter ){
            case 'members': {
                this.#memberCountConfig.setMemberCounterEnabled(enabled);
            }break;
            case 'users': {
                this.#memberCountConfig.setUserCounterEnabled(enabled);
            }break;
            case 'text-channels': {
                this.#memberCountConfig.setTextChannelCounterEnabled(enabled);
            }break;
            case 'voice-channels': {
                this.#memberCountConfig.setVoiceChannelCounterEnabled(enabled);
            }break;
            case 'channels': {
                this.#memberCountConfig.setChannelCounterEnabled(enabled);
            }break;
            case 'bots': {
                this.#memberCountConfig.setBotCounterEnabled(enabled);
            }break;
            default: {
                throw new lala.InvalidArgumentException('Invalid counter type.', 1);
            }
        }
        await this.#memberCountConfig.save();
    }

    /**
     *
     * @param {string} counter
     * @param {string} name
     *
     * @returns {Promise<void>}
     */
    async setCounterName(counter, name){
        if ( name === '' || typeof name !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid counter name.', 2);
        }
        if ( this.#memberCountConfig === null ){
            this.#memberCountConfig = await MemberCountConfig.findOrNew(this.#guild.id);
        }
        switch ( counter ){
            case 'members': {
                this.#memberCountConfig.setMemberCounterName(name);
            }break;
            case 'users': {
                this.#memberCountConfig.setUserCounterName(name);
            }break;
            case 'text-channels': {
                this.#memberCountConfig.setTextChannelCounterName(name);
            }break;
            case 'voice-channels': {
                this.#memberCountConfig.setVoiceChannelCounterName(name);
            }break;
            case 'channels': {
                this.#memberCountConfig.setChannelCounterName(name);
            }break;
            case 'bots': {
                this.#memberCountConfig.setBotCounterName(name);
            }break;
            default: {
                throw new lala.InvalidArgumentException('Invalid counter type.', 1);
            }
        }
        await this.#memberCountConfig.save();
    }
}

module.exports = MemberCountService;
