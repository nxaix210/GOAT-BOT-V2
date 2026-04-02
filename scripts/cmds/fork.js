module.exports = {
  config: {
    name: "fork",
    version: "2.8",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Show  repository info",
    category: "utils",
    guide: {
      en: "{p}fork"
    }
  },

  langs: {
    en: {
      current: "╭━━━〔 𝐆𝐎𝐀𝐓-𝐁𝐎𝐓-𝐕𝟐 〕━━━⦿\n┃\n┃ 👑 𝗢𝘄𝗻𝗲𝗿: 𝖷𝖺𝗅𝗆𝖺𝗇 𝖧𝗈𝗌𝗌𝖺𝗂𝗇\n┃ 🔗 𝗥𝗲𝗽𝗼: %1\n┃ 💎 𝗦𝘁𝗮𝘁𝘂𝘀: always updating\n┃\n┃ ❝ 𝖳𝗁𝖾 𝖦𝗋𝖾𝖺𝗍𝖾𝗌𝗍 𝖮𝖿 𝖠𝗅𝗅 𝖳𝗂𝗆𝖾 𝖠𝗎𝗍𝗈𝗆𝖺𝗍𝗂𝗈𝗇 ❞\n┃\n╰━━━━━━〔 📥 〕━━━━━━⦿"
    }
  },

  onStart: async function ({ message, getLang }) {
    const link = "https://github.com/goatbotnx/GOAT-BOT-V2";
    return message.reply(getLang("current", link));
  },

  onChat: async function ({ message, getLang, event }) {
    if (event.body && event.body.toLowerCase() === "fork") {
      const link = "https://github.com/goatbotnx/GOAT-BOT-V2";
      return message.reply(getLang("current", link));
    }
  }
};
