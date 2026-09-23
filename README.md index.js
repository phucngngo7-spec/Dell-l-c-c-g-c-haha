// ==========================================
// TỰ ĐỘNG KHỞI TẠO PACKAGE.JSON
// ==========================================
if (process.env.AUTO_SETUP !== 'true') {
    const fs = require('fs');
    const packageJson = {
        "name": "delta-bypass-bot",
        "version": "1.0.0",
        "main": "index.js",
        "scripts": { "start": "node index.js" },
        "dependencies": {
            "discord.js": "^14.14.0",
            "axios": "^1.6.0"
        }
    };
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    process.env.AUTO_SETUP = 'true';
}

// ==========================================
// CODE CHÍNH CỦA BOT DISCORD (ĐÃ NHÉT SẴN TOKEN & ID)
// ==========================================
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const http = require('http');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot Bypass Delta dang hoat dong!\n');
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Token và ID của ní đây nhé
const TOKEN = 'MTU1MjI5MjQ2ODY5MzkzNDE3Mg.GbvzLq.n6D0McF3iSRyAj4aYzTzz__RY8-BrXDl_nw0Ww';
const CLIENT_ID = '1552292468693934172';

client.once('ready', async () => {
    console.log(`🚀 Bot Discord đã thức giấc: ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('bypass')
            .setDescription('Tự động vượt link lấy key Delta cho Roblox!')
            .addStringOption(option =>
                option.setName('link')
                    .setDescription('Dán cái link nhận key Delta vào đây')
                    .setRequired(true))
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✔️ Đã đăng ký lệnh /bypass thành công!');
    } catch (error) {
        console.error('❌ Lỗi đăng ký lệnh:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'bypass') {
        const targetLink = interaction.options.getString('link');
        
        await interaction.deferReply();

        try {
            const apiUrl = `https://api.bypass.vip/bypass?url=${encodeURIComponent(targetLink)}`;
            const response = await axios.get(apiUrl, { timeout: 15000 });
            const data = response.data;

            if (data && (data.destination || data.url || data.result)) {
                const finalKeyUrl = data.destination || data.url || data.result;
                await interaction.editReply(
                    `🔑 **Đã vượt link thành công cho ní!**\n` +
                    `🔗 **Link nhận Key sạch:** ${finalKeyUrl}`
                );
            } else {
                await interaction.editReply(`❌ Không thể tự động lấy key lúc này. API có thể đang bận hoặc link lỗi!`);
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply(`⚠️ Lỗi kết nối tới trạm Bypass API rồi ní ơi, kiểm tra lại đường link nha!`);
        }
    }
});

client.login(TOKEN);
