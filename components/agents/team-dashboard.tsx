"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Bot,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Activity,
  RefreshCw,
  ChevronRight,
  Loader2,
  Target,
  Brain,
  Code2,
  Eye,
  FlaskConical,
  Wrench,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Agent {
  id: string
  name: string
  role: string
  status: string
  avatar: string
  stats: { tasksCompleted: number; tasksFailed: number; specialty: string }
  capabilities: { maxConcurrentTasks: number }
  lastActive: string
}

interface Task {
  id: string
  title: string
  description: string
  priority: string
  status: string
  assignedTo?: string
  createdAt: string
  logs: Array<{ timestamp: string; level: string; message: string }>
  result?: { success: boolean; summary: string; timeSpent: number }
}

interface TeamStats {
  total: number
  active: number
  idle: number
  totalTasksCompleted: number
  totalTasksFailed: number
}

const ROLE_ICONS: Record<string, typeof Bot> = {
  analyst: Brain,
  coder: Code2,
  reviewer: Eye,
  tester: FlaskConical,
  architect: Target,
  debugger: Wrench,
}

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  working: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  thinking: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  blocked: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
}

export function AgentTeamDashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TeamStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newTaskForm, setNewTaskForm] = useState({ title: "", description: "", priority: "medium" })
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null)

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const res = await fetch("/api/agents")
      const data = await res.json()
      if (data.success) {
        setAgents(data.data.agents || [])
        setTasks(data.data.tasks || [])
        setStats(data.data.stats)
      }
    } catch (err) {
      console.error("Error loading agent data:", err)
      toast.error("Error al cargar datos de agentes")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(() => loadData(true), 5000)
    return () => clearInterval(interval)
  }, [loadData])

  const handleCreateTask = async () => {
    if (!newTaskForm.title || !newTaskForm.description) {
      toast.error("Completa todos los campos")
      return
    }

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createTask",
          ...newTaskForm
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Tarea creada")
        setTasks(prev => [data.data, ...prev])
        setNewTaskOpen(false)
        setNewTaskForm({ title: "", description: "", priority: "medium" })
      }
    } catch {
      toast.error("Error al crear tarea")
    }
  }

  const handleRunTask = async (taskId: string) => {
    setRunningTaskId(taskId)
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "runTask", taskId })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Tarea asignada a ${data.data.agent.name}`)
        loadData(true)
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error("Error al ejecutar tarea")
    } finally {
      setRunningTaskId(null)
    }
  }

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "Ahora"
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600 mx-auto" />
          <p className="text-sm text-slate-500 font-bold animate-pulse">
            Cargando equipo de agentes...
          </p>
        </div>
      </div>
    )
  }

  const workingAgents = agents.filter(a => a.status === "working")
  const pendingTasks = tasks.filter(t => t.status === "pending")
  const completedTasks = tasks.filter(t => t.status === "completed")

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/20 text-white">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
              Modo Teams
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black px-2 py-0 text-[10px] uppercase">
                {workingAgents.length} agentes activos
              </Badge>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Equipo de Agentes IA
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="rounded-2xl h-12 w-12 border-slate-200"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
          <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl px-6 h-12 font-black gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/20">
                <Plus className="h-4 w-4" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Crear Nueva Tarea</DialogTitle>
                <DialogDescription>
                  Describe el problema o tarea que quieres que los agentes resuelvan
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Título</label>
                  <Input
                    value={newTaskForm.title}
                    onChange={e => setNewTaskForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Ej: Arreglar error en dashboard"
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descripción</label>
                  <Textarea
                    value={newTaskForm.description}
                    onChange={e => setNewTaskForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe el problema en detalle..."
                    className="mt-1 rounded-xl min-h-[120px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Prioridad</label>
                  <Select value={newTaskForm.priority} onValueChange={v => setNewTaskForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger className="mt-1 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateTask} className="w-full rounded-xl font-black">
                  Crear Tarea
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Agentes Totales", val: stats.total, icon: Bot, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Activos", val: stats.active, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Tareas Completadas", val: stats.totalTasksCompleted, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Tareas Pendientes", val: pendingTasks.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-xl rounded-[24px]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", stat.bg)}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{stat.label}</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.val}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl h-12 flex-wrap">
          <TabsTrigger value="agents" className="rounded-xl px-6 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-purple-600 h-full">
            <Bot className="h-4 w-4 mr-2" />
            Agentes
          </TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-xl px-6 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-purple-600 h-full">
            <Target className="h-4 w-4 mr-2" />
            Tareas
            {pendingTasks.length > 0 && <Badge className="ml-2 bg-purple-500 text-white border-0">{pendingTasks.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-xl px-6 font-black text-sm data-[state=active]:bg-white data-[state=active]:text-purple-600 h-full">
            <Activity className="h-4 w-4 mr-2" />
            Actividad
          </TabsTrigger>
        </TabsList>

        {/* AGENTS TAB */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const Icon = ROLE_ICONS[agent.role] || Bot
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-xl rounded-[24px] overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center text-2xl">
                            {agent.avatar}
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 dark:text-white">{agent.name}</h3>
                            <p className="text-xs text-slate-500">{agent.stats.specialty}</p>
                          </div>
                        </div>
                        <Badge className={cn("font-bold text-[10px]", STATUS_COLORS[agent.status])}>
                          {agent.status === "working" ? "Trabajando" : 
                           agent.status === "thinking" ? "Pensando" :
                           agent.status === "idle" ? "Disponible" : agent.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <Icon className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 capitalize">{agent.role}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                          <p className="text-2xl font-black text-emerald-600">{agent.stats.tasksCompleted}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Completadas</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                          <p className="text-2xl font-black text-slate-600 dark:text-slate-300">{agent.stats.tasksFailed}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Fallidas</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 font-bold">
                          Última actividad: {formatTime(agent.lastActive)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* TASKS TAB */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pending Tasks */}
            <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-xl rounded-[24px]">
              <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Tareas Pendientes
                  <Badge className="ml-auto bg-amber-100 text-amber-700 border-0">{pendingTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                {pendingTasks.length === 0 ? (
                  <div className="p-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <p className="font-bold text-slate-500">No hay tareas pendientes</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pendingTasks.map(task => (
                      <div key={task.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={cn("font-bold text-[10px]", PRIORITY_COLORS[task.priority])}>
                                {task.priority}
                              </Badge>
                              <span className="text-[10px] text-slate-400">
                                {formatTime(task.createdAt)}
                              </span>
                            </div>
                            <h4 className="font-black text-slate-900 dark:text-white mb-1">{task.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleRunTask(task.id)}
                            disabled={runningTaskId === task.id}
                            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shrink-0"
                          >
                            {runningTaskId === task.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-xl rounded-[24px]">
              <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Completadas
                  <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-0">{completedTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                {completedTasks.length === 0 ? (
                  <div className="p-12 text-center">
                    <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="font-bold text-slate-500">Aún no hay tareas completadas</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {completedTasks.map(task => (
                      <div key={task.id} className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {task.result?.success ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-0 font-bold text-[10px]">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Éxito
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 border-0 font-bold text-[10px]">
                                  <XCircle className="h-3 w-3 mr-1" /> Fallido
                                </Badge>
                              )}
                              <span className="text-[10px] text-slate-400">
                                {(task.result?.timeSpent ?? 0) / 1000}s
                              </span>
                            </div>
                            <h4 className="font-black text-slate-900 dark:text-white mb-1">{task.title}</h4>
                            {task.result && (
                              <p className="text-xs text-slate-500">{task.result.summary}</p>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ACTIVITY TAB */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="border-border/40 bg-white dark:bg-slate-900 shadow-xl rounded-[24px]">
            <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <Activity className="h-5 w-5 text-purple-600" />
                Registro de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[600px] overflow-y-auto">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.flatMap(task => 
                  task.logs.map((log, i) => (
                    <div key={`${task.id}-${i}`} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 shrink-0",
                        log.level === "success" ? "bg-emerald-500" :
                        log.level === "error" ? "bg-red-500" :
                        log.level === "warning" ? "bg-amber-500" : "bg-slate-400"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-500">{formatTime(log.timestamp)}</span>
                          <Badge variant="outline" className="text-[10px] font-bold">{task.title}</Badge>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{log.message}</p>
                      </div>
                    </div>
                  ))
                ).reverse().slice(0, 50)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
