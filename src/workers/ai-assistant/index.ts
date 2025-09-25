import { Env, AIResponse, ChatMessage, APIResponse, IncidentScenario } from '../../shared/types';
import { AI_MODELS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../shared/constants';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route handling
      switch (path) {
        case '/api/ai/chat':
          return handleChat(request, env, ctx);
        case '/api/ai/voice':
          return handleVoice(request, env, ctx);
        case '/api/ai/analysis':
          return handleAnalysis(request, env, ctx);
        case '/api/ai/health':
          return handleHealth(request, env, ctx);
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('AI Assistant Worker Error:', error);
      return createErrorResponse(ERROR_MESSAGES.AI_UNAVAILABLE, 500);
    }
  },
};

async function handleChat(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await request.json() as {
      sessionId: string;
      message: string;
      context?: Record<string, any>;
      scenarioId?: string;
    };

    const { sessionId, message, context, scenarioId } = body;

    if (!sessionId || !message) {
      return createErrorResponse('Missing required fields: sessionId and message', 400);
    }

    // Get session context from Durable Object
    const stateManager = env.STATE_MANAGER.get(env.STATE_MANAGER.idFromName(sessionId));
    const sessionContext = await stateManager.fetch(new Request('http://internal/get-context'));

    // Generate AI response using Llama 3.3
    const aiResponse = await generateAIResponse(
      message,
      sessionContext,
      context,
      scenarioId,
      env
    );

    // Store the conversation in session
    const chatMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId,
      type: 'ai',
      content: aiResponse.message,
      timestamp: new Date(),
      metadata: {
        confidence: aiResponse.confidence,
        intent: aiResponse.type
      }
    };

    // Store messages in session
    await stateManager.fetch(new Request('http://internal/store-messages', {
      method: 'POST',
      body: JSON.stringify({ messages: [chatMessage, aiMessage] })
    }));

    return createSuccessResponse(aiResponse);

  } catch (error) {
    console.error('Chat handler error:', error);
    return createErrorResponse(ERROR_MESSAGES.AI_UNAVAILABLE, 500);
  }
}

async function handleVoice(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!audioFile || !sessionId) {
      return createErrorResponse('Missing audio file or sessionId', 400);
    }

    // Convert audio to text (simplified - in production, use proper speech-to-text)
    const transcript = await processAudioToText(audioFile, env);

    // Process the transcript as a chat message
    const chatRequest = new Request('http://internal/chat', {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        message: transcript,
        context: { voiceInput: true }
      })
    });

    const response = await handleChat(chatRequest, env, ctx);
    const aiResponse = await response.json() as APIResponse<AIResponse>;

    // Convert AI response to speech (simplified)
    const audioResponse = await textToSpeech(aiResponse.data?.message || '', env);

    return new Response(audioResponse, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="response.wav"'
      }
    });

  } catch (error) {
    console.error('Voice handler error:', error);
    return createErrorResponse(ERROR_MESSAGES.AI_UNAVAILABLE, 500);
  }
}

async function handleAnalysis(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await request.json() as {
      incidentData: Record<string, any>;
      scenarioId?: string;
      analysisType: 'initial' | 'deep' | 'forensic';
    };

    const { incidentData, scenarioId, analysisType } = body;

    // Generate comprehensive incident analysis
    const analysis = await generateIncidentAnalysis(
      incidentData,
      analysisType,
      scenarioId,
      env
    );

    return createSuccessResponse(analysis);

  } catch (error) {
    console.error('Analysis handler error:', error);
    return createErrorResponse(ERROR_MESSAGES.AI_UNAVAILABLE, 500);
  }
}

