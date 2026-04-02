const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "text2image",
        version: "1.3.0",
        author: "xalman",
        countDown: 10,
        role: 0,
        shortDescription: "Generate Premium AI Images",
        longDescription: "Generate high-quality detailed images",
        category: "AI-IMAGE",
        guide: "{pn} [prompt]"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID, senderID } = event;
        const prompt = args.join(" ");

        if (!prompt) {
            return api.sendMessage("╭─❍\n│ 𝖯𝗅𝖾𝖺𝗌𝖾 𝖾𝗇𝗍𝖾𝗋 𝖺 𝗉𝗋𝗈𝗆𝗉𝗍!\n╰───────────⟡", threadID, messageID);
        }

        api.setMessageReaction("⏳", messageID, (err) => {}, true);
        const startTime = Date.now();

        const apiUrl = `https://xalman-apis.vercel.app/api/flux?prompt=${encodeURIComponent(prompt)}`;
        const cachePath = path.join(__dirname, 'cache', `t2i_${senderID}_${Date.now()}.png`);

        try {
            if (!fs.existsSync(path.join(__dirname, 'cache'))) {
                fs.mkdirSync(path.join(__dirname, 'cache'), { recursive: true });
            }

            const response = await axios({
                method: 'get',
                url: apiUrl,
                responseType: 'arraybuffer',
                timeout: 120000 
            });

            fs.writeFileSync(cachePath, Buffer.from(response.data, 'binary'));

            const endTime = Date.now();
            const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

            api.setMessageReaction("✅", messageID, (err) => {}, true);

            const msgBody = `❖ 𝖳𝖤𝖷𝖳 𝖳𝖮 𝖨𝖬𝖠𝖦𝖤 ❖\n━━━━━━━━━━━━━━━━━━\n✎ 𝖯𝗋𝗈𝗆𝗉𝗍: ${prompt}\n⏱️ 𝖲𝗉𝖾𝖾𝖽: ${timeTaken}𝗌\n━━━━━━━━━━━━━━━━━━\n𝖡𝗒 𝗑𝖺𝗅𝗆𝖺𝗇`;

            return api.sendMessage({
                body: msgBody,
                attachment: fs.createReadStream(cachePath)
            }, threadID, () => {
                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
            }, messageID);

        } catch (error) {
            console.error(error);
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return api.sendMessage(`✕ 𝖦𝖾𝗇𝖾𝗋𝖺𝗍𝗂𝗈𝗇 𝖥𝖺𝗂𝗅𝖾𝖽!\n𝖤𝗋𝗋𝗈𝗋: ${error.message}`, threadID, messageID);
        }
    }
};
