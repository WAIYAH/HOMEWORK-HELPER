import { SignIn } from '@clerk/clerk-react'

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to continue helping your child learn
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn 
            routing="path" 
            path="/login"
            redirectUrl="/dashboard"
            signUpUrl="/login"
          />
        </div>
      </div>
    </div>
  )
}

export default Login