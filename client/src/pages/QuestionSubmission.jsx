import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { questionAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useSocket } from '@/lib/socket'
import { Camera, FileText, Upload, Loader2 } from 'lucide-react'

const QuestionSubmission = () => {
  const [questionText, setQuestionText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [submissionType, setSubmissionType] = useState('text') // 'text' or 'image'
  const [gradeLevel, setGradeLevel] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()
  const { socket } = useSocket()

  const submitMutation = useMutation({
    mutationFn: questionAPI.submitQuestion,
    onSuccess: (data) => {
      toast({
        title: "Question Submitted!",
        description: "Your question has been submitted for processing. You'll be notified when the answer is ready.",
      })
      
      // Listen for real-time answer updates
      if (socket) {
        socket.on(`answer-ready-${data.data.questionId}`, (answerData) => {
          toast({
            title: "Answer Ready!",
            description: "Your homework explanation is now available.",
          })
          navigate('/dashboard')
        })
      }
      
      // Reset form
      setQuestionText('')
      setSelectedFile(null)
      setGradeLevel('')
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "Failed to submit question. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
      setSubmissionType('image')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (submissionType === 'text' && !questionText.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter your homework question.",
        variant: "destructive",
      })
      return
    }
    
    if (submissionType === 'image' && !selectedFile) {
      toast({
        title: "Image Required",
        description: "Please select an image of the homework question.",
        variant: "destructive",
      })
      return
    }

    if (!gradeLevel) {
      toast({
        title: "Grade Level Required",
        description: "Please select your child's grade level for better explanations.",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append('questionText', questionText)
    formData.append('gradeLevel', gradeLevel)
    formData.append('submissionType', submissionType)
    
    if (selectedFile) {
      formData.append('image', selectedFile)
    }

    submitMutation.mutate(formData)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
          <p className="text-gray-600 mt-2">
            Submit your child's homework question and get a kid-friendly explanation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit Your Question</CardTitle>
            <CardDescription>
              Choose how you'd like to submit your homework question
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Submission Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={submissionType === 'text' ? 'default' : 'outline'}
                  onClick={() => setSubmissionType('text')}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Type Question
                </Button>
                <Button
                  type="button"
                  variant={submissionType === 'image' ? 'default' : 'outline'}
                  onClick={() => setSubmissionType('image')}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Camera className="h-6 w-6 mb-2" />
                  Upload Photo
                </Button>
              </div>

              {/* Text Input */}
              {submissionType === 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="question">Homework Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter your child's homework question here... (e.g., Solve 2x + 3 = 7)"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              )}

              {/* Image Upload */}
              {submissionType === 'image' && (
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Homework Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 5MB
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Grade Level */}
              <div className="space-y-2">
                <Label htmlFor="grade">Child's Grade Level</Label>
                <select
                  id="grade"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select grade level</option>
                  <option value="grade-1">Grade 1</option>
                  <option value="grade-2">Grade 2</option>
                  <option value="grade-3">Grade 3</option>
                  <option value="grade-4">Grade 4</option>
                  <option value="grade-5">Grade 5</option>
                  <option value="grade-6">Grade 6</option>
                  <option value="grade-7">Grade 7</option>
                  <option value="grade-8">Grade 8</option>
                  <option value="form-1">Form 1</option>
                  <option value="form-2">Form 2</option>
                  <option value="form-3">Form 3</option>
                  <option value="form-4">Form 4</option>
                </select>
              </div>

              {/* Pricing Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Pricing</h3>
                <p className="text-sm text-blue-800">
                  Each question costs KES 5-10 depending on complexity. 
                  You'll be prompted to pay via M-Pesa before receiving your answer.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Question'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Tips for Better Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Make sure images are clear and well-lit</li>
              <li>• Include all relevant information in your question</li>
              <li>• Specify the subject (Math, Science, English, etc.)</li>
              <li>• Select the correct grade level for age-appropriate explanations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default QuestionSubmission