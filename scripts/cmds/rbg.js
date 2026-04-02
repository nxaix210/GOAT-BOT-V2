const axios = require("axios");

module.exports = {
  config: {
    name: "rbg",
    aliases: ["removebg"],
    version: "3.0",
    author: "xalman",
    countDown: 4,
    role: 0,
    shortDescription: "Remove image background",
    category: "tools",
    guide: "{pn} [reply to image]"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, type, messageReply } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/rbg";

    let imageUrl;
    if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
      imageUrl = messageReply.attachments[0].url;
    } else {
      return api.sendMessage("╭─❍\n│ 𝖯𝗅𝖾𝖺𝗌𝖾 𝗋𝖾𝗉𝗅𝗒 𝗍𝗈 𝖺𝗇 𝗂𝗆𝖺𝗀𝖾!\n╰───────────⟡", threadID, messageID);
    }

    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const response = await axios.get(`${API_URL}?url=${encodeURIComponent(imageUrl)}`, { 
        responseType: 'stream' 
      });

      api.setMessageReaction("✅", messageID, () => {}, true);
      return api.sendMessage({
        body: "❖ 𝗕𝗔𝗖𝗞𝗚𝗥𝗢𝗨𝗡𝗗 𝗥𝗘𝗠𝗢𝗩𝗘𝗥 ❖\n━━━━━━━━━━━━━━━━━━",
        attachment: response.data
      }, threadID, messageID);

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ Failed to remove background!", threadID, messageID);
    }
  }
};