async function handleHealth(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  try {
    // Test AI model availability
    const testResponse = await env.AI.run(AI_MODELS.FAST, {
      messages: [{ role: 'user', content: 'Hello, are you working?' }]
    });

    return createSuccessResponse({
      status: 'healthy',
      aiModel: AI_MODELS.FAST,
      response: testResponse.response,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Health check error:', error);
    return createErrorResponse('AI service unhealthy', 503);
  }
}

async function generateAIResponse(
  message: string,
  sessionContext: any,
  context: Record<string, any> = {},
  scenarioId: string | undefined,
  env: Env
): Promise<AIResponse> {
  // Build context-aware prompt
  const systemPrompt = buildSystemPrompt(sessionContext, scenarioId, context);
  
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ];

  try {
    // Use primary model for complex responses, fast model for simple ones
    const model = shouldUsePrimaryModel(message, context) ? AI_MODELS.PRIMARY : AI_MODELS.FAST;
    
    const response = await env.AI.run(model, { messages });

    return {
      id: crypto.randomUUID(),
      sessionId: sessionContext?.sessionId || 'unknown',
      message: response.response,
      type: determineResponseType(message, response.response),
      confidence: calculateConfidence(response.response),
      suggestedActions: extractSuggestedActions(response.response),
      references: extractReferences(response.response),
      timestamp: new Date()
    };

  } catch (error) {
    console.error('AI generation error:', error);
    throw new Error('Failed to generate AI response');
  }
}

async function generateIncidentAnalysis(
  incidentData: Record<string, any>,
  analysisType: string,
  scenarioId: string | undefined,
  env: Env
): Promise<any> {
  const analysisPrompt = buildAnalysisPrompt(incidentData, analysisType, scenarioId);

  const messages = [
    { role: 'system', content: analysisPrompt },
    { role: 'user', content: `Analyze this incident data: ${JSON.stringify(incidentData)}` }
  ];

  try {
    const response = await env.AI.run(AI_MODELS.PRIMARY, { messages });

    return {
      analysis: response.response,
      type: analysisType,
      confidence: calculateConfidence(response.response),
      recommendations: extractRecommendations(response.response),
      riskLevel: assessRiskLevel(response.response),
      timestamp: new Date()
    };

  } catch (error) {
    console.error('Analysis generation error:', error);
    throw new Error('Failed to generate incident analysis');
  }
}

function buildSystemPrompt(sessionContext: any, scenarioId: string | undefined, context: Record<string, any>): string {
  const basePrompt = `You are an expert cybersecurity incident response trainer and advisor. You help security professionals learn and practice incident response procedures through interactive training scenarios.

Your role:
- Provide clear, actionable guidance during incident response training
- Ask probing questions to test understanding
- Offer hints when users are stuck
- Explain complex concepts in accessible terms
- Maintain a professional but encouraging tone

Current context:
- Session: ${sessionContext?.sessionId || 'new session'}
- Scenario: ${scenarioId || 'general training'}
- User level: ${sessionContext?.userLevel || 'intermediate'}
- Voice input: ${context.voiceInput ? 'enabled' : 'disabled'}

Guidelines:
- Always prioritize security best practices
- Provide step-by-step guidance when appropriate
- Encourage critical thinking
- Reference relevant frameworks (NIST, SANS, etc.)
- Keep responses concise but comprehensive`;

  if (scenarioId) {
    return basePrompt + `\n\nCurrent training scenario: ${scenarioId}. Focus your responses on this specific incident type and its response procedures.`;
  }

  return basePrompt;
}

function buildAnalysisPrompt(incidentData: Record<string, any>, analysisType: string, scenarioId: string | undefined): string {
  return `You are a senior cybersecurity analyst conducting ${analysisType} incident analysis.

Analyze the provided incident data and provide:
1. Threat assessment and classification
2. Impact analysis
3. Root cause analysis (if applicable)
4. Recommended response actions
5. Risk mitigation strategies
6. Lessons learned opportunities

Be thorough, evidence-based, and actionable in your analysis.`;
}

function shouldUsePrimaryModel(message: string, context: Record<string, any>): boolean {
  // Use primary model for complex queries, analysis requests, or when high accuracy is needed
  const complexKeywords = ['analyze', 'investigate', 'forensic', 'deep dive', 'comprehensive'];
  const hasComplexKeywords = complexKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
  
  return hasComplexKeywords || context.requiresDeepAnalysis || message.length > 200;
}

function determineResponseType(message: string, response: string): 'guidance' | 'question' | 'feedback' | 'escalation' {
  if (response.includes('?')) return 'question';
  if (response.toLowerCase().includes('escalate')) return 'escalation';
  if (response.toLowerCase().includes('good job') || response.toLowerCase().includes('correct')) return 'feedback';
  return 'guidance';
}

function calculateConfidence(response: string): number {
  // Simple confidence calculation based on response characteristics
  const confidenceIndicators = [
    response.length > 100, // Detailed responses
    response.includes('recommend'), // Actionable recommendations
    response.includes('because'), // Explanations
    !response.includes('unclear'), // Clear language
    !response.includes('might') // Definite statements
  ];
  
  return confidenceIndicators.filter(Boolean).length / confidenceIndicators.length;
}

function extractSuggestedActions(response: string): string[] {
  const actions: string[] = [];
  const actionPatterns = [
    /(?:recommend|suggest|should|need to)\s+([^.!?]+)/gi,
    /(?:first|next|then)\s+([^.!?]+)/gi,
    /(?:action|step|procedure)\s*:?\s*([^.!?]+)/gi
  ];
  
  actionPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches) {
      actions.push(...matches.map(match => match.trim()));
    }
  });
  
  return actions.slice(0, 5); // Limit to 5 actions
}

function extractReferences(response: string): string[] {
  const references: string[] = [];
  const refPatterns = [
    /(?:NIST|SANS|ISO|RFC)\s*\d+/gi,
    /(?:CVE|CWE)-\d+/gi,
    /(?:OWASP|MITRE)\s+[A-Z]+/gi
  ];
  
  refPatterns.forEach(pattern => {
    const matches = response.match(pattern);
    if (matches) {
      references.push(...matches);
    }
  });
  
  return references;
}

function extractRecommendations(response: string): string[] {
  return extractSuggestedActions(response); // Same logic for now
}

function assessRiskLevel(response: string): 'low' | 'medium' | 'high' | 'critical' {
  const criticalKeywords = ['critical', 'severe', 'immediate', 'urgent'];
  const highKeywords = ['high', 'significant', 'serious'];
  const mediumKeywords = ['moderate', 'medium', 'concerning'];
  
  const lowerResponse = response.toLowerCase();
  
  if (criticalKeywords.some(keyword => lowerResponse.includes(keyword))) return 'critical';
  if (highKeywords.some(keyword => lowerResponse.includes(keyword))) return 'high';
  if (mediumKeywords.some(keyword => lowerResponse.includes(keyword))) return 'medium';
  return 'low';
}

// Simplified audio processing functions (in production, use proper services)
async function processAudioToText(audioFile: File, env: Env): Promise<string> {
  // This is a placeholder - in production, integrate with proper speech-to-text service
  // For now, return a mock transcript
  return "This is a mock transcript of the audio input. In production, this would use a proper speech-to-text service.";
}

async function textToSpeech(text: string, env: Env): Promise<ArrayBuffer> {
  // This is a placeholder - in production, integrate with proper text-to-speech service
  // For now, return a mock audio buffer
  return new ArrayBuffer(0);
}

function createSuccessResponse<T>(data: T): Response {
  const response: APIResponse<T> = {
    success: true,
    data,
    timestamp: new Date()
  };
  
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function createErrorResponse(message: string, status: number = 400): Response {
  const response: APIResponse = {
    success: false,
    error: message,
    timestamp: new Date()
  };
  
  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
