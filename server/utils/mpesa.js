import axios from 'axios';

const MPESA_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

// Generate M-Pesa access token
const generateAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('M-Pesa token generation error:', error.response?.data || error.message);
    throw new Error('Failed to generate M-Pesa access token');
  }
};

// Generate M-Pesa password
const generatePassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');
  
  return { password, timestamp };
};

// Initiate STK Push
export const initiateMpesaPayment = async ({
  phoneNumber,
  amount,
  accountReference,
  transactionDesc
}) => {
  try {
    const accessToken = await generateAccessToken();
    const { password, timestamp } = generatePassword();

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/payments/mpesa/callback`,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.ResponseCode === '0') {
      return {
        success: true,
        data: response.data,
        message: 'STK push initiated successfully'
      };
    } else {
      return {
        success: false,
        message: response.data.errorMessage || 'STK push failed',
        data: response.data
      };
    }

  } catch (error) {
    console.error('M-Pesa STK push error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.errorMessage || 'Failed to initiate payment',
      error: error.message
    };
  }
};

// Query STK Push status
export const queryMpesaTransaction = async (checkoutRequestId) => {
  try {
    const accessToken = await generateAccessToken();
    const { password, timestamp } = generatePassword();

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
      message: 'Transaction status retrieved successfully'
    };

  } catch (error) {
    console.error('M-Pesa query error:', error.response?.data || error.message);
    return {
      success: false,
      message: 'Failed to query transaction status',
      error: error.message
    };
  }
};

// Validate M-Pesa phone number
export const validatePhoneNumber = (phoneNumber) => {
  // Remove any spaces or special characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid Kenyan number
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return cleaned;
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    return '254' + cleaned;
  }
  
  throw new Error('Invalid phone number format. Use 254XXXXXXXXX format.');
};

// Format amount for M-Pesa (must be integer)
export const formatAmount = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount < 1) {
    throw new Error('Amount must be a valid number greater than 0');
  }
  return Math.round(numAmount);
};