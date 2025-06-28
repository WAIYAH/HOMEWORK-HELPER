import { Link } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Camera, Clock, Heart, Shield, Star } from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Help Your Child Succeed
            <br />
            <span className="text-yellow-300">Without the Stress</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Get instant, kid-friendly explanations for homework questions. 
            Upload a photo or type the question - we'll help you help your child learn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                <Link to="/login">Get Started Free</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                <Link to="/submit-question">Ask a Question</Link>
              </Button>
            </SignedIn>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Parents Love Homework Helper
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed specifically for busy parents who want to support their children's learning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardHeader>
                <Camera className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Snap & Submit</CardTitle>
                <CardDescription>
                  Take a photo of the homework or type the question directly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No more struggling to understand complex problems. Just snap a photo and get help instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Kid-Friendly Explanations</CardTitle>
                <CardDescription>
                  AI-powered answers designed for children to understand
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Step-by-step explanations using simple language that both you and your child can follow.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Instant Results</CardTitle>
                <CardDescription>
                  Get answers in seconds, not hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Real-time notifications when your answer is ready. No more waiting or frustration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Affordable Help for Every Family
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that works best for your family's needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-2xl">Pay Per Question</CardTitle>
                <CardDescription>Perfect for occasional help</CardDescription>
                <div className="text-3xl font-bold text-primary">KES 5-10</div>
                <div className="text-sm text-gray-500">per question</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Instant AI explanations
                  </li>
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Photo & text support
                  </li>
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Kid-friendly language
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-hover border-primary">
              <CardHeader>
                <div className="bg-primary text-white px-3 py-1 rounded-full text-sm w-fit mb-2">
                  Most Popular
                </div>
                <CardTitle className="text-2xl">Monthly Subscription</CardTitle>
                <CardDescription>Unlimited questions for active learners</CardDescription>
                <div className="text-3xl font-bold text-primary">KES 200</div>
                <div className="text-sm text-gray-500">per month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Unlimited questions
                  </li>
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Progress tracking
                  </li>
                  <li className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Achievement badges
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Kenyan Families
            </h2>
            <p className="text-xl text-gray-600">
              Safe, secure, and designed with your child's learning in mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Safe M-Pesa integration with encrypted transactions
              </p>
            </div>

            <div className="text-center">
              <Heart className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Child-Safe Content</h3>
              <p className="text-gray-600">
                All explanations are reviewed for age-appropriate language
              </p>
            </div>

            <div className="text-center">
              <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Educational Focus</h3>
              <p className="text-gray-600">
                Designed to help children learn, not just get answers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make Homework Time Easier?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of parents who are already helping their children succeed
          </p>
          <SignedOut>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Link to="/login">Start Helping Your Child Today</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Link to="/submit-question">Ask Your First Question</Link>
            </Button>
          </SignedIn>
        </div>
      </section>
    </div>
  )
}

export default Home