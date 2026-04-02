const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

module.exports = {
  config: {
    name: "googleimagesearch",
    aliases: ["googleimg"],
    version: "4.0",
    author: "xalman",
    countDown: 15,
    role: 0,
    shortDescription: "Premium 21-Image Canvas Grid",
    longDescription: "Search images and get a high-quality 3x7 grid using Canvas.",
    category: "tools",
    guide: { en: "{p}google <query>" }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) return api.sendMessage("Please enter a search query!", event.threadID, event.messageID);

    try {
      const waitMsg = await api.sendMessage(`searching image  for "${query}"...`, event.threadID);

      const res = await axios.get(`https://xalman-apis.vercel.app/api/google-image`, {
        params: { q: query, count: 21, json: "true" }
      });

      const images = res.data.data;
      if (!images || images.length < 1) return api.sendMessage("No images found!", event.threadID);

      const colCount = 3;
      const rowCount = 7;
      const padding = 15;
      const tileSize = 350;
      const headerHeight = 130;
      const footerHeight = 90;

      const canvasWidth = (tileSize * colCount) + (padding * (colCount + 1));
      const canvasHeight = headerHeight + (tileSize * rowCount) + (padding * (rowCount + 1)) + footerHeight;

      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0e1a');
      gradient.addColorStop(1, '#1a1f2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#0f1422";
      ctx.fillRect(0, 0, canvas.width, headerHeight);
      
      ctx.strokeStyle = "#00ffaa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.stroke();
      
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00ffaa";
      ctx.strokeStyle = "#00ffaa";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, headerHeight - 2);
      ctx.lineTo(canvas.width, headerHeight - 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(0, 255, 170, 0.5)";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px 'Segoe UI', 'Poppins', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Results for: ${query} (21)`, canvas.width / 2, 75);
      
      ctx.font = "24px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#00ffaa";
      ctx.fillText(`Image Search API`, canvas.width / 2, 115);
      ctx.shadowBlur = 0;

      let x = padding;
      let y = headerHeight + padding;

      for (let i = 0; i < images.length; i++) {
        try {
          const img = await loadImage(images[i]);
          
          ctx.save();
          
          ctx.shadowBlur = 15;
          ctx.shadowColor = "rgba(0, 255, 170, 0.3)";
          
          ctx.beginPath();
          ctx.moveTo(x + 12, y);
          ctx.lineTo(x + tileSize - 12, y);
          ctx.quadraticCurveTo(x + tileSize, y, x + tileSize, y + 12);
          ctx.lineTo(x + tileSize, y + tileSize - 12);
          ctx.quadraticCurveTo(x + tileSize, y + tileSize, x + tileSize - 12, y + tileSize);
          ctx.lineTo(x + 12, y + tileSize);
          ctx.quadraticCurveTo(x, y + tileSize, x, y + tileSize - 12);
          ctx.lineTo(x, y + 12);
          ctx.quadraticCurveTo(x, y, x + 12, y);
          ctx.closePath();
          ctx.clip();
          
          ctx.drawImage(img, x, y, tileSize, tileSize);
          ctx.restore();

          const borderGradient = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
          borderGradient.addColorStop(0, '#00ffaa');
          borderGradient.addColorStop(1, '#00cc88');
          ctx.strokeStyle = borderGradient;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(x + 12, y);
          ctx.lineTo(x + tileSize - 12, y);
          ctx.quadraticCurveTo(x + tileSize, y, x + tileSize, y + 12);
          ctx.lineTo(x + tileSize, y + tileSize - 12);
          ctx.quadraticCurveTo(x + tileSize, y + tileSize, x + tileSize - 12, y + tileSize);
          ctx.lineTo(x + 12, y + tileSize);
          ctx.quadraticCurveTo(x, y + tileSize, x, y + tileSize - 12);
          ctx.lineTo(x, y + 12);
          ctx.quadraticCurveTo(x, y, x + 12, y);
          ctx.closePath();
          ctx.stroke();

          ctx.shadowBlur = 5;
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          
          const badgeGradient = ctx.createLinearGradient(x + 10, y + 10, x + 50, y + 50);
          badgeGradient.addColorStop(0, '#00ffaa');
          badgeGradient.addColorStop(1, '#00cc88');
          ctx.fillStyle = badgeGradient;
          ctx.beginPath();
          ctx.arc(x + 30, y + 30, 22, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = "#0f1422";
          ctx.beginPath();
          ctx.arc(x + 30, y + 30, 18, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = "#00ffaa";
          ctx.font = "bold 20px 'Segoe UI', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(i + 1, x + 30, y + 38);
          
          if (i < 3) {
            ctx.fillStyle = "rgba(0, 255, 170, 0.9)";
            ctx.font = "bold 12px 'Segoe UI', sans-serif";
            ctx.fillText("HD", x + tileSize - 35, y + 25);
          }
          
          ctx.shadowBlur = 0;

          x += tileSize + padding;
          if ((i + 1) % colCount === 0) {
            x = padding;
            y += tileSize + padding;
          }
        } catch (e) {
          console.error(`Failed to load image ${i}:`, e.message);
          continue;
        }
      }

      const footerY = canvasHeight - footerHeight;
      
      const footerGradient = ctx.createLinearGradient(0, footerY, 0, canvas.height);
      footerGradient.addColorStop(0, '#0f1422');
      footerGradient.addColorStop(1, '#1a1f2e');
      ctx.fillStyle = footerGradient;
      ctx.fillRect(0, footerY, canvas.width, footerHeight);
      
      ctx.strokeStyle = "#00ffaa";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, footerY);
      ctx.lineTo(canvas.width, footerY);
      ctx.stroke();
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "24px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✨ Image Search ✨", canvas.width / 2, canvas.height - 45);
      
      ctx.font = "16px 'Segoe UI', sans-serif";
      ctx.fillStyle = "#888888";
      ctx.fillText(`21 Images | 3x7 Grid | Premium Quality`, canvas.width / 2, canvas.height - 20);
      
      ctx.font = "12px 'Segoe UI', sans-serif";
      ctx.fillStyle = "rgba(0, 255, 170, 0.5)";
      ctx.fillText("Powered by API", canvas.width - 120, canvas.height - 10);
      ctx.fillText("Premium Grid", 15, canvas.height - 10);

      const path = __dirname + `/cache/google_21_${event.senderID}.png`;
      fs.writeFileSync(path, canvas.toBuffer());

      api.unsendMessage(waitMsg.messageID);
      const msg = await api.sendMessage({
        body: `✅ "${query}" - images grid generated!\n📸 Reply 1-21 to get original images.\n🎨 Quality: Premium HD`,
        attachment: fs.createReadStream(path)
      }, event.threadID);

      global.GoatBot.onReply.set(msg.messageID, {
        commandName: this.config.name,
        messageID: msg.messageID,
        author: event.senderID,
        images: images
      });

    } catch (error) {
      console.error("Error:", error);
      return api.sendMessage("Server error! Please try again.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { images, author } = Reply;
    if (event.senderID !== author) return;

    const num = parseInt(args[0]);
    if (isNaN(num) || num < 1 || num > images.length) return;

    try {
      const waitMsg = await api.sendMessage(`Downloading image ${num}...`, event.threadID);
      
      const stream = (await axios.get(images[num - 1], { responseType: 'stream' })).data;
      
      api.unsendMessage(waitMsg.messageID);
      return api.sendMessage({
        body: `📸 ${num}! 🎨 Quality: Original HD`,
        attachment: stream
      }, event.threadID, event.messageID);
    } catch (e) {
      return api.sendMessage("Failed to download image! Try another one.", event.threadID);
    }
  },

  drawRoundedRect: function (ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
};
