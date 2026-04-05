const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");

const streamPipeline = promisify(pipeline);

const API_BASE = "https://xalman-apis.vercel.app/api/category";
const CACHE_DIR = path.join(__dirname, "cache");

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

module.exports = {
  config: {
    name: "album",
    aliases: ["gallery", "alb"],
    version: "10.0",
    author: "xalman",
    role: 0,
    category: "media",
    shortDescription: "get category based video from API",
    guide: "{p}album [page]"
  },

  onStart: async function ({ message, event, args }) {
    try {
      const catRes = await axios.get(API_BASE);
      const allCategories = catRes.data.categories || catRes.data.available_categories;

      if (!allCategories || !Array.isArray(allCategories)) {
        return message.reply("⚠️ No categories found in API.");
      }

      const itemsPerPage = 8;
      const totalPages = Math.ceil(allCategories.length / itemsPerPage);
      let page = parseInt(args[0]) || 1;

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * itemsPerPage;
      const currentPageCategories = allCategories.slice(startIndex, startIndex + itemsPerPage);

      const fancy = (t) => t.replace(/[a-z]/g, c => String.fromCodePoint(0x1d400 + c.charCodeAt(0) - 97));
      const numStyle = (n) => String(n).replace(/[0-9]/g, d => String.fromCodePoint(0x1d7ec + Number(d)));

      let menuText = `✨ ─── ✦ 𝐀𝐋𝐁𝐔𝐌  ✦ ─── ✨\n\n`;
      currentPageCategories.forEach((cat, index) => {
        menuText += ` ⚡ ${numStyle(index + 1)} ❯ ${fancy(cat)}\n`;
      });
      menuText += `\n📊 𝐏𝐚𝐠𝐞 [ ${numStyle(page)} / ${numStyle(totalPages)} ]\n`;
      menuText += `─────────────────────\n`;
      menuText += `💬 Reply with a number to view\n`;

      return message.reply(menuText, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "album",
          author: event.senderID,
          categories: currentPageCategories,
          messageID: info.messageID
        });
      });

    } catch (err) {
      return message.reply("⚠️ API Connection Error!");
    }
  },

  onReply: async function ({ message, event, Reply }) {
    const { author, categories, messageID } = Reply;
    if (event.senderID !== author) return;

    const pick = parseInt(event.body);
    if (isNaN(pick) || pick < 1 || pick > categories.length) return message.reply("🔢 Invalid Selection.");

    const category = categories[pick - 1];
    message.unsend(messageID).catch(() => {});
    
    const wait = await message.reply(`🌀 Streaming ${category.toUpperCase()}...`);

    try {
      const res = await axios.get(`${API_BASE}?name=${category}`);
      const mediaUrl = res.data.data;

      if (!mediaUrl) {
        message.unsend(wait.messageID);
        return message.reply("❌ Category content not found.");
      }

      const ext = mediaUrl.split(".").pop().split("?")[0] || "mp4";
      const filePath = path.join(CACHE_DIR, `stream_${Date.now()}.${ext}`);

      const response = await axios({
        method: 'get',
        url: mediaUrl,
        responseType: 'stream'
      });

      await streamPipeline(response.data, fs.createWriteStream(filePath));

      message.unsend(wait.messageID);
      await message.reply({
        body: `🎬 𝐀𝐋𝐁𝐔𝐌 𝐒𝐔𝐂𝐂𝐄𝐒𝐒\n💎 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲: ${category.toUpperCase()}`,
        attachment: fs.createReadStream(filePath)
      });

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    } catch (err) {
      console.error(err);
      message.reply("⚠️ Stream Failed.");
    }
  }
};
