const axios = require('axios');

module.exports = {
  config: {
    name: "ytb",
    version: "3.5.0",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "YouTube Search & Download",
    longDescription: "Search YouTube and reply with 1-5 to download as Video or MP3",
    category: "download",
    guide: "{p}ytb -v <query> or {p}ytb -a <query>"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const BASE_URL = "https://xalman-apis.vercel.app/api";
    const SEARCH_ENDPOINT = `${BASE_URL}/ytsearch`;
    const flag = args[0];
    const query = args.slice(1).join(" ");

    if (!flag || !query || (flag !== "-v" && flag !== "-a")) {
      return api.sendMessage("❌ Usage: /ytb -v <query> (Video) or /ytb -a <query> (Audio)", threadID, messageID);
    }

    try {
      const { data } = await axios.get(`${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}`);
      const results = data.results?.slice(0, 5);

      if (!results || results.length === 0) {
        return api.sendMessage("❌ No results found.", threadID, messageID);
      }

      let msg = `🔍 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗦𝗲𝗮𝗿𝗰𝗵 𝗥𝗲𝘀𝘂𝗹𝘁s\n━━━━━━━━━━━━━━━\n`;
      let attachments = [];

      for (let i = 0; i < results.length; i++) {
        const video = results[i];
        msg += `${i + 1}. ${video.title}\n📺 Channel: ${video.channel}\n⏱️ Duration: ${video.duration}\n\n`;
        
        if (video.thumbnail) {
          const img = await axios.get(video.thumbnail, { responseType: 'stream' });
          attachments.push(img.data);
        }
      }

      msg += `━━━━━━━━━━━━━━━\n📥 Reply with 𝟭-𝟱 to download ${flag === "-v" ? "Video" : "Audio"}.`;

      return api.sendMessage({ body: msg, attachment: attachments }, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          results: results,
          type: flag === "-v" ? "video" : "audio",
          baseUrl: BASE_URL
        });
      }, messageID);

    } catch (e) {
      return api.sendMessage("⚠️ Search failed. Check API link.", threadID, messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, body, senderID } = event;
    const { results, type, author, baseUrl } = Reply;

    if (senderID !== author) return;

    const index = parseInt(body) - 1;
    if (isNaN(index) || index < 0 || index > 4) {
      return api.sendMessage("❌ Invalid selection. Choose 1-5.", threadID, messageID);
    }

    const selected = results[index];
    api.unsendMessage(Reply.messageID);
    const waitMsg = await api.sendMessage(`⏳ Processing ${type.toUpperCase()}...`, threadID);

    try {
      const endpoint = type === "audio" ? "ytmp3" : "ytdl";
      const downloadUrl = `${baseUrl}/${endpoint}?url=${encodeURIComponent(selected.url)}`;
      
      const { data } = await axios.get(downloadUrl);

      if (!data.status || !data.url) {
        return api.editMessage("❌ Failed to fetch download link.", waitMsg.messageID);
      }

      const stream = await axios.get(data.url, { responseType: 'stream' });

      await api.unsendMessage(waitMsg.messageID);
      return api.sendMessage({
        body: `✅ 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗱: ${data.title}\n📂 𝗙𝗼𝗿𝗺𝗮𝘁: ${type.toUpperCase()}`,
        attachment: stream.data
      }, threadID, event.messageID);

    } catch (e) {
      return api.editMessage("⚠️ Download Error! File might be too large.", waitMsg.messageID);
    }
  }
};
