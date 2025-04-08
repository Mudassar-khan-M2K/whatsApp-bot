const { create, Client } = require('@open-wa/wa-automate');

create().then(client => start(client));

function start(client) {
    client.onMessage(async message => {
        console.log(message);  // Optional: For debugging

        // Respond to "menu" command
        if (message.body === 'menu') {
            await client.sendText(message.from, 'Welcome to the bot! Here are your options:\n1. Download media\n2. Check status');
        } 
        // If a link is shared, attempt to download media
        else if (message.body.startsWith('http')) {
            const validMediaTypes = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm'];
            const isValidMedia = validMediaTypes.some(type => message.body.endsWith(type));

            if (isValidMedia) {
                await downloadMedia(message.body, client, message.from);
            } else {
                await client.sendText(message.from, 'Please send a valid media link (image or video).');
            }
        } 
        // Check bot status
        else if (message.body === 'status') {
            await client.sendText(message.from, 'The bot is running and online!');
        }
    });
}

async function downloadMedia(link, client, from) {
    try {
        const media = await client.downloadMedia({ url: link });
        if (media) {
            await client.sendFile(from, media, 'downloaded_media', 'Here is your media');
        } else {
            await client.sendText(from, 'Sorry, I could not download the media from the link.');
        }
    } catch (err) {
        console.error('Error downloading media:', err);
        await client.sendText(from, 'There was an error while downloading the media.');
    }
}

// Optional: Handle media received directly in messages
client.onMessage(async message => {
    if (message.type === 'image' || message.type === 'video' || message.type === 'document') {
        const media = await client.downloadMedia({ message });
        await client.sendFile(message.from, media, 'received_media', 'Here is your received media');
    }
});
