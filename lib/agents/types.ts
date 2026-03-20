export type AgentRole = 
  | "analyst"      // Analiza código y detecta problemas
  | "coder"        // Implementa soluciones
  | "reviewer"     // Revisa código y sugiere mejoras
  | "tester"       // Ejecuta tests y verifica funcionalidad
  | "architect"     // Diseña soluciones técnicas
  | "debugger"     // Investiga y soluciona bugs

export type AgentStatus = 
  | "idle"         // Esperando tareas
  | "working"      // Procesando una tarea
  | "thinking"     // Analizando el problema
  | "blocked"      // Esperando información
  | "completed"    // Tarea completada

export interface AgentCapability {
  languages: string[]
  frameworks: string[]
  specialties: string[]
  maxConcurrentTasks: number
}

export interface AgentTask {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "in_progress" | "completed" | "failed"
  assignedTo?: string
  createdAt: string
  updatedAt: string
  result?: AgentTaskResult
  logs: AgentLog[]
}

export interface AgentTaskResult {
  success: boolean
  changes: FileChange[]
  summary: string
  timeSpent: number
}

export interface FileChange {
  filePath: string
  action: "create" | "modify" | "delete"
  diff?: string
  description: string
}

export interface AgentLog {
  timestamp: string
  level: "info" | "warning" | "error" | "success"
  message: string
}

export interface Agent {
  id: string
  name: string
  role: AgentRole
  status: AgentStatus
  avatar: string
  capabilities: AgentCapability
  currentTask?: string
  stats: AgentStats
  createdAt: string
  lastActive: string
}

export interface AgentStats {
  tasksCompleted: number
  tasksFailed: number
  avgResponseTime: number
  specialty: string
}

export interface TeamSession {
  id: string
  name: string
  agents: Agent[]
  tasks: AgentTask[]
  createdAt: string
  status: "active" | "paused" | "completed"
  creatorId: string
}

export interface AgentMessage {
  id: string
  fromAgent: string
  toAgent?: string
  type: "task" | "status" | "result" | "error" | "question"
  content: string
  timestamp: string
}
