import { BookOpen, Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold text-gray-900">Homework Helper</span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for busy parents</span>
          </div>
          
          <div className="text-sm text-gray-500 mt-4 md:mt-0">
            © 2024 Homework Helper. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer