const axios = require("axios");

module.exports = {
  config: {
    name: "gif",
    aliases: ["animegif", "agif"],
    version: "2.0",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Get anime GIFs by category",
    category: "fun",
    guide: "{pn} [category]\nAvailable: hug, kiss, slap, pat, wink, dance, smile, wave, laugh"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/gif";

    const type = args[0]?.toLowerCase();

    if (!type) {
      return api.sendMessage("╭─❍\n│ Usage: {pn} dance\n│ Categories: hug, kiss, slap, pat, wink, dance, smile, wave, laugh\n╰───────────⟡", threadID, messageID);
    }

    api.setMessageReaction("🎭", messageID, () => {}, true);

    try {
      const res = await axios.get(`${API_URL}?type=${type}`);

      if (res.data.status === true) {
        const gifUrl = res.data.url;
        const gifStream = (await axios.get(gifUrl, { responseType: 'stream' })).data;

        api.setMessageReaction("✅", messageID, () => {}, true);
        return api.sendMessage({
          body: `❖ 𝗔𝗡𝗜𝗠𝗘 𝗚𝗜𝗙: ${type.toUpperCase()} ❖\n━━━━━━━━━━━━━━━━━━`,
          attachment: gifStream
        }, threadID, messageID);
      } else {
        return api.sendMessage(`✕ Invalid category! Available: ${res.data.available_categories.join(", ")}`, threadID, messageID);
      }

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ API Error or failed to fetch GIF!", threadID, messageID);
    }
  }
};
