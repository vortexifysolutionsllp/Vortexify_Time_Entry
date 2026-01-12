import { LightningElement, track } from 'lwc';

export default class Chatportal extends LightningElement {
    @track chats = [
        { id: 1, name: 'Fikri Ruslandi', message: 'Ko, Kumaha Project anu eta...', time: '2 min', unread: 1 },
        { id: 2, name: 'Moch Ramdhani', message: 'Ane menang contes $1000...', time: '5 min', unread: 2 },
        { id: 3, name: 'Abu Abdullah Nugraha', message: 'is typing a message...', time: '', unread: 0 },
        { id: 4, name: 'Muhammad Fauzi', message: 'Ko, Minjem satu basket ja...', time: '9 min', unread: 0 }
    ];

    @track activeChat = {
        id: 3,
        name: 'Abu Abdullah Nugraha',
        messages: [
            { id: 1, text: 'Nanti kita technical meeting lomba jogja', incoming: true },
            { id: 2, text: 'Semua satu team Tione yang berangkat ke jogja?', incoming: false },
            { id: 3, text: 'Iya, semua kita berangkat pake pesawat...', incoming: true },
            { id: 4, text: 'Ok, berarti kita beberapa hari disana?', incoming: false }
        ]
    };

    newMessage = '';

    // decorate chats for CSS
    get decoratedChats() {
        return this.chats.map(chat => {
            return {
                ...chat,
                cssClass: `chat-item ${chat.id === this.activeChat.id ? 'active' : ''}`
            };
        });
    }

    // decorate messages for CSS
    get decoratedMessages() {
        return this.activeChat.messages.map(msg => {
            return {
                ...msg,
                cssClass: msg.incoming ? 'message incoming' : 'message outgoing'
            };
        });
    }

    handleChatClick(event) {
        const chatId = parseInt(event.currentTarget.dataset.id, 10);
        this.activeChat = this.chats.find(chat => chat.id === chatId);
    }

    handleInput(event) {
        this.newMessage = event.target.value;
    }

    sendMessage() {
        if (this.newMessage.trim() !== '') {
            this.activeChat = {
                ...this.activeChat,
                messages: [
                    ...this.activeChat.messages,
                    { id: Date.now(), text: this.newMessage, incoming: false }
                ]
            };
            this.newMessage = '';
        }
    }
}