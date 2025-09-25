import { Env, ChatMessage, TrainingSession, WorkflowState, User } from '../../shared/types';

export class StateManager {
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      switch (path) {
        case '/get-context':
          return this.getSessionContext(request);
        case '/store-messages':
          return this.storeMessages(request);
        case '/get-session':
          return this.getSession(request);
        case '/update-session':
          return this.updateSession(request);
        case '/get-chat-history':
          return this.getChatHistory(request);
        case '/update-workflow':
          return this.updateWorkflow(request);
        case '/get-workflow':
          return this.getWorkflow(request);
        case '/cleanup':
          return this.cleanupSession(request);
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('StateManager error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  private async getSessionContext(request: Request): Promise<Response> {
    const sessionId = request.headers.get('X-Session-ID') || 'default';
    
    const session = await this.state.storage.get<TrainingSession>(`session:${sessionId}`);
    const workflow = await this.state.storage.get<WorkflowState>(`workflow:${sessionId}`);
    const user = await this.state.storage.get<User>(`user:${sessionId}`);

    const context = {
      sessionId,
      session,
      workflow,
      user,
      timestamp: new Date()
    };

    return new Response(JSON.stringify(context), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async storeMessages(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const body = await request.json() as { messages: ChatMessage[] };
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid messages format', { status: 400 });
    }

    const sessionId = messages[0]?.sessionId;
    if (!sessionId) {
      return new Response('Missing sessionId', { status: 400 });
    }

    // Store messages in chronological order
    for (const message of messages) {
      const key = `message:${sessionId}:${message.timestamp.getTime()}`;
      await this.state.storage.put(key, message);
    }

    // Update session last activity
    const session = await this.state.storage.get<TrainingSession>(`session:${sessionId}`);
    if (session) {
      session.progress.timeSpent += 1; // Increment time spent
      await this.state.storage.put(`session:${sessionId}`, session);
    }

    return new Response(JSON.stringify({ success: true, count: messages.length }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async getSession(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return new Response('Missing sessionId', { status: 400 });
    }

    const session = await this.state.storage.get<TrainingSession>(`session:${sessionId}`);
    
    if (!session) {
      return new Response('Session not found', { status: 404 });
    }

    return new Response(JSON.stringify(session), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async updateSession(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const body = await request.json() as Partial<TrainingSession>;
    const sessionId = body.id;

    if (!sessionId) {
      return new Response('Missing session ID', { status: 400 });
    }

    const existingSession = await this.state.storage.get<TrainingSession>(`session:${sessionId}`);
    
    if (!existingSession) {
      return new Response('Session not found', { status: 404 });
    }

    // Merge updates with existing session
    const updatedSession: TrainingSession = {
      ...existingSession,
      ...body,
      id: sessionId // Ensure ID doesn't change
    };

    await this.state.storage.put(`session:${sessionId}`, updatedSession);

    return new Response(JSON.stringify(updatedSession), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async getChatHistory(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (!sessionId) {
      return new Response('Missing sessionId', { status: 400 });
    }

    // Get all message keys for this session
    const messageKeys = await this.state.storage.list({
      prefix: `message:${sessionId}:`
    });

    // Sort by timestamp (key includes timestamp)
    const sortedKeys = Array.from(messageKeys.keys()).sort();
    
    // Get the most recent messages
    const recentKeys = sortedKeys.slice(-limit);
    
    const messages: ChatMessage[] = [];
    for (const key of recentKeys) {
      const message = await this.state.storage.get<ChatMessage>(key);
      if (message) {
        messages.push(message);
      }
    }

    return new Response(JSON.stringify(messages), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async updateWorkflow(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const body = await request.json() as Partial<WorkflowState>;
    const sessionId = body.sessionId;

    if (!sessionId) {
      return new Response('Missing sessionId', { status: 400 });
    }

    const existingWorkflow = await this.state.storage.get<WorkflowState>(`workflow:${sessionId}`);
    
    const updatedWorkflow: WorkflowState = {
      id: existingWorkflow?.id || crypto.randomUUID(),
      sessionId,
      currentPhase: body.currentPhase || existingWorkflow?.currentPhase || { id: 'detection', name: 'Detection', description: 'Initial detection', order: 1, required: true, completed: false, outcomes: [] },
      completedPhases: body.completedPhases || existingWorkflow?.completedPhases || [],
      nextActions: body.nextActions || existingWorkflow?.nextActions || [],
      context: { ...existingWorkflow?.context, ...body.context },
      lastUpdated: new Date()
    };

    await this.state.storage.put(`workflow:${sessionId}`, updatedWorkflow);

    return new Response(JSON.stringify(updatedWorkflow), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async getWorkflow(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return new Response('Missing sessionId', { status: 400 });
    }

    const workflow = await this.state.storage.get<WorkflowState>(`workflow:${sessionId}`);
    
    if (!workflow) {
      return new Response('Workflow not found', { status: 404 });
    }

    return new Response(JSON.stringify(workflow), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async cleanupSession(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const body = await request.json() as { sessionId: string };
    const { sessionId } = body;

    if (!sessionId) {
      return new Response('Missing sessionId', { status: 400 });
    }

    // Get all keys related to this session
    const sessionKeys = await this.state.storage.list({
      prefix: `session:${sessionId}`
    });
    
    const workflowKeys = await this.state.storage.list({
      prefix: `workflow:${sessionId}`
    });
    
    const messageKeys = await this.state.storage.list({
      prefix: `message:${sessionId}:`
    });

    // Delete all session-related data
    const keysToDelete = [
      ...Array.from(sessionKeys.keys()),
      ...Array.from(workflowKeys.keys()),
      ...Array.from(messageKeys.keys())
    ];

    await this.state.storage.delete(keysToDelete);

    return new Response(JSON.stringify({ 
      success: true, 
      deletedKeys: keysToDelete.length 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Export the Durable Object class
export { StateManager as StateManagerDO };
