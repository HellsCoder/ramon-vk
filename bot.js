const {
    Bot
} = require('./vk-bot');


let bot = new Bot('vk group token');


bot.command('Привет', async (message) => {
	message.reply("Ну дарова");
});
        
bot.command(/.*/, async (message) => {
    let msg = 'Такой команды не существует';
    message.reply(msg);
});