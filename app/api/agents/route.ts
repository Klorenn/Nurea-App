import { NextRequest, NextResponse } from "next/server"
import { agentService, getAgentStats } from "@/lib/agents/service"
import type { AgentRole, AgentTask } from "@/lib/agents/types"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  
  try {
    switch (action) {
      case "agents": {
        const agents = agentService.getAllAgents()
        return NextResponse.json({ success: true, data: agents })
      }
      
      case "stats": {
        const stats = getAgentStats()
        return NextResponse.json({ success: true, data: stats })
      }
      
      case "tasks": {
        const tasks = agentService.getAllTasks()
        return NextResponse.json({ success: true, data: tasks })
      }
      
      case "pending": {
        const tasks = agentService.getPendingTasks()
        return NextResponse.json({ success: true, data: tasks })
      }
      
      case "task": {
        const taskId = searchParams.get("id")
        if (!taskId) {
          return NextResponse.json({ success: false, error: "Task ID required" }, { status: 400 })
        }
        const task = agentService.getTask(taskId)
        if (!task) {
          return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: task })
      }
      
      default: {
        const [agents, stats, tasks] = [
          agentService.getAllAgents(),
          getAgentStats(),
          agentService.getAllTasks()
        ]
        return NextResponse.json({ success: true, data: { agents, stats, tasks } })
      }
    }
  } catch (error) {
    console.error("Agent API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    switch (action) {
      case "createTask": {
        const { title, description, priority = "medium" } = body
        if (!title || !description) {
          return NextResponse.json({ 
            success: false, 
            error: "Title and description required" 
          }, { status: 400 })
        }
        const task = agentService.createTask(title, description, priority)
        return NextResponse.json({ success: true, data: task })
      }
      
      case "assignTask": {
        const { taskId, agentId } = body
        if (!taskId || !agentId) {
          return NextResponse.json({ 
            success: false, 
            error: "Task ID and Agent ID required" 
          }, { status: 400 })
        }
        const task = agentService.assignTask(taskId, agentId)
        if (!task) {
          return NextResponse.json({ 
            success: false, 
            error: "Task or agent not found" 
          }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: task })
      }
      
      case "completeTask": {
        const { taskId, result } = body
        if (!taskId || !result) {
          return NextResponse.json({ 
            success: false, 
            error: "Task ID and result required" 
          }, { status: 400 })
        }
        const task = agentService.completeTask(taskId, result)
        return NextResponse.json({ success: true, data: task })
      }
      
      case "runTask": {
        const { taskId } = body
        if (!taskId) {
          return NextResponse.json({ 
            success: false, 
            error: "Task ID required" 
          }, { status: 400 })
        }
        
        const task = agentService.getTask(taskId)
        if (!task) {
          return NextResponse.json({ 
            success: false, 
            error: "Task not found" 
          }, { status: 404 })
        }
        
        const availableAgents = agentService.getAllAgents()
          .filter(a => a.status === "idle")
          .sort((a, b) => a.capabilities.maxConcurrentTasks - b.capabilities.maxConcurrentTasks)
        
        if (availableAgents.length === 0) {
          return NextResponse.json({ 
            success: false, 
            error: "No available agents" 
          }, { status: 409 })
        }
        
        const agent = availableAgents[0]
        agentService.assignTask(taskId, agent.id)
        
        agentService.simulateAgentWork(taskId).then(result => {
          agentService.completeTask(taskId, result)
        })
        
        return NextResponse.json({ 
          success: true, 
          data: { 
            task: agentService.getTask(taskId),
            agent 
          }
        })
      }
      
      case "createSession": {
        const { name, creatorId } = body
        if (!name || !creatorId) {
          return NextResponse.json({ 
            success: false, 
            error: "Name and creator ID required" 
          }, { status: 400 })
        }
        const session = agentService.createSession(name, creatorId)
        return NextResponse.json({ success: true, data: session })
      }
      
      default:
        return NextResponse.json({ 
          success: false, 
          error: "Unknown action" 
        }, { status: 400 })
    }
  } catch (error) {
    console.error("Agent API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, status } = body
    
    if (!agentId || !status) {
      return NextResponse.json({ 
        success: false, 
        error: "Agent ID and status required" 
      }, { status: 400 })
    }
    
    const agent = agentService.updateAgentStatus(agentId, status)
    if (!agent) {
      return NextResponse.json({ 
        success: false, 
        error: "Agent not found" 
      }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: agent })
  } catch (error) {
    console.error("Agent API error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
