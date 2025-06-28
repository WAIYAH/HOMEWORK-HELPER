import { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user) {
      const socketInstance = io(import.meta.env.VITE_SOCKET_IO_URL || 'http://localhost:5000', {
        auth: {
          userId: user.id,
        },
      })

      socketInstance.on('connect', () => {
        setConnected(true)
        console.log('Connected to server')
      })

      socketInstance.on('disconnect', () => {
        setConnected(false)
        console.log('Disconnected from server')
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [user, isLoaded])

  const value = {
    socket,
    connected,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}