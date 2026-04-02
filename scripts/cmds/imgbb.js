const axios = require("axios");

module.exports = {
  config: {
    name: "imgbb",
    aliases: ["ibb", "i"],
    version: "2.0",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Upload image in imagebb",
    category: "tools",
    guide: "{pn} [reply to an image]"
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, type, messageReply } = event;
    const API_URL = "https://xalman-apis.vercel.app/api/ibb";

    let imageUrl;
    if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
      imageUrl = messageReply.attachments[0].url;
    } else {
      return api.sendMessage("╭─❍\n│ Please reply to an image!\n╰───────────⟡", threadID, messageID);
    }

    const waitMsg = await api.sendMessage("Uploading...", threadID, messageID);

    try {
      const res = await axios.post(API_URL, {
        image: imageUrl
      });

      if (res.data.status === true) {
        const displayUrl = res.data.data.display_url;
        return api.editMessage(displayUrl, waitMsg.messageID);
      } else {
        throw new Error();
      }

    } catch (error) {
      return api.editMessage("✕ Failed to upload image!", waitMsg.messageID);
    }
  }
};
