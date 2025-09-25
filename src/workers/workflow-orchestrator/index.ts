import { Env, WorkflowState, WorkflowPhase, TrainingSession, IncidentScenario, APIResponse } from '../../shared/types';
import { WORKFLOW_PHASES, INCIDENT_CATEGORIES, API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../shared/constants';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route handling
      switch (path) {
        case '/api/workflow/start':
          return handleStartWorkflow(request, env, ctx);
        case '/api/workflow/update':
          return handleUpdateWorkflow(request, env, ctx);
        case '/api/workflow/status':
          return handleGetWorkflowStatus(request, env, ctx);
        case '/api/workflow/complete':
          return handleCompleteWorkflow(request, env, ctx);
        case '/api/workflow/next-step':
          return handleNextStep(request, env, ctx);
        case '/api/workflow/validate':
          return handleValidateStep(request, env, ctx);
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Workflow Orchestrator Error:', error);
      return createErrorResponse(ERROR_MESSAGES.WORKFLOW_ERROR, 500);
    }
  },
};

async function handleStartWorkflow(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await request.json() as {
      sessionId: string;
      scenarioId: string;
      userId: string;
      incidentType?: string;
    };

    const { sessionId, scenarioId, userId, incidentType } = body;

    if (!sessionId || !scenarioId || !userId) {
      return createErrorResponse('Missing required fields: sessionId, scenarioId, userId', 400);
    }

    // Get scenario details
    const scenario = await getScenario(scenarioId, env);
    if (!scenario) {
      return createErrorResponse('Scenario not found', 404);
    }

    // Initialize workflow state
    const workflowState = await initializeWorkflow(sessionId, scenario, incidentType, env);

    // Create training session
    const trainingSession = await createTrainingSession(sessionId, scenarioId, userId, env);

    // Store workflow and session in Durable Object
    const stateManager = env.STATE_MANAGER.get(env.STATE_MANAGER.idFromName(sessionId));
    
    await stateManager.fetch(new Request('http://internal/update-workflow', {
      method: 'POST',
      body: JSON.stringify(workflowState)
    }));

    await stateManager.fetch(new Request('http://internal/update-session', {
      method: 'POST',
      body: JSON.stringify(trainingSession)
    }));

    return createSuccessResponse({
      workflow: workflowState,
      session: trainingSession,
      message: SUCCESS_MESSAGES.SESSION_CREATED
    });

  } catch (error) {
    console.error('Start workflow error:', error);
    return createErrorResponse(ERROR_MESSAGES.WORKFLOW_ERROR, 500);
  }
}

async function handleUpdateWorkflow(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await request.json() as {
      sessionId: string;
      phaseId: string;
      action: string;
      context?: Record<string, any>;
      completed?: boolean;
    };

    const { sessionId, phaseId, action, context, completed } = body;

    if (!sessionId || !phaseId || !action) {
      return createErrorResponse('Missing required fields: sessionId, phaseId, action', 400);
    }

    // Get current workflow state
    const stateManager = env.STATE_MANAGER.get(env.STATE_MANAGER.idFromName(sessionId));
    const workflowResponse = await stateManager.fetch(new Request(`http://internal/get-workflow?sessionId=${sessionId}`));
    
    if (!workflowResponse.ok) {
      return createErrorResponse('Workflow not found', 404);
    }

    const currentWorkflow = await workflowResponse.json() as WorkflowState;

    // Update workflow based on action
    const updatedWorkflow = await processWorkflowAction(
      currentWorkflow,
      phaseId,
      action,
      context,
      completed,
      env
    );

    // Store updated workflow
    await stateManager.fetch(new Request('http://internal/update-workflow', {
      method: 'POST',
      body: JSON.stringify(updatedWorkflow)
    }));

    return createSuccessResponse({
      workflow: updatedWorkflow,
      message: 'Workflow updated successfully'
    });

  } catch (error) {
    console.error('Update workflow error:', error);
    return createErrorResponse(ERROR_MESSAGES.WORKFLOW_ERROR, 500);
  }
}

