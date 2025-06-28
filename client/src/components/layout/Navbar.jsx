import { Link, useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { BookOpen, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useUser()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-gray-900">
              Homework Helper
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <SignedIn>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/submit-question"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Ask Question
              </Link>
              <Link
                to="/subscription"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Plans
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Button onClick={() => navigate('/login')} variant="outline">
                Sign In
              </Button>
            </SignedOut>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <SignedIn>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary transition-colors px-2 py-1"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/submit-question"
                  className="text-gray-700 hover:text-primary transition-colors px-2 py-1"
                  onClick={toggleMenu}
                >
                  Ask Question
                </Link>
                <Link
                  to="/subscription"
                  className="text-gray-700 hover:text-primary transition-colors px-2 py-1"
                  onClick={toggleMenu}
                >
                  Plans
                </Link>
                <div className="px-2 py-1">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              <SignedOut>
                <Button
                  onClick={() => {
                    navigate('/login')
                    toggleMenu()
                  }}
                  variant="outline"
                  className="mx-2"
                >
                  Sign In
                </Button>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar