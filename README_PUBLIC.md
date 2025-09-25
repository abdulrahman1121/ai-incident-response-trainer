# AI-Powered Incident Response Training Platform

An intelligent, real-time incident response training and simulation platform that leverages Cloudflare's edge computing capabilities to provide AI-powered guidance during cybersecurity incidents.

## 🚀 Features

### Core Capabilities
- **AI-Powered Guidance**: Real-time assistance from Llama 3.3 during incident response training
- **Interactive Training Scenarios**: Dynamic, voice-enabled chat interface for hands-free operation
- **Persistent Memory**: Remembers user progress, preferences, and learning patterns
- **Real-time Coordination**: Workflows orchestrate complex incident response procedures
- **Voice Integration**: Natural language voice commands for hands-free operation
- **Edge-First Design**: Ultra-low latency responses powered by Cloudflare's global network

### Training Features
- **Real-World Scenarios**: Practice with scenarios based on actual cybersecurity incidents
- **Progressive Learning**: Training scenarios adapt to user skill level
- **Multi-Modal Interface**: Chat, voice, and visual interfaces for comprehensive training
- **Performance Tracking**: Detailed analytics and progress monitoring
- **Achievement System**: Gamified learning with badges and milestones

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Cloudflare Workers + Workflows
- **AI**: Llama 3.3 via Workers AI
- **Storage**: KV, R2, Durable Objects
- **Real-time**: WebSockets via Durable Objects
- **Voice**: Web Speech API + MediaRecorder

### Components
1. **AI Assistant Worker**: Handles chat, voice, and analysis requests
2. **Workflow Orchestrator**: Manages incident response procedures
3. **State Manager**: Persistent session and user state management
4. **Frontend Pages**: Interactive training interface
5. **Voice Service**: Speech-to-text and text-to-speech capabilities

## 🛠️ Setup and Installation

### Prerequisites
- Node.js 18+ 
- Cloudflare account with Workers AI access
- Wrangler CLI installed globally

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-incident-response-trainer
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd src/pages && npm install
   ```

3. **Configure Cloudflare**
   ```bash
   # Login to Cloudflare
   wrangler login
   
   # Create KV namespaces
   wrangler kv:namespace create "USER_PREFERENCES"
   wrangler kv:namespace create "TRAINING_DATA"
   
   # Create R2 bucket
   wrangler r2 bucket create training-materials
   ```

4. **Update wrangler.toml**
   - Replace KV namespace IDs with your created namespaces
   - Update R2 bucket names if needed
   - Configure your account ID

5. **Deploy Workers**
   ```bash
   # Deploy AI Assistant Worker
   wrangler deploy --name ai-assistant
   
   # Deploy Workflow Orchestrator
   wrangler deploy --name workflow-orchestrator
   ```

6. **Deploy Pages**
   ```bash
   cd src/pages
   npm run build
   wrangler pages deploy dist
   ```

## 🎯 Usage

### Starting a Training Session

1. **Navigate to Training**: Go to the Training page
2. **Select Scenario**: Choose from available incident response scenarios
3. **Start Session**: Click "Start" to begin the training
4. **Follow AI Guidance**: Use chat or voice to interact with the AI assistant
5. **Complete Steps**: Work through the incident response workflow
6. **Review Results**: Check your performance and progress

### Voice Commands

The platform supports various voice commands:
- "Start training" - Begin a new training session
- "Next step" - Move to the next step in the workflow
- "Get hint" - Request a hint for the current step
- "Repeat instructions" - Repeat the current instructions
- "Check status" - Get current training status
- "Help" - Show available commands

### Training Scenarios

Available scenario types:
- **Malware Detection**: Ransomware, trojans, and other malware
- **Phishing Response**: Email-based social engineering attacks
- **DDoS Mitigation**: Distributed denial of service attacks
- **Data Breach**: Unauthorized access to sensitive data
- **Network Intrusion**: Unauthorized network access attempts

## 🔧 Configuration

### Environment Variables

Set these in your Cloudflare Workers environment:

```bash
ENVIRONMENT=production
MAX_CONCURRENT_SESSIONS=1000
AI_MODEL_PRIMARY=@cf/meta/llama-3.3-70b-instruct
AI_MODEL_FAST=@cf/meta/llama-3.3-8b-instruct
```

### Voice Configuration

Configure voice settings in the Profile page:
- **Language**: Select preferred language for voice recognition
- **Voice**: Choose TTS voice and adjust rate, pitch, volume
- **Commands**: Enable/disable voice command processing

### Training Preferences

Customize your training experience:
- **Focus Areas**: Select topics of interest
- **Difficulty Level**: Choose appropriate challenge level
- **Notification Settings**: Configure alerts and updates

## 📊 Monitoring and Analytics

### Dashboard Features
- **Progress Tracking**: Visual progress indicators and completion rates
- **Performance Metrics**: Scores, time spent, and accuracy measurements
- **Achievement System**: Badges and milestones for completed scenarios
- **Learning Analytics**: Insights into strengths and improvement areas

### Real-time Monitoring
- **Session Status**: Live updates on current training sessions
- **AI Performance**: Response times and accuracy metrics
- **System Health**: Worker performance and availability

## 🚀 Deployment

### Production Deployment

1. **Configure Production Environment**
   ```bash
   wrangler secret put ENVIRONMENT
   # Enter: production
   ```

2. **Deploy All Components**
   ```bash
   # Deploy Workers
   wrangler deploy
   
   # Deploy Pages
   cd src/pages
   npm run build
   wrangler pages deploy dist --project-name ai-incident-response-trainer
   ```

3. **Configure Custom Domain** (Optional)
   ```bash
   wrangler pages domain add ai-incident-response-trainer.pages.dev your-domain.com
   ```

### Performance Optimization

- **Edge Caching**: Leverage Cloudflare's global CDN
- **Worker Optimization**: Minimize cold start times
- **AI Model Selection**: Use appropriate model for response complexity
- **Voice Processing**: Optimize audio processing for low latency

## 🔒 Security

### Data Protection
- **Encryption**: All data encrypted in transit and at rest
- **Access Control**: Role-based access to training scenarios
- **Privacy**: User data anonymized and aggregated for analytics
- **Compliance**: GDPR and SOC 2 compliant data handling

### Security Features
- **Input Validation**: All user inputs validated and sanitized
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Authentication**: Secure user authentication and session management
- **Audit Logging**: Comprehensive logging of all activities

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
   ```bash
   npm test
   npm run lint
   ```
5. **Submit a pull request**

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Testing**: Unit and integration tests required

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cloudflare**: For providing the edge computing platform
- **Meta**: For the Llama 3.3 AI models
- **Open Source Community**: For the amazing tools and libraries

## 📞 Support

- **Documentation**: [Full documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**Built with ❤️ for the cybersecurity community**