async function handleGetWorkflowStatus(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return createErrorResponse('Missing sessionId parameter', 400);
  }

  try {
    const stateManager = env.STATE_MANAGER.get(env.STATE_MANAGER.idFromName(sessionId));
    const workflowResponse = await stateManager.fetch(new Request(`http://internal/get-workflow?sessionId=${sessionId}`));
    
    if (!workflowResponse.ok) {
      return createErrorResponse('Workflow not found', 404);
    }

    const workflow = await workflowResponse.json() as WorkflowState;
    const sessionResponse = await stateManager.fetch(new Request(`http://internal/get-session?sessionId=${sessionId}`));
    const session = sessionResponse.ok ? await sessionResponse.json() as TrainingSession : null;

    const status = {
      workflow,
      session,
      progress: calculateProgress(workflow),
      nextActions: generateNextActions(workflow),
      estimatedTimeRemaining: estimateTimeRemaining(workflow, session)
    };

    return createSuccessResponse(status);

  } catch (error) {
    console.error('Get workflow status error:', error);
    return createErrorResponse(ERROR_MESSAGES.WORKFLOW_ERROR, 500);
  }
}

async function handleCompleteWorkflow(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await request.json() as {
      sessionId: string;
      finalScore?: number;
      feedback?: string;
    };

    const { sessionId, finalScore, feedback } = body;

    if (!sessionId) {
      return createErrorResponse('Missing sessionId', 400);
    }

    // Get current workflow and session
    const stateManager = env.STATE_MANAGER.get(env.STATE_MANAGER.idFromName(sessionId));
    
    const workflowResponse = await stateManager.fetch(new Request(`http://internal/get-workflow?sessionId=${sessionId}`));
    const sessionResponse = await stateManager.fetch(new Request(`http://internal/get-session?sessionId=${sessionId}`));

    if (!workflowResponse.ok || !sessionResponse.ok) {
      return createErrorResponse('Workflow or session not found', 404);
    }

    const workflow = await workflowResponse.json() as WorkflowState;
    const session = await sessionResponse.json() as TrainingSession;

    // Mark workflow as completed
    const completedWorkflow: WorkflowState = {
      ...workflow,
      currentPhase: { ...workflow.currentPhase, completed: true },
      completedPhases: [...workflow.completedPhases, workflow.currentPhase],
      nextActions: ['Review results', 'Provide feedback', 'Plan next training'],
      lastUpdated: new Date()
    };

    // Update session
    const completedSession: TrainingSession = {
      ...session,
      status: 'completed',
      endTime: new Date(),
      score: finalScore || calculateFinalScore(workflow),
      progress: {
        ...session.progress,
        completedSteps: session.progress.totalSteps,
        learningPoints: extractLearningPoints(workflow)
      }
    };

    // Store completed workflow and session
    await stateManager.fetch(new Request('http://internal/update-workflow', {
      method: 'POST',
      body: JSON.stringify(completedWorkflow)
    }));

    await stateManager.fetch(new Request('http://internal/update-session', {
      method: 'POST',
      body: JSON.stringify(completedSession)
    }));

    // Generate completion report
    const completionReport = await generateCompletionReport(workflow, session, env);

    return createSuccessResponse({
      workflow: completedWorkflow,
      session: completedSession,
      report: completionReport,
      message: SUCCESS_MESSAGES.WORKFLOW_COMPLETED
    });

  } catch (error) {
    console.error('Complete workflow error:', error);
    return createErrorResponse(ERROR_MESSAGES.WORKFLOW_ERROR, 500);
  }
}

async function handleNextStep(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await request.json() as {
      sessionId: string;
      currentStepId: string;
    };

    const { sessionId, currentStepId } = body;

    if (!sessionId || !currentStepId) {
      return createErrorResponse('Missing sessionId or currentStepId', 400);
    }

    // Get current workflow
    const stateManager = env.STATE_MANAGER.get(env.STATE_MANAGER.idFromName(sessionId));
    const workflowResponse = await stateManager.fetch(new Request(`http://internal/get-workflow?sessionId=${sessionId}`));
    
    if (!workflowResponse.ok) {
      return createErrorResponse('Workflow not found', 404);
    }

    const workflow = await workflowResponse.json() as WorkflowState;

    // Determine next step
    const nextStep = await determineNextStep(workflow, currentStepId, env);

    return createSuccessResponse({
      nextStep,
      workflow,
      message: 'Next step determined successfully'
    });

  } catch (error) {
    console.error('Next step error:', error);
    return createErrorResponse(ERROR_MESSAGES.WORKFLOW_ERROR, 500);
  }
}

