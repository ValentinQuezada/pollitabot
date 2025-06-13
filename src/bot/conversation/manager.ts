interface ConversationMetadata {
  userId: string;
  startTime: Date;
  lastInteraction: Date;
  context: {
    [key: string]: any;
  };
}

class ConversationManager {
  private static instance: ConversationManager;
  private conversations: Map<string, ConversationMetadata>;

  private constructor() {
    this.conversations = new Map();
  }

  public static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }

  public startConversation(userId: string, initialContext: Record<string, any> = {}): void {
    const metadata: ConversationMetadata = {
      userId,
      startTime: new Date(),
      lastInteraction: new Date(),
      context: initialContext
    };
    this.conversations.set(userId, metadata);
  }

  public endConversation(userId: string): void {
    this.conversations.delete(userId);
  }

  public isActiveConversation(userId: string): boolean {
    return this.conversations.has(userId);
  }

  public updateContext(userId: string, updates: Record<string, any>): void {
    const conversation = this.conversations.get(userId);
    if (conversation) {
      conversation.context = {
        ...conversation.context,
        ...updates
      };
      conversation.lastInteraction = new Date();
      this.conversations.set(userId, conversation);
    }
  }

  public getContext(userId: string): Record<string, any> | null {
    const conversation = this.conversations.get(userId);
    return conversation ? conversation.context : null;
  }

  public updateLastInteraction(userId: string): void {
    const conversation = this.conversations.get(userId);
    if (conversation) {
      conversation.lastInteraction = new Date();
      this.conversations.set(userId, conversation);
    }
  }

  public getConversationMetadata(userId: string): ConversationMetadata | null {
    return this.conversations.get(userId) || null;
  }
}

export default ConversationManager;
