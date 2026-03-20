import type { 
  Agent, 
  AgentRole, 
  AgentStatus, 
  AgentTask, 
  AgentTaskResult,
  TeamSession,
  AgentMessage,
  AgentCapability,
  FileChange,
  AgentStats,
  AgentLog
} from "./types"
import { nanoid } from "nanoid"

const AGENT_TEMPLATES: Record<AgentRole, Partial<Agent>> = {
  analyst: {
    name: "Analista",
    avatar: "🔍",
    capabilities: {
      languages: ["TypeScript", "JavaScript", "Python", "SQL"],
      frameworks: ["React", "Next.js", "Node.js"],
      specialties: ["code-analysis", "pattern-detection", "performance-analysis"],
      maxConcurrentTasks: 3
    },
    stats: {
      tasksCompleted: 0,
      tasksFailed: 0,
      avgResponseTime: 0,
      specialty: "Análisis de Código"
    }
  },
  coder: {
    name: "Desarrollador",
    avatar: "⚡",
    capabilities: {
      languages: ["TypeScript", "JavaScript", "Python", "Rust"],
      frameworks: ["React", "Next.js", "TailwindCSS", "Prisma"],
      specialties: ["frontend", "backend", "api-design", "database"],
      maxConcurrentTasks: 2
    },
    stats: {
      tasksCompleted: 0,
      tasksFailed: 0,
      avgResponseTime: 0,
      specialty: "Implementación"
    }
  },
  reviewer: {
    name: "Revisor",
    avatar: "👁️",
    capabilities: {
      languages: ["TypeScript", "JavaScript", "Python"],
      frameworks: ["React", "Next.js"],
      specialties: ["code-review", "best-practices", "security", "accessibility"],
      maxConcurrentTasks: 5
    },
    stats: {
      tasksCompleted: 0,
      tasksFailed: 0,
      avgResponseTime: 0,
      specialty: "Revisión de Código"
    }
  },
  tester: {
    name: "Tester",
    avatar: "🧪",
    capabilities: {
      languages: ["TypeScript", "JavaScript", "Python"],
      frameworks: ["Vitest", "Playwright", "Jest", "Cypress"],
      specialties: ["unit-testing", "integration-testing", "e2e", "performance-testing"],
      maxConcurrentTasks: 3
    },
    stats: {
      tasksCompleted: 0,
      tasksFailed: 0,
      avgResponseTime: 0,
      specialty: "Testing"
    }
  },
  architect: {
    name: "Arquitecto",
    avatar: "🏗️",
    capabilities: {
      languages: ["TypeScript", "Python", "Go", "Rust"],
      frameworks: ["Next.js", "Node.js", "GraphQL", "REST"],
      specialties: ["system-design", "scalability", "microservices", "database-design"],
      maxConcurrentTasks: 2
    },
    stats: {
      tasksCompleted: 0,
      tasksFailed: 0,
      avgResponseTime: 0,
      specialty: "Arquitectura"
    }
  },
  debugger: {
    name: "Depurador",
    avatar: "🔧",
    capabilities: {
      languages: ["TypeScript", "JavaScript", "Python", "SQL"],
      frameworks: ["React", "Next.js", "Node.js"],
      specialties: ["bug-fixing", "error-analysis", "logging", "debugging"],
      maxConcurrentTasks: 4
    },
    stats: {
      tasksCompleted: 0,
      tasksFailed: 0,
      avgResponseTime: 0,
      specialty: "Depuración"
    }
  }
}

class AgentService {
  private agents: Map<string, Agent> = new Map()
  private tasks: Map<string, AgentTask> = new Map()
  private sessions: Map<string, TeamSession> = new Map()
  private messages: Map<string, AgentMessage[]> = new Map()

  constructor() {
    this.initializeDefaultAgents()
  }

  private initializeDefaultAgents() {
    const roles: AgentRole[] = ["analyst", "coder", "reviewer", "tester"]
    roles.forEach(role => {
      const agent = this.createAgent(role)
      this.agents.set(agent.id, agent)
    })
  }

  createAgent(role: AgentRole, customName?: string): Agent {
    const template = AGENT_TEMPLATES[role]
    const agent: Agent = {
      id: nanoid(),
      role,
      status: "idle",
      name: customName || template.name || role,
      avatar: template.avatar || "🤖",
      capabilities: template.capabilities as AgentCapability,
      stats: template.stats as AgentStats,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }
    return agent
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id)
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  getAgentsByRole(role: AgentRole): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.role === role)
  }

  updateAgentStatus(id: string, status: AgentStatus): Agent | undefined {
    const agent = this.agents.get(id)
    if (agent) {
      agent.status = status
      agent.lastActive = new Date().toISOString()
      this.agents.set(id, agent)
    }
    return agent
  }

  createTask(title: string, description: string, priority: AgentTask["priority"] = "medium"): AgentTask {
    const task: AgentTask = {
      id: nanoid(),
      title,
      description,
      priority,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [{
        timestamp: new Date().toISOString(),
        level: "info",
        message: "Tarea creada"
      }]
    }
    this.tasks.set(task.id, task)
    return task
  }

  getTask(id: string): AgentTask | undefined {
    return this.tasks.get(id)
  }

  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  getPendingTasks(): AgentTask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.status === "pending")
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
  }

  assignTask(taskId: string, agentId: string): AgentTask | undefined {
    const task = this.tasks.get(taskId)
    const agent = this.agents.get(agentId)
    
    if (task && agent) {
      task.assignedTo = agentId
      task.status = "in_progress"
      task.updatedAt = new Date().toISOString()
      task.logs.push({
        timestamp: new Date().toISOString(),
        level: "info",
        message: `Asignada a ${agent.name}`
      })
      
      agent.status = "working"
      agent.currentTask = taskId
      agent.lastActive = new Date().toISOString()
      
      this.tasks.set(taskId, task)
      this.agents.set(agentId, agent)
    }
    
    return task
  }

  addTaskLog(taskId: string, level: AgentLog["level"], message: string): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.logs.push({
        timestamp: new Date().toISOString(),
        level,
        message
      })
      this.tasks.set(taskId, task)
    }
  }

  completeTask(taskId: string, result: AgentTaskResult): AgentTask | undefined {
    const task = this.tasks.get(taskId)
    
    if (task) {
      task.result = result
      task.status = result.success ? "completed" : "failed"
      task.updatedAt = new Date().toISOString()
      task.logs.push({
        timestamp: new Date().toISOString(),
        level: result.success ? "success" : "error",
        message: result.success ? "Tarea completada" : "Tarea fallida"
      })
      
      if (task.assignedTo) {
        const agent = this.agents.get(task.assignedTo)
        if (agent) {
          agent.status = "idle"
          agent.currentTask = undefined
          agent.lastActive = new Date().toISOString()
          if (result.success) {
            agent.stats.tasksCompleted++
          } else {
            agent.stats.tasksFailed++
          }
          this.agents.set(agent.id, agent)
        }
      }
      
      this.tasks.set(taskId, task)
    }
    
    return task
  }

  createSession(name: string, creatorId: string): TeamSession {
    const session: TeamSession = {
      id: nanoid(),
      name,
      agents: this.getAllAgents(),
      tasks: this.getAllTasks(),
      createdAt: new Date().toISOString(),
      status: "active",
      creatorId
    }
    this.sessions.set(session.id, session)
    return session
  }

  getSession(id: string): TeamSession | undefined {
    return this.sessions.get(id)
  }

  sendMessage(message: Omit<AgentMessage, "id" | "timestamp">): AgentMessage {
    const fullMessage: AgentMessage = {
      ...message,
      id: nanoid(),
      timestamp: new Date().toISOString()
    }
    
    const agentMessages = this.messages.get(message.fromAgent) || []
    agentMessages.push(fullMessage)
    this.messages.set(message.fromAgent, agentMessages)
    
    return fullMessage
  }

  getAgentMessages(agentId: string): AgentMessage[] {
    return this.messages.get(agentId) || []
  }

  simulateAgentWork(taskId: string): Promise<AgentTaskResult> {
    return new Promise((resolve) => {
      const task = this.tasks.get(taskId)
      if (!task) {
        resolve({
          success: false,
          changes: [],
          summary: "Tarea no encontrada",
          timeSpent: 0
        })
        return
      }

      this.addTaskLog(taskId, "info", "Analizando código...")
      
      setTimeout(() => {
        this.addTaskLog(taskId, "info", "Identificando problemas...")
        
        setTimeout(() => {
          this.addTaskLog(taskId, "info", "Implementando soluciones...")
          
          setTimeout(() => {
            this.addTaskLog(taskId, "info", "Verificando cambios...")
            
            setTimeout(() => {
              const changes: FileChange[] = [{
                filePath: "example.ts",
                action: "modify",
                description: "Optimización de código"
              }]
              
              resolve({
                success: true,
                changes,
                summary: `Se completaron ${changes.length} cambios`,
                timeSpent: 5000
              })
            }, 1500)
          }, 1500)
        }, 1500)
      }, 1500)
    })
  }
}

export const agentService = new AgentService()

export function getAgentById(id: string): Agent | undefined {
  return agentService.getAgent(id)
}

export function getAllAgents(): Agent[] {
  return agentService.getAllAgents()
}

export function getAgentStats() {
  const agents = agentService.getAllAgents()
  return {
    total: agents.length,
    active: agents.filter(a => a.status === "working").length,
    idle: agents.filter(a => a.status === "idle").length,
    totalTasksCompleted: agents.reduce((sum, a) => sum + a.stats.tasksCompleted, 0),
    totalTasksFailed: agents.reduce((sum, a) => sum + a.stats.tasksFailed, 0)
  }
}