async function handleValidateStep(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await request.json() as {
      sessionId: string;
      stepId: string;
      userAction: string;
      context?: Record<string, any>;
    };

    const { sessionId, stepId, userAction, context } = body;

    if (!sessionId || !stepId || !userAction) {
      return createErrorResponse('Missing required fields', 400);
    }

    // Validate the user action against expected criteria
    const validation = await validateUserAction(stepId, userAction, context, env);

    // Update workflow based on validation results
    if (validation.isValid) {
      const stateManager = env.STATE_MANAGER.get(env.STATE_MANAGER.idFromName(sessionId));
      const workflowResponse = await stateManager.fetch(new Request(`http://internal/get-workflow?sessionId=${sessionId}`));
      
      if (workflowResponse.ok) {
        const workflow = await workflowResponse.json() as WorkflowState;
        const updatedWorkflow = await processStepCompletion(workflow, stepId, validation);
        
        await stateManager.fetch(new Request('http://internal/update-workflow', {
          method: 'POST',
          body: JSON.stringify(updatedWorkflow)
        }));
      }
    }

    return createSuccessResponse({
      validation,
      message: validation.isValid ? 'Step completed successfully' : 'Step needs correction'
    });

  } catch (error) {
    console.error('Validate step error:', error);
    return createErrorResponse(ERROR_MESSAGES.WORKFLOW_ERROR, 500);
  }
}

// Helper functions

async function getScenario(scenarioId: string, env: Env): Promise<IncidentScenario | null> {
  try {
    const scenario = await env.TRAINING_DATA.get(`scenario:${scenarioId}`);
    return scenario ? JSON.parse(scenario) : null;
  } catch (error) {
    console.error('Error getting scenario:', error);
    return null;
  }
}

async function initializeWorkflow(
  sessionId: string,
  scenario: IncidentScenario,
  incidentType: string | undefined,
  env: Env
): Promise<WorkflowState> {
  const phases = Object.values(WORKFLOW_PHASES).sort((a, b) => a.order - b.order);
  
  return {
    id: crypto.randomUUID(),
    sessionId,
    currentPhase: phases[0],
    completedPhases: [],
    nextActions: generateInitialActions(scenario, incidentType),
    context: {
      scenarioId: scenario.id,
      incidentType: incidentType || scenario.category.id,
      severity: scenario.severity,
      difficulty: scenario.difficulty,
      startTime: new Date().toISOString()
    },
    lastUpdated: new Date()
  };
}

async function createTrainingSession(
  sessionId: string,
  scenarioId: string,
  userId: string,
  env: Env
): Promise<TrainingSession> {
  return {
    id: sessionId,
    userId,
    scenarioId,
    status: 'active',
    currentStep: 0,
    startTime: new Date(),
    feedback: [],
    progress: {
      completedSteps: 0,
      totalSteps: 0, // Will be updated based on scenario
      timeSpent: 0,
      accuracy: 0,
      learningPoints: []
    }
  };
}

async function processWorkflowAction(
  workflow: WorkflowState,
  phaseId: string,
  action: string,
  context: Record<string, any> | undefined,
  completed: boolean | undefined,
  env: Env
): Promise<WorkflowState> {
  const updatedWorkflow = { ...workflow };

  // Update context
  if (context) {
    updatedWorkflow.context = { ...updatedWorkflow.context, ...context };
  }

  // Process phase completion
  if (completed && phaseId === workflow.currentPhase.id) {
    updatedWorkflow.completedPhases = [...updatedWorkflow.completedPhases, workflow.currentPhase];
    
    // Move to next phase
    const nextPhase = getNextPhase(workflow.currentPhase);
    if (nextPhase) {
      updatedWorkflow.currentPhase = nextPhase;
      updatedWorkflow.nextActions = generateNextActions(updatedWorkflow);
    }
  }

  updatedWorkflow.lastUpdated = new Date();
  return updatedWorkflow;
}

function getNextPhase(currentPhase: WorkflowPhase): WorkflowPhase | null {
  const phases = Object.values(WORKFLOW_PHASES).sort((a, b) => a.order - b.order);
  const currentIndex = phases.findIndex(phase => phase.id === currentPhase.id);
  
  if (currentIndex < phases.length - 1) {
    return phases[currentIndex + 1];
  }
  
  return null;
}

function generateInitialActions(scenario: IncidentScenario, incidentType: string | undefined): string[] {
  const baseActions = [
    'Assess the situation',
    'Gather initial information',
    'Identify the threat type',
    'Determine severity level'
  ];

  if (incidentType) {
    const category = INCIDENT_CATEGORIES[incidentType.toUpperCase() as keyof typeof INCIDENT_CATEGORIES];
    if (category) {
      return [...baseActions, ...category.responseProcedures.slice(0, 3)];
    }
  }

  return baseActions;
}

function generateNextActions(workflow: WorkflowState): string[] {
  const phase = workflow.currentPhase;
  const context = workflow.context;

  switch (phase.id) {
    case 'detection':
      return [
        'Analyze indicators of compromise',
        'Determine attack vector',
        'Assess initial impact',
        'Notify stakeholders'
      ];
    case 'containment':
      return [
        'Isolate affected systems',
        'Block malicious traffic',
        'Preserve evidence',
        'Implement temporary controls'
      ];
    case 'eradication':
      return [
        'Remove malware',
        'Patch vulnerabilities',
        'Reset compromised credentials',
        'Clean infected systems'
      ];
    case 'recovery':
      return [
        'Restore systems',
        'Verify security controls',
        'Monitor for recurrence',
        'Update documentation'
      ];
    case 'lessons-learned':
      return [
        'Document findings',
        'Update procedures',
        'Train staff',
        'Improve security controls'
      ];
    default:
      return ['Continue with current phase'];
  }
}

function calculateProgress(workflow: WorkflowState): number {
  const totalPhases = Object.keys(WORKFLOW_PHASES).length;
  const completedPhases = workflow.completedPhases.length;
  const currentPhaseProgress = workflow.currentPhase.completed ? 1 : 0.5;
  
  return ((completedPhases + currentPhaseProgress) / totalPhases) * 100;
}

function estimateTimeRemaining(workflow: WorkflowState, session: TrainingSession | null): number {
  const baseTimePerPhase = 15; // minutes
  const remainingPhases = Object.keys(WORKFLOW_PHASES).length - workflow.completedPhases.length;
  
  return remainingPhases * baseTimePerPhase;
}

function calculateFinalScore(workflow: WorkflowState): number {
  const completedPhases = workflow.completedPhases.length;
  const totalPhases = Object.keys(WORKFLOW_PHASES).length;
  
  return Math.round((completedPhases / totalPhases) * 100);
}

function extractLearningPoints(workflow: WorkflowState): string[] {
  const learningPoints: string[] = [];
  
  workflow.completedPhases.forEach(phase => {
    learningPoints.push(`Completed ${phase.name} phase`);
  });
  
  if (workflow.context.incidentType) {
    learningPoints.push(`Handled ${workflow.context.incidentType} incident type`);
  }
  
  return learningPoints;
}

async function determineNextStep(workflow: WorkflowState, currentStepId: string, env: Env): Promise<any> {
  // This would typically involve AI analysis to determine the most appropriate next step
  // For now, return a structured next step based on current phase
  return {
    id: crypto.randomUUID(),
    title: `Next step in ${workflow.currentPhase.name}`,
    description: `Continue with ${workflow.currentPhase.description}`,
    type: 'action',
    required: true,
    hints: ['Follow standard procedures', 'Document your actions'],
    validationCriteria: ['Action completed', 'Evidence documented']
  };
}

async function validateUserAction(
  stepId: string,
  userAction: string,
  context: Record<string, any> | undefined,
  env: Env
): Promise<any> {
  // This would typically use AI to validate the user's action
  // For now, return a basic validation structure
  return {
    isValid: true,
    score: 85,
    feedback: 'Good action taken. Consider documenting this step.',
    suggestions: ['Add more detail to your documentation', 'Verify the action was successful'],
    corrections: []
  };
}

async function processStepCompletion(workflow: WorkflowState, stepId: string, validation: any): Promise<WorkflowState> {
  const updatedWorkflow = { ...workflow };
  
  // Update context with step completion
  updatedWorkflow.context = {
    ...updatedWorkflow.context,
    [`step_${stepId}_completed`]: true,
    [`step_${stepId}_score`]: validation.score,
    [`step_${stepId}_feedback`]: validation.feedback
  };
  
  updatedWorkflow.lastUpdated = new Date();
  return updatedWorkflow;
}

async function generateCompletionReport(
  workflow: WorkflowState,
  session: TrainingSession,
  env: Env
): Promise<any> {
  return {
    sessionId: session.id,
    scenarioId: workflow.context.scenarioId,
    completionTime: session.endTime,
    totalTime: session.endTime ? 
      Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000) : 0,
    finalScore: session.score,
    phasesCompleted: workflow.completedPhases.length,
    totalPhases: Object.keys(WORKFLOW_PHASES).length,
    learningPoints: session.progress.learningPoints,
    recommendations: [
      'Continue practicing incident response procedures',
      'Review additional scenarios in this category',
      'Consider advanced training modules'
    ]
  };
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
