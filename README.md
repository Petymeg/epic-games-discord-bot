## Both:

**Install dependencies:**

```
npm i
```

**Create a .env File (in 'functions' subfolder for Firebase):**

```
DISCORD_TOKEN=your_discord_bot_token
CHANNEL_ID=your_channel_id
```

## Firebase

**Install Firebase-specific dependencies:**

```
npm install -g firebase-tools
firebase login
```

**Deploy:**

```
firebase deploy --only functions
```

## Local

**Run:**

```
node bot.js
```
