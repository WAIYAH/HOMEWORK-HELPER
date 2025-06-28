import User from '../models/User.js';
import Question from '../models/Question.js';

// Badge definitions
const AVAILABLE_BADGES = {
  'first-question': {
    id: 'first-question',
    name: 'Getting Started',
    description: 'Asked your first question',
    icon: 'star'
  },
  'math-master': {
    id: 'math-master',
    name: 'Math Master',
    description: 'Completed 10 math questions',
    icon: 'calculator'
  },
  'science-explorer': {
    id: 'science-explorer',
    name: 'Science Explorer',
    description: 'Completed 10 science questions',
    icon: 'microscope'
  },
  'consistent-learner': {
    id: 'consistent-learner',
    name: 'Consistent Learner',
    description: 'Asked questions for 7 consecutive days',
    icon: 'calendar'
  },
  'question-streak': {
    id: 'question-streak',
    name: 'Question Streak',
    description: 'Completed 25 questions',
    icon: 'fire'
  },
  'homework-hero': {
    id: 'homework-hero',
    name: 'Homework Hero',
    description: 'Completed 50 questions',
    icon: 'trophy'
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const user = await User.findByClerkId(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive information
    const profile = {
      id: user._id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      subscription: user.subscription,
      stats: user.stats,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({ data: profile });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const { preferences } = req.body;

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        $set: { 
          preferences: {
            ...preferences,
            updatedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getBadges = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const user = await User.findByClerkId(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for new badges to award
    await checkAndAwardBadges(user);

    res.json({ data: user.badges });

  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      message: 'Failed to fetch badges',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const user = await User.findByClerkId(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional stats from questions
    const questionStats = await Question.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          answeredQuestions: {
            $sum: { $cond: [{ $eq: ['$status', 'answered'] }, 1, 0] }
          },
          totalSpent: { $sum: '$payment.amount' },
          subjectBreakdown: {
            $push: '$subject'
          }
        }
      }
    ]);

    const stats = questionStats[0] || {
      totalQuestions: 0,
      answeredQuestions: 0,
      totalSpent: 0,
      subjectBreakdown: []
    };

    // Calculate subject distribution
    const subjectCounts = stats.subjectBreakdown.reduce((acc, subject) => {
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {});

    res.json({
      data: {
        ...user.stats.toObject(),
        ...stats,
        subjectDistribution: subjectCounts,
        badgeCount: user.badges.length,
        subscriptionStatus: user.subscription.status,
        joinDate: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to check and award badges
async function checkAndAwardBadges(user) {
  try {
    const userId = user.clerkId;
    let badgesAwarded = false;

    // First question badge
    if (user.stats.totalQuestions >= 1 && !user.badges.find(b => b.id === 'first-question')) {
      user.addBadge(AVAILABLE_BADGES['first-question']);
      badgesAwarded = true;
    }

    // Question streak badges
    if (user.stats.totalQuestions >= 25 && !user.badges.find(b => b.id === 'question-streak')) {
      user.addBadge(AVAILABLE_BADGES['question-streak']);
      badgesAwarded = true;
    }

    if (user.stats.totalQuestions >= 50 && !user.badges.find(b => b.id === 'homework-hero')) {
      user.addBadge(AVAILABLE_BADGES['homework-hero']);
      badgesAwarded = true;
    }

    // Subject-specific badges
    const mathQuestions = await Question.countDocuments({ 
      userId, 
      subject: 'math',
      status: 'answered'
    });

    if (mathQuestions >= 10 && !user.badges.find(b => b.id === 'math-master')) {
      user.addBadge(AVAILABLE_BADGES['math-master']);
      badgesAwarded = true;
    }

    const scienceQuestions = await Question.countDocuments({ 
      userId, 
      subject: 'science',
      status: 'answered'
    });

    if (scienceQuestions >= 10 && !user.badges.find(b => b.id === 'science-explorer')) {
      user.addBadge(AVAILABLE_BADGES['science-explorer']);
      badgesAwarded = true;
    }

    // Save if badges were awarded
    if (badgesAwarded) {
      await user.save();
    }

  } catch (error) {
    console.error('Badge checking error:', error);
  }
}