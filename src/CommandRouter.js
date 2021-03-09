'use strict';

const GuildConfig = require('./models/GuildConfig');

class CommandRouter {
    static _client = null;
    static _commands = new Map();

    static async _handleMessage(message){
        if ( !message.author.bot ){
            const guildConfig = await GuildConfig.find(message.channel.guild.id);
            if ( guildConfig !== null && message.content.indexOf(guildConfig.getPrefix()) === 0 ){
                const start = guildConfig.getPrefix().length;
                const end = message.content.indexOf(' ');
                const commandName = end === -1 ? message.content.substr(start) : message.content.substr(start, end - 1);
                const command = CommandRouter._commands.get(commandName);
                if ( typeof command !== 'undefined' ){
                    message.cleanedContent = message.content.substr(start + commandName.length + 1);
                    const controller = new command.controller(CommandRouter._client, guildConfig, message);
                    await controller[command.method]();
                }
            }
        }
    }

    static _init(){
        CommandRouter._client.on('message', async (message) => {
            await CommandRouter._handleMessage(message);
        });
    }

    static setClient(client){
        CommandRouter._client = client;
        CommandRouter._init();
    }

    static getClient(){
        return CommandRouter._client;
    }

    static registerCommand(command, controller, method){
        CommandRouter._commands.set(command, {
            controller: controller,
            method: method
        });
    }
}

module.exports = CommandRouter;
