import axios from 'axios';

// AI prompts for different grade levels
const GRADE_PROMPTS = {
  'grade-1': 'Explain this in very simple words for a 6-year-old child. Use basic vocabulary and short sentences.',
  'grade-2': 'Explain this for a 7-year-old child. Use simple words and examples they can understand.',
  'grade-3': 'Explain this for an 8-year-old child. Use clear, simple language with relatable examples.',
  'grade-4': 'Explain this for a 9-year-old child. Use age-appropriate language and step-by-step explanations.',
  'grade-5': 'Explain this for a 10-year-old child. Use clear explanations with examples.',
  'grade-6': 'Explain this for an 11-year-old child. Use detailed but understandable explanations.',
  'grade-7': 'Explain this for a 12-year-old child. Use comprehensive explanations with examples.',
  'grade-8': 'Explain this for a 13-year-old child. Use detailed explanations and reasoning.',
  'form-1': 'Explain this for a 14-year-old high school student. Use detailed explanations and proper terminology.',
  'form-2': 'Explain this for a 15-year-old high school student. Use comprehensive explanations.',
  'form-3': 'Explain this for a 16-year-old high school student. Use advanced explanations.',
  'form-4': 'Explain this for a 17-year-old high school student preparing for exams. Use detailed, exam-focused explanations.'
};

// Subject-specific prompts
const SUBJECT_PROMPTS = {
  math: 'For this math problem, provide a step-by-step solution. Show each step clearly and explain why each step is necessary.',
  science: 'For this science question, explain the concept clearly with real-world examples that a child can relate to.',
  english: 'For this English question, explain grammar rules or literary concepts in simple terms with examples.',
  'social-studies': 'For this social studies question, explain historical or geographical concepts with context and examples.',
  other: 'Explain this homework question clearly and provide helpful examples.'
};

export const generateAIAnswer = async (questionText, gradeLevel, subject = 'other') => {
  try {
    const gradePrompt = GRADE_PROMPTS[gradeLevel] || GRADE_PROMPTS['grade-5'];
    const subjectPrompt = SUBJECT_PROMPTS[subject] || SUBJECT_PROMPTS['other'];

    const systemPrompt = `You are a helpful homework assistant for children. ${gradePrompt} ${subjectPrompt}

Your response should be in JSON format with the following structure:
{
  "explanation": "A clear, kid-friendly explanation of the answer",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "additionalNotes": "Any helpful tips or additional information"
}

Make sure your explanation is encouraging and builds confidence. Use positive language and avoid making the child feel bad about not knowing the answer.`;

    const userPrompt = `Please help me understand this homework question: ${questionText}`;

    // Try xAI Grok first, fallback to a simple response if not available
    let response;
    
    if (process.env.XAI_API_KEY) {
      response = await callXAIAPI(systemPrompt, userPrompt);
    } else {
      // Fallback response when no AI API is available
      response = generateFallbackResponse(questionText, gradeLevel, subject);
    }

    return response;

  } catch (error) {
    console.error('AI generation error:', error);
    
    // Return a fallback response
    return generateFallbackResponse(questionText, gradeLevel, subject);
  }
};

// Call xAI Grok API
const callXAIAPI = async (systemPrompt, userPrompt) => {
  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'grok-beta',
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    
    try {
      return JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      return {
        explanation: aiResponse,
        steps: ['Review the question carefully', 'Apply the relevant concepts', 'Check your answer'],
        additionalNotes: 'Remember to take your time and ask for help if you need it!'
      };
    }

  } catch (error) {
    console.error('xAI API error:', error.response?.data || error.message);
    throw error;
  }
};

// Generate fallback response when AI is not available
const generateFallbackResponse = (questionText, gradeLevel, subject) => {
  const isEarlyGrade = ['grade-1', 'grade-2', 'grade-3'].includes(gradeLevel);
  
  let explanation = '';
  let steps = [];
  let additionalNotes = '';

  // Basic pattern matching for common question types
  if (questionText.toLowerCase().includes('solve') && questionText.includes('=')) {
    // Math equation
    explanation = isEarlyGrade 
      ? "This is a math problem where we need to find what number makes the equation true. Let's work through it step by step!"
      : "This is an algebraic equation. We need to isolate the variable by performing the same operations on both sides of the equation.";
    
    steps = isEarlyGrade
      ? ["Look at what we have on both sides", "Think about what number would make it equal", "Check our answer by putting it back in"]
      : ["Identify the variable to solve for", "Move terms to isolate the variable", "Simplify and check the solution"];
    
    additionalNotes = "Remember, whatever you do to one side of the equation, you must do to the other side too!";
    
  } else if (questionText.toLowerCase().includes('what is') || questionText.includes('?')) {
    // General question
    explanation = isEarlyGrade
      ? "This is a great question! Let's think about what we know and what we need to find out."
      : "To answer this question, we need to break it down and use what we've learned.";
    
    steps = [
      "Read the question carefully",
      "Think about what information we have",
      "Use our knowledge to find the answer",
      "Check if our answer makes sense"
    ];
    
    additionalNotes = "Don't worry if it seems hard at first - every expert was once a beginner!";
    
  } else {
    // Default response
    explanation = isEarlyGrade
      ? "Let's work on this homework together! We can figure it out step by step."
      : "This question requires us to apply our knowledge systematically. Let's approach it methodically.";
    
    steps = [
      "Understand what the question is asking",
      "Gather the information we need",
      "Apply the appropriate method or formula",
      "Review our answer"
    ];
    
    additionalNotes = "Take your time and remember that making mistakes is part of learning!";
  }

  return {
    explanation,
    steps,
    additionalNotes
  };
};

// Validate AI response
export const validateAIResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return false;
  }

  const requiredFields = ['explanation', 'steps', 'additionalNotes'];
  return requiredFields.every(field => 
    response.hasOwnProperty(field) && 
    response[field] !== null && 
    response[field] !== undefined
  );
};

// Clean and format AI response
export const formatAIResponse = (response) => {
  return {
    explanation: typeof response.explanation === 'string' 
      ? response.explanation.trim() 
      : 'I can help you with this question!',
    
    steps: Array.isArray(response.steps) 
      ? response.steps.filter(step => typeof step === 'string' && step.trim().length > 0)
      : ['Let\'s work through this together!'],
    
    additionalNotes: typeof response.additionalNotes === 'string'
      ? response.additionalNotes.trim()
      : 'Remember, practice makes perfect!'
  };
};