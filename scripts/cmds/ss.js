const axios = require('axios');

module.exports = {
  config: {
    name: "ss",
    version: "2.2.0",
    author: "xalman",
    countDown: 5,
    role: 0,
    description: "Capture website screenshot using Vercel API",
    category: "tools",
    guide: "{pn} <website_url>"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const site = args[0];

    if (!site) {
      return api.sendMessage("❌ Please provide a website URL!", threadID, messageID);
    }

    try {
      const finalApiUrl = `https://xalman-apis.vercel.app/api/screenshot?url=${encodeURIComponent(site)}`;
      const stream = await global.utils.getStreamFromURL(finalApiUrl);
      
      return api.sendMessage({
        body: `✅ Screenshot for: ${site}`,
        attachment: stream
      }, threadID, messageID);

    } catch (e) {
      return api.sendMessage(`❌ Error: ${e.message}`, threadID, messageID);
    }
  }
};
