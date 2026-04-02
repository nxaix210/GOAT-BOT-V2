const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    aliases: ["imageedit"],
    version: "3.5",
    author: "xalman",
    countDown: 20,
    role: 0,
    shortDescription: "AI Image Editor",
    longDescription: "Reply to an image with a prompt to edit it using AI",
    category: "ai",
    guide: "{pn} [reply to image] [prompt]"
  },

  onStart: async function ({ event, message, args, api }) {
    const { messageReply, type } = event;

    if (
      type !== "message_reply" ||
      !messageReply.attachments ||
      messageReply.attachments[0].type !== "photo"
    ) {
      return message.reply("⚠️ | Please reply to an image to start editing.");
    }

    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("📝 | Please provide a prompt for editing. Example: imgedit cyberpunk style");
    }

    const imageUrl = messageReply.attachments[0].url;
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `edit_${Date.now()}.png`);

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

    try {
      const EDIT_API = "https://xalman-apis.vercel.app/api/imgedit";

      const res = await axios.post(
        EDIT_API,
        { 
          url: imageUrl, 
          prompt: prompt 
        },
        {
          responseType: "arraybuffer",
          timeout: 400000
        }
      );

      await fs.writeFile(filePath, Buffer.from(res.data));

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      
      await message.reply({
        body: "✨ | Image Edited Successfully!",
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 5000);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      console.error("IMGEDIT ERROR:", err);

      let errorMsg = "🌐 | API Server is temporarily unavailable.";
      if (err.code === "ECONNABORTED") {
        errorMsg = "⏱️ | Server timeout: The processing took too long.";
      } else if (err.response) {
        errorMsg = `🚫 | API Error!`;
      }

      message.reply(errorMsg);

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
};
