export const handleSocketConnection = (socket, io) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  const userId = socket.handshake.auth.userId;
  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  }

  // Handle question submission events
  socket.on('question-submitted', (data) => {
    console.log('Question submitted via socket:', data);
    // Broadcast to user's room
    if (userId) {
      io.to(userId).emit('question-status-update', {
        questionId: data.questionId,
        status: 'submitted',
        message: 'Your question has been received and is being processed'
      });
    }
  });

  // Handle payment events
  socket.on('payment-initiated', (data) => {
    console.log('Payment initiated via socket:', data);
    if (userId) {
      io.to(userId).emit('payment-status-update', {
        paymentId: data.paymentId,
        status: 'initiated',
        message: 'Please complete the payment on your phone'
      });
    }
  });

  // Handle payment completion
  socket.on('payment-completed', (data) => {
    console.log('Payment completed via socket:', data);
    if (userId) {
      io.to(userId).emit('payment-status-update', {
        paymentId: data.paymentId,
        status: 'completed',
        message: 'Payment successful! Your question is being processed'
      });
    }
  });

  // Handle answer ready events
  socket.on('answer-ready', (data) => {
    console.log('Answer ready via socket:', data);
    if (userId) {
      io.to(userId).emit('answer-ready', {
        questionId: data.questionId,
        message: 'Your homework explanation is ready!',
        answer: data.answer
      });
    }
  });

  // Handle subscription events
  socket.on('subscription-activated', (data) => {
    console.log('Subscription activated via socket:', data);
    if (userId) {
      io.to(userId).emit('subscription-status-update', {
        status: 'active',
        plan: data.plan,
        message: 'Your subscription is now active! You have unlimited questions'
      });
    }
  });

  // Handle typing indicators for real-time feedback
  socket.on('typing-question', (data) => {
    if (userId) {
      socket.to(userId).emit('user-typing', {
        userId,
        isTyping: data.isTyping
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
};

// Utility functions for emitting events from controllers
export const emitToUser = (io, userId, event, data) => {
  io.to(userId).emit(event, data);
};

export const emitQuestionUpdate = (io, userId, questionId, status, message, additionalData = {}) => {
  emitToUser(io, userId, 'question-status-update', {
    questionId,
    status,
    message,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
};

export const emitPaymentUpdate = (io, userId, paymentId, status, message, additionalData = {}) => {
  emitToUser(io, userId, 'payment-status-update', {
    paymentId,
    status,
    message,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
};

export const emitAnswerReady = (io, userId, questionId, answer) => {
  emitToUser(io, userId, 'answer-ready', {
    questionId,
    answer,
    message: 'Your homework explanation is ready!',
    timestamp: new Date().toISOString()
  });
};

export const emitSubscriptionUpdate = (io, userId, status, plan, message) => {
  emitToUser(io, userId, 'subscription-status-update', {
    status,
    plan,
    message,
    timestamp: new Date().toISOString()
  });
};