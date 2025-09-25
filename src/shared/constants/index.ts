// Application constants for EdgeIncidentDrill

export const INCIDENT_CATEGORIES = {
  MALWARE: {
    id: 'malware',
    name: 'Malware Infection',
    description: 'Detection and response to malicious software',
    commonIndicators: [
      'Unusual network traffic patterns',
      'Suspicious file downloads',
      'Antivirus alerts',
      'System performance degradation'
    ],
    responseProcedures: [
      'Isolate affected systems',
      'Identify malware type and scope',
      'Contain the threat',
      'Eradicate malware',
      'Recover systems',
      'Document lessons learned'
    ]
  },
  PHISHING: {
    id: 'phishing',
    name: 'Phishing Attack',
    description: 'Social engineering attacks via email or other vectors',
    commonIndicators: [
      'Suspicious email patterns',
      'User reports of suspicious emails',
      'Credential compromise indicators',
      'Unusual login attempts'
    ],
    responseProcedures: [
      'Block malicious domains/IPs',
      'Reset compromised credentials',
      'Scan for additional compromises',
      'Educate affected users',
      'Update security controls'
    ]
  },
  DDOS: {
    id: 'ddos',
    name: 'DDoS Attack',
    description: 'Distributed denial of service attacks',
    commonIndicators: [
      'Unusual traffic spikes',
      'Service unavailability',
      'Network congestion',
      'Resource exhaustion'
    ],
    responseProcedures: [
      'Activate DDoS mitigation',
      'Scale resources if possible',
      'Implement rate limiting',
      'Monitor attack patterns',
      'Coordinate with ISP'
    ]
  },
  DATA_BREACH: {
    id: 'data-breach',
    name: 'Data Breach',
    description: 'Unauthorized access to sensitive data',
    commonIndicators: [
      'Unusual data access patterns',
      'Database anomalies',
      'Unauthorized system access',
      'Data exfiltration indicators'
    ],
    responseProcedures: [
      'Assess scope of breach',
      'Contain the incident',
      'Preserve evidence',
      'Notify stakeholders',
      'Comply with regulations',
      'Implement additional controls'
    ]
  }
} as const;

export const TRAINING_SCENARIOS = {
  BEGINNER: [
    'Basic malware detection',
    'Simple phishing identification',
    'Password security basics',
    'Incident reporting procedures'
  ],
  INTERMEDIATE: [
    'Multi-vector attack response',
    'Network forensics basics',
    'Incident coordination',
    'Evidence collection'
  ],
  ADVANCED: [
    'Advanced persistent threats',
    'Complex malware analysis',
    'Incident command structure',
    'Legal and compliance aspects'
  ]
} as const;

export const AI_MODELS = {
  PRIMARY: '@cf/meta/llama-3.3-70b-instruct',
  FAST: '@cf/meta/llama-3.3-8b-instruct',
  EMBEDDING: '@cf/baai/bge-large-en-v1.5'
} as const;

export const WORKFLOW_PHASES = {
  DETECTION: {
    id: 'detection',
    name: 'Detection & Analysis',
    description: 'Initial detection and preliminary analysis',
    order: 1
  },
  CONTAINMENT: {
    id: 'containment',
    name: 'Containment',
    description: 'Immediate containment of the threat',
    order: 2
  },
  ERADICATION: {
    id: 'eradication',
    name: 'Eradication',
    description: 'Removal of the threat from systems',
    order: 3
  },
  RECOVERY: {
    id: 'recovery',
    name: 'Recovery',
    description: 'Restoration of normal operations',
    order: 4
  },
  LESSONS_LEARNED: {
    id: 'lessons-learned',
    name: 'Lessons Learned',
    description: 'Documentation and improvement planning',
    order: 5
  }
} as const;

export const API_ENDPOINTS = {
  AI: {
    CHAT: '/api/ai/chat',
    VOICE: '/api/ai/voice',
    ANALYSIS: '/api/ai/analysis'
  },
  WORKFLOW: {
    START: '/api/workflow/start',
    UPDATE: '/api/workflow/update',
    STATUS: '/api/workflow/status',
    COMPLETE: '/api/workflow/complete'
  },
  SESSION: {
    CREATE: '/api/session/create',
    GET: '/api/session/:id',
    UPDATE: '/api/session/:id',
    DELETE: '/api/session/:id'
  },
  USER: {
    PROFILE: '/api/user/profile',
    PREFERENCES: '/api/user/preferences',
    PROGRESS: '/api/user/progress'
  }
} as const;

export const VOICE_COMMANDS = {
  START_SCENARIO: 'start scenario',
  NEXT_STEP: 'next step',
  REPEAT_INSTRUCTIONS: 'repeat instructions',
  GET_HINT: 'get hint',
  ESCALATE: 'escalate',
  PAUSE_SESSION: 'pause session',
  END_SESSION: 'end session'
} as const;

export const ERROR_MESSAGES = {
  AI_UNAVAILABLE: 'AI service is temporarily unavailable. Please try again.',
  SESSION_NOT_FOUND: 'Training session not found.',
  INVALID_INPUT: 'Invalid input provided.',
  RATE_LIMITED: 'Too many requests. Please wait before trying again.',
  UNAUTHORIZED: 'Unauthorized access.',
  WORKFLOW_ERROR: 'Workflow execution error occurred.'
} as const;

export const SUCCESS_MESSAGES = {
  SESSION_CREATED: 'Training session created successfully.',
  SESSION_UPDATED: 'Session updated successfully.',
  WORKFLOW_COMPLETED: 'Workflow completed successfully.',
  AI_RESPONSE_GENERATED: 'AI response generated successfully.'
} as const;

export const CONFIG = {
  MAX_SESSION_DURATION: 120, // minutes
  MAX_CONCURRENT_SESSIONS: 1000,
  AI_RESPONSE_TIMEOUT: 30000, // milliseconds
  VOICE_RECOGNITION_TIMEOUT: 10000, // milliseconds
  SESSION_CLEANUP_INTERVAL: 3600000, // 1 hour in milliseconds
  MAX_CHAT_HISTORY: 100,
  DEFAULT_PAGE_SIZE: 20
} as const;
