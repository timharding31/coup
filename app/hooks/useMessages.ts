import { useState, useCallback } from 'react'
import { MessageData, MessageMap } from '~/utils/messages'

/**
 * Hook for managing player messages
 */
export function useMessages() {
  const [messages, setMessages] = useState<Map<string, MessageData>>(new Map())

  // Update messages with a map of new messages
  const updateMessages = useCallback((messageMap: MessageMap | null, opts = { clear: false }) => {
    if (!messageMap) {
      return
    }

    setMessages(prev => {
      const next = opts.clear ? new Map() : new Map(prev)

      for (const [playerId, message] of Object.entries(messageMap)) {
        next.set(playerId, message)
      }

      return next
    })
  }, [])

  // Clear specific player messages
  const clearPlayerMessages = useCallback((playerIds: string[]) => {
    setMessages(prev => {
      const next = new Map(prev)

      for (const playerId of playerIds) {
        next.delete(playerId)
      }

      return next
    })
  }, [])

  // Clear all messages
  const clearAllMessages = useCallback(() => {
    setMessages(new Map())
  }, [])

  return {
    messages,
    updateMessages,
    clearPlayerMessages,
    clearAllMessages
  }
}
