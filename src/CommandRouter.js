'use strict';

const GuildConfig = require('./models/GuildConfig');
const BotException = require('./exceptions/BotException');

class CommandRouter {
    static #client = null;
    static #commands = new Map();

    static async #getGuildConfig(guildID){
        let guildConfig = await GuildConfig.find(guildID);
        if ( guildConfig === null ){
            guildConfig = new GuildConfig(guildID);
            await guildConfig.save();
        }
        return guildConfig;
    }

    static async #handleCommandException(ex, channel){
        if ( !( ex instanceof BotException ) ){
            throw ex;
        }
        await channel.send('Error: ' + ex.message);
    }

    static async #handleMessage(message){
        if ( !message.author.bot ){
            const guildConfig = await CommandRouter.#getGuildConfig(message.channel.guild.id);
            if ( guildConfig !== null && message.content.indexOf(guildConfig.getPrefix()) === 0 ){
                const start = guildConfig.getPrefix().length;
                const end = message.content.indexOf(' ');
                const commandName = end === -1 ? message.content.substr(start) : message.content.substr(start, end - 1);
                const command = CommandRouter.#commands.get(commandName);
                if ( typeof command !== 'undefined' ){
                    message.cleanedContent = message.content.substr(start + commandName.length + 1);
                    const controller = new command.controller(CommandRouter.#client, guildConfig, message);
                    controller[command.method]().catch((ex) => {
                        CommandRouter.#handleCommandException(ex, message.channel);
                    });
                }
            }
        }
    }

    static #init(){
        CommandRouter.#client.on('message', async (message) => {
            await CommandRouter.#handleMessage(message);
        });
    }

    static setClient(client){
        CommandRouter.#client = client;
        CommandRouter.#init();
    }

    static getClient(){
        return CommandRouter.#client;
    }

    static registerCommand(command, controller, method){
        CommandRouter.#commands.set(command, {
            controller: controller,
            method: method
        });
    }

    static commandExists(command){
        return CommandRouter.#commands.has(command);
    }
}

module.exports = CommandRouter;
