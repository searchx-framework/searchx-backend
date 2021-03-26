'use strict';

const mongoose = require('mongoose');
const Chat = mongoose.model('Chat');

////

exports.getChatMessageList = async function(sessionId) {
    const chat = await Chat
        .findOne(
            {sessionId: sessionId},
            {messageList: 1}
        );
    if (chat === null){
        return {messageList: []};
    } else {
        return chat;
    }
};

exports.addChatMessage = async function(sessionId, message) {
    
    const initializeChat = async function(message) {
        const chat = new Chat({
            created: new Date(),
            sessionId: sessionId,
            messageList: []
        });
        if (message) {
            chat.messageList.push(message);
        }
        await chat.save();
        return chat;
    };
    const query = {
        "sessionId": sessionId
    }

    let chat = await Chat.findOne(query);
    if (chat === null) {
        chat = await initializeChat(message);
    } else {
        if (message) {
            chat.messageList.push(message);
            chat.markModified('messageList');
            await chat.save();
        }
    }
    return chat.messageList;
};