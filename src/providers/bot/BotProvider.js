'use strict';

const lala = require('@lala.js/core');
const Discord = require('discord.js');
const CommandRouter = require('../../CommandRouter');
const GuildConfig = require('../../models/GuildConfig');
const config = require('../../../config/config.json');

class BotProvider extends lala.Provider {
    /**
     *
     * @return {Promise<module:"discord.js".Client>}
     * @protected
     */
    static async _bootstrapBot(){
        return new Promise((resolve) => {
            const intents = new Discord.Intents([Discord.Intents.NON_PRIVILEGED, 'GUILD_MEMBERS']);
            const client = new Discord.Client({
                ws: { intents }
            });
            client.on('ready', () => {
                CommandRouter.setClient(client);
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: 'Managing Discord servers',
                        type: 'CUSTOM_STATUS'
                    }
                });
                resolve(client);
            });
            client.login(config.token);
        });
    }

    /**
     *
     * @param {module:"discord.js".Client} client
     * @return {Promise<void>}
     * @protected
     */
    static async _bindGuildEventsHandlers(client){
        client.on('guildCreate', async (guild) => {
            let guildConfig = await GuildConfig.find(guild.id);
            if ( guildConfig === null ){
                guildConfig = new GuildConfig(guild.id);
                await guildConfig.save();
            }
        });
    }

    /**
     *
     * @return {Promise<void>}
     */
    static async setup(){
        const client = await BotProvider._bootstrapBot();
        await BotProvider._bindGuildEventsHandlers(client);
    }
}

module.exports = BotProvider;
