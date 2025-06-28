import { useQuery } from '@tanstack/react-query'
import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { questionAPI, userAPI } from '@/lib/api'
import { formatDate, formatCurrency, truncateText } from '@/lib/utils'
import { BookOpen, Clock, Star, Trophy, TrendingUp, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useUser()

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: questionAPI.getQuestions,
  })

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: userAPI.getBadges,
  })

  const recentQuestions = questions?.data?.slice(0, 5) || []
  const userBadges = badges?.data || []

  const stats = {
    totalQuestions: questions?.data?.length || 0,
    answeredQuestions: questions?.data?.filter(q => q.status === 'answered').length || 0,
    totalSpent: questions?.data?.reduce((sum, q) => sum + (q.amount || 0), 0) || 0,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'Parent'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's how your child's learning journey is progressing
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">
                Questions submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Answered</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.answeredQuestions}</div>
              <p className="text-xs text-muted-foreground">
                Questions answered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
              <p className="text-xs text-muted-foreground">
                Investment in learning
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Questions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Questions</CardTitle>
                    <CardDescription>
                      Your latest homework submissions
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link to="/submit-question">
                      <Plus className="h-4 w-4 mr-2" />
                      Ask Question
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {questionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {recentQuestions.map((question) => (
                      <div key={question._id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {truncateText(question.questionText, 80)}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>{formatDate(question.createdAt)}</span>
                              <Badge 
                                variant={question.status === 'answered' ? 'default' : 'secondary'}
                              >
                                {question.status}
                              </Badge>
                              <span>{formatCurrency(question.amount || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No questions yet</p>
                    <Button asChild>
                      <Link to="/submit-question">Ask Your First Question</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Badges earned through learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                {badgesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : userBadges.length > 0 ? (
                  <div className="space-y-3">
                    {userBadges.map((badge) => (
                      <div key={badge.id} className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-gray-500">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Complete questions to earn badges!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full" variant="outline">
                  <Link to="/submit-question">
                    <Plus className="h-4 w-4 mr-2" />
                    Ask New Question
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/subscription">
                    <Star className="h-4 w-4 mr-2" />
                    View Plans
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard