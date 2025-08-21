interface MessageConstructor {
  messageId: number;
  chatId: number;
  from: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  text: string;
  date?: string;
}

class Message {
  public messageId: number;
  public chatId: number;
  public from: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  public text: string;
  public date: string;

  constructor({ messageId, chatId, from, text, date = new Date().toISOString() }: MessageConstructor) {
    this.messageId = messageId;
    this.chatId = chatId;
    this.from = from;
    this.text = text;
    this.date = date;
  }
}

export default Message; 