// =============================================================================
// NUREA - Tipos para el sistema de Chat
// =============================================================================

export type UserRole = 'patient' | 'professional' | 'admin'
export type UserStatus = 'online' | 'offline' | 'away'
export type MessageStatus = 'sent' | 'delivered' | 'read'
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'system'
export type RequestStatus = 'pending' | 'accepted' | 'rejected'

// Perfil simplificado para chat (sólo campos necesarios)
export interface ChatProfile {
  id: string
  first_name: string
  last_name: string
  full_name: string // computed: first_name + last_name
  avatar_url: string | null
  role: UserRole
  response_time: string
  status: UserStatus
  last_seen: string
}

export interface Conversation {
  id: string
  request_status: RequestStatus
  initiated_by: string | null
  professional_id: string | null
  request_message: string | null
  responded_at: string | null
  created_at: string
  updated_at: string
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  joined_at: string
  last_read_at: string
}

export interface ChatMessageDB {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: MessageType
  file_url: string | null
  file_name: string | null
  file_size: number | null
  file_type: string | null
  status: MessageStatus
  created_at: string
  updated_at: string
}

// Tipos UI (para componentes)
export interface ConversationListItem {
  id: string
  name: string
  avatar: string | null
  initials: string
  lastMessage: string
  timestamp: string
  unread: number
  status: UserStatus
  otherParticipant: ChatProfile
  requestStatus?: RequestStatus
  initiatedBy?: string | null
}

export interface ChatMessage {
  id: string
  content: string
  timestamp: string
  isOwn: boolean
  status: MessageStatus
  messageType: MessageType
  fileUrl?: string
  fileName?: string
}

// Inputs para acciones
export interface SendMessageInput {
  conversationId: string
  content: string
  messageType?: MessageType
  fileUrl?: string
  fileName?: string
  fileSize?: number
}
