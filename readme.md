# TBK Moderation

The source code for the official beta testing moderation bot of **The Black Knights (TBK)**, now open-source for the community.

Join us https://discord.gg/R6ajzbanh3

---

## About the Project
Originally developed as an exclusive tool for the TBK community, this bot has been discontinued for our official server but remains a powerful resource for **SBOR** (Sword Blox Online: Rebirth) servers and Discord moderation in general.

We’ve decided to open-source the code so you can host your own instance, learn from the logic, or contribute to its evolution.

## Features
* **Advanced Moderation:** Kick, ban, and mute commands with logging.
* **SBOR Specialized Tools:** Essential functions tailored for SBOR server management (like /accept command).
* **Automation:** Verify system and autoremoval of unverified role. (and extended mute control)
* **Community Focused:** Built to handle high-traffic environments.

## Installation & Setup
To run this bot locally or on your server, follow these steps:

1. **Clone the repository:**
```bash
git clone https://github.com/tBlackKnights/bk-moderation.git
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Variables:**
Create a `.env.development` and `.env.production` files in the root directory and add your credentials:
```env
    DISCORD_CLIENT_ID=bot-id
    DISCORD_BOT_TOKEN=bot-token
    DB_DIALECT=sqlite
    DB_STORAGE=./db.sqlite
```
ˆ This is a minimal env.

4. **Run database migrations and seeds:**
```bash
npm run db:migrate && npm run db:seed
```

5. **Run:**
For local or development:
```bash
npm run dev
```
For production:
```bash
npm start
```

