import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Toaster } from '@/components/ui/toaster'
import { SocketProvider } from '@/lib/socket'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import QuestionSubmission from '@/pages/QuestionSubmission'
import SubscriptionPlans from '@/pages/SubscriptionPlans'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

function App() {
  return (
    <SocketProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={
                <SignedOut>
                  <Login />
                </SignedOut>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/submit-question" 
              element={
                <ProtectedRoute>
                  <QuestionSubmission />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription" 
              element={
                <ProtectedRoute>
                  <SubscriptionPlans />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </SocketProvider>
  )
}

export default App