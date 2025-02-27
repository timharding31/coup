import { useState, useCallback, useRef, useEffect } from 'react'
import { MessageData, MessageMap } from '~/store/messageStore'

const DEFAULT_MESSAGE_DELAY_MS = 500

interface UseMessageQueueOptions {
  delayMs?: number
}

/**
 * Hook for managing a message queue with delayed processing
 */
export function useMessageQueue({ delayMs = DEFAULT_MESSAGE_DELAY_MS }: UseMessageQueueOptions = {}) {
  const [messages, setMessages] = useState<Map<string, MessageData>>(new Map())
  const messageQueueRef = useRef<Array<() => void>>([])
  const processingQueueRef = useRef(false)
  const messageUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up the timeout on unmount
  useEffect(() => {
    return () => {
      if (messageUpdateTimeoutRef.current) {
        clearTimeout(messageUpdateTimeoutRef.current)
      }
    }
  }, [])

  // Process the message queue with delay between messages
  const processMessageQueue = useCallback(() => {
    if (messageQueueRef.current.length === 0) {
      processingQueueRef.current = false
      return
    }

    processingQueueRef.current = true
    const updateFn = messageQueueRef.current.shift()

    if (updateFn) {
      updateFn()
    }

    messageUpdateTimeoutRef.current = setTimeout(() => {
      messageUpdateTimeoutRef.current = null
      processMessageQueue()
    }, delayMs)
  }, [delayMs])

  // Schedule a message update
  const scheduleMessageUpdate = useCallback(
    (updateFn: () => void) => {
      messageQueueRef.current.push(updateFn)

      if (!processingQueueRef.current) {
        processMessageQueue()
      }
    },
    [processMessageQueue]
  )

  // Update messages with a map of new messages
  const updateMessages = useCallback(
    (messageMap: MessageMap | null, opts = { clear: false }) => {
      if (!messageMap) {
        return
      }

      scheduleMessageUpdate(() => {
        setMessages(prev => {
          const next = opts.clear ? new Map() : new Map(prev)

          for (const [playerId, message] of Object.entries(messageMap)) {
            next.set(playerId, message)
          }

          return next
        })
      })
    },
    [scheduleMessageUpdate]
  )

  // Clear specific player messages
  const clearPlayerMessages = useCallback(
    (playerIds: string[]) => {
      scheduleMessageUpdate(() => {
        setMessages(prev => {
          const next = new Map(prev)

          for (const playerId of playerIds) {
            next.delete(playerId)
          }

          return next
        })
      })
    },
    [scheduleMessageUpdate]
  )

  // Clear all messages
  const clearAllMessages = useCallback(() => {
    scheduleMessageUpdate(() => {
      setMessages(new Map())
    })
  }, [scheduleMessageUpdate])

  return {
    messages,
    updateMessages,
    clearPlayerMessages,
    clearAllMessages
  }
}
