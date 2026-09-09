ADDING A NEW COMMAND
====================

1. Go to:
   commands/

2. Create a new file, for example:
   commands/test.js

3. Put this code:

module.exports = {
    name: 'test',

    aliases: ['t'],

    buttonIds: [],

    async execute(ctx) {
        await ctx.sendText('✅ Test command works!');
    },

    async onButton(ctx) {
        // Optional button handlers.
    }
};

4. Save the file.

5. Restart the bot:
   node bot.js

Now these work:
   test
   .test
   t
   .t

BUTTONS
=======

A command can own button IDs:

buttonIds: ['my_button']

Then handle it:

async onButton(ctx) {
    if (ctx.buttonId === 'my_button') {
        await ctx.sendText('Button clicked!');
    }
}

IMPORTANT
=========

You do NOT need to edit bot.js for normal new commands.
The bot automatically scans commands/*.js when it starts.

The website QR/pairing system is separate from command files.
Do not delete:
   auth_info/
   .env
   your MySQL database
