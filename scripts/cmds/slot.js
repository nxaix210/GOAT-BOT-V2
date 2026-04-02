module.exports = {
    config: {
        name: "slot",
        version: "5.0",
        author: "xalman",
        role: 0,
        countDown: 5,
        category: "game",
        guide: {
            en: "{pn} <amount>"
        }
    },

    onStart: async ({ message, event, args, usersData, api }) => {
        const { senderID, threadID } = event;

        const formatMoney = (num) => {
            const n = Number(num);
            if (n === Infinity || isNaN(n)) return "∞ Unlimited";
            if (n < 1000) return n.toFixed(0);
            const units = [
                { v: 1e30, s: "No" }, { v: 1e27, s: "Oc" }, { v: 1e24, s: "Sp" },
                { v: 1e21, s: "Sx" }, { v: 1e18, s: "Qi" }, { v: 1e15, s: "Q" },
                { v: 1e12, s: "T" }, { v: 1e9, s: "B" }, { v: 1e6, s: "M" }, { v: 1e3, s: "K" }
            ];
            for (let i = 0; i < units.length; i++) {
                if (n >= units[i].v) return (n / units[i].v).toFixed(2).replace(/\.00$/, '') + units[i].s;
            }
            return n.toLocaleString();
        };

        function parseAmount(input) {
            if (!input) return NaN;
            let amount = input.toLowerCase();
            let res;
            if (amount.endsWith('k')) res = parseFloat(amount) * 1e3;
            else if (amount.endsWith('m')) res = parseFloat(amount) * 1e6;
            else if (amount.endsWith('b')) res = parseFloat(amount) * 1e9;
            else if (amount.endsWith('t')) res = parseFloat(amount) * 1e12;
            else if (amount.endsWith('q')) res = parseFloat(amount) * 1e15;
            else res = parseInt(amount);
            return res;
        }

        const betAmount = parseAmount(args[0]);
        const minBet = 100;
        const maxBet = 100000000000;

        if (isNaN(betAmount) || betAmount < minBet) {
            return message.reply(`🎰 Minimum bet amount is 100$.\nExample: /slot 1k`);
        }
        if (betAmount > maxBet) {
            return message.reply(`🚫 Maximum bet limit is ${formatMoney(maxBet)}$!`);
        }

        const userData = await usersData.get(senderID);
        const currentMoney = Number(userData.money || 0);
        if (betAmount > currentMoney) {
            return message.reply(`💸 You don't have enough balance!\nCurrent balance: ${formatMoney(currentMoney)}$`);
        }

        if (!global.slotLimit) global.slotLimit = {};
        const now = Date.now();
        if (!global.slotLimit[senderID] || (now - global.slotLimit[senderID].lastReset > 3600000)) {
            global.slotLimit[senderID] = { count: 0, lastReset: now };
        }
        if (global.slotLimit[senderID].count >= 200) {
            return message.reply(`🚫 Limit reached! Try again later.`);
        }

        const items = ["🍎", "🍐", "🍑", "🍒", "🍓", "🍇", "🍉", "🍊", "🍋", "🍌", "🍍", "🥭"];
        let s = [];
        const winRoll = Math.random() * 100;
        let forceMatch = 0;

        if (winRoll <= 5) forceMatch = 6;
        else if (winRoll <= 5) forceMatch = 5;
        else if (winRoll <= 10) forceMatch = 4;
        else if (winRoll <= 25) forceMatch = 3;
        else if (winRoll <= 35) forceMatch = 2;

        if (forceMatch > 0) {
            const luckyItem = items[Math.floor(Math.random() * items.length)];
            s = Array(6).fill(null).map((_, i) => i < forceMatch ? luckyItem : items[Math.floor(Math.random() * items.length)]);
            s = s.sort(() => Math.random() - 0.5);
        } else {
            s = Array.from({ length: 6 }, () => items[Math.floor(Math.random() * items.length)]);
        }

        global.slotLimit[senderID].count++;
        const sentMessage = await message.reply(`🎰 | SLOT MACHINE\n──────────────\n [ ❓ | ❓ | ❓ | ❓ | ❓ | ❓ ]\n──────────────\n⌛ Spinning...`);
        
        await new Promise(r => setTimeout(r, 1000));
        await api.editMessage(`🎰 | SLOT MACHINE\n──────────────\n [ ${s[0]} | ${s[1]} | ${s[2]} | ❓ | ❓ | ❓ ]\n──────────────\n⌛ Spinning...`, sentMessage.messageID, threadID);
        await new Promise(r => setTimeout(r, 1000));

        const counts = {};
        s.forEach(item => counts[item] = (counts[item] || 0) + 1);
        const maxMatch = Math.max(...Object.values(counts));

        let win = maxMatch >= 2;
        let bonus = win ? Math.floor(betAmount * maxMatch) : 0;
        let finalMoney = win ? currentMoney + bonus : currentMoney - betAmount;

        await usersData.set(senderID, { money: finalMoney.toString() });

        const status = win ? `WINNER! (${maxMatch}x Match) 🎉` : "LOST! 💀";
        return api.editMessage(`🎰 | SLOT MACHINE\n──────────────\n [ ${s[0]} | ${s[1]} | ${s[2]} | ${s[3]} | ${s[4]} | ${s[5]} ]\n──────────────\n📢 ${status}\n💰 ${win ? "You won: " + formatMoney(bonus) : "You lost: " + formatMoney(betAmount)}৳\n💳 Balance: ${formatMoney(finalMoney)}$\n📊 Usage: ${global.slotLimit[senderID].count}/200`, sentMessage.messageID, threadID);
    }
};
