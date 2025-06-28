import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { subscriptionAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { Check, Star, Zap, Crown, Loader2 } from 'lucide-react'

const SubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const { toast } = useToast()

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: subscriptionAPI.getPlans,
  })

  const { data: currentSubscription } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: subscriptionAPI.getSubscription,
  })

  const subscribeMutation = useMutation({
    mutationFn: subscriptionAPI.subscribe,
    onSuccess: () => {
      toast({
        title: "Subscription Activated!",
        description: "Your subscription has been activated. You now have unlimited access!",
      })
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: error.response?.data?.message || "Failed to activate subscription. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleSubscribe = (planId) => {
    setSelectedPlan(planId)
    subscribeMutation.mutate(planId)
  }

  const defaultPlans = [
    {
      id: 'pay-per-use',
      name: 'Pay Per Question',
      description: 'Perfect for occasional help',
      price: 5,
      priceMax: 10,
      interval: 'per question',
      features: [
        'Instant AI explanations',
        'Photo & text support',
        'Kid-friendly language',
        'Basic support'
      ],
      popular: false,
      color: 'blue'
    },
    {
      id: 'monthly',
      name: 'Monthly Unlimited',
      description: 'Best for active learners',
      price: 200,
      interval: 'per month',
      features: [
        'Unlimited questions',
        'Priority AI processing',
        'Advanced explanations',
        'Progress tracking',
        'Achievement badges',
        'Priority support',
        'Family dashboard'
      ],
      popular: true,
      color: 'purple'
    }
  ]

  const planData = plans?.data || defaultPlans
  const isSubscribed = currentSubscription?.data?.status === 'active'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your family's learning needs. 
            All plans include our AI-powered homework explanations.
          </p>
        </div>

        {/* Current Subscription Status */}
        {isSubscribed && (
          <div className="mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Active Subscription</h3>
                    <p className="text-sm text-green-700">
                      You currently have an active {currentSubscription.data.plan.name} subscription
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {planData.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} card-hover`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mb-4">
                  {plan.id === 'pay-per-use' ? (
                    <Zap className="h-12 w-12 text-blue-500 mx-auto" />
                  ) : (
                    <Crown className="h-12 w-12 text-purple-500 mx-auto" />
                  )}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold text-gray-900">
                    {plan.priceMax ? (
                      <>
                        {formatCurrency(plan.price)}-{formatCurrency(plan.priceMax)}
                      </>
                    ) : (
                      formatCurrency(plan.price)
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{plan.interval}</div>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.id === 'pay-per-use' ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled
                  >
                    Current Default Option
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribeMutation.isPending || isSubscribed}
                  >
                    {subscribeMutation.isPending && selectedPlan === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isSubscribed ? (
                      'Already Subscribed'
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does payment work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We use M-Pesa for secure payments. For pay-per-use, you'll be charged 
                  after submitting each question. Monthly subscriptions are billed automatically.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can cancel your monthly subscription at any time. 
                  You'll continue to have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What subjects are supported?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We support all major subjects including Mathematics, Science, English, 
                  Social Studies, and more for grades 1-12.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How fast are the answers?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Most answers are delivered within 30 seconds. Complex questions 
                  may take up to 2 minutes. You'll get real-time notifications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPlans