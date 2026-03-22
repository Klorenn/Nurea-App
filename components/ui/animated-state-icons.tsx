"use client"

import { motion, AnimatePresence } from "framer-motion"

// ─── Notification Bell ────────────────────────────────────────────────────────

interface NotificationIconProps {
  hasNotifications?: boolean
  className?: string
}

export function NotificationIcon({ hasNotifications = false, className = "h-5 w-5" }: NotificationIconProps) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate={hasNotifications ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </motion.svg>
  )
}

// ─── Send Icon ────────────────────────────────────────────────────────────────

interface SendIconProps {
  isSending?: boolean
  className?: string
}

export function SendIcon({ isSending = false, className = "h-4 w-4" }: SendIconProps) {
  return (
    <AnimatePresence mode="wait">
      {isSending ? (
        <motion.svg
          key="sending"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.4, rotate: { duration: 0.8, repeat: Infinity, ease: "linear" } }}
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </motion.svg>
      ) : (
        <motion.svg
          key="send"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 4 }}
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2 }}
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </motion.svg>
      )}
    </AnimatePresence>
  )
}

// ─── Copy / Copied Icon ───────────────────────────────────────────────────────

interface CopiedIconProps {
  copied?: boolean
  className?: string
}

export function CopiedIcon({ copied = false, className = "h-4 w-4" }: CopiedIconProps) {
  return (
    <AnimatePresence mode="wait">
      {copied ? (
        <motion.svg
          key="check"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <motion.path
            d="M20 6 9 17l-5-5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.svg>
      ) : (
        <motion.svg
          key="copy"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </motion.svg>
      )}
    </AnimatePresence>
  )
}

// ─── Eye Toggle Icon ──────────────────────────────────────────────────────────

interface EyeToggleIconProps {
  visible?: boolean
  className?: string
}

export function EyeToggleIcon({ visible = false, className = "h-4 w-4" }: EyeToggleIconProps) {
  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.svg
          key="eye-open"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.15 }}
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </motion.svg>
      ) : (
        <motion.svg
          key="eye-closed"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.15 }}
        >
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <line x1="2" x2="22" y1="2" y2="22" />
        </motion.svg>
      )}
    </AnimatePresence>
  )
}

// ─── Heart Icon ───────────────────────────────────────────────────────────────

interface HeartIconProps {
  liked?: boolean
  className?: string
}

export function HeartIcon({ liked = false, className = "h-4 w-4" }: HeartIconProps) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={liked ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate={liked ? { scale: [1, 1.35, 0.9, 1.1, 1] } : { scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </motion.svg>
  )
}
