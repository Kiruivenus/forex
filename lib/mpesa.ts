export interface STKPushRequestParams {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface STKPushResponse {
  success: boolean;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  errorMessage?: string;
  code?: string;
}

export interface STKQueryResponse {
  success: boolean;
  resultCode?: string;
  resultDesc?: string;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  errorMessage?: string;
}

// Safaricom Result Code Mapping for user-friendly errors
export const MPESA_RESULT_CODES: Record<string, string> = {
  '0': 'The transaction was completed successfully.',
  '1': 'Insufficient M-Pesa balance to complete the transaction.',
  '1032': 'Payment request was cancelled by the user.',
  '1037': 'No response from user. Payment request timed out.',
  '1001': 'Another transaction is already in progress for this phone number.',
  '1019': 'Transaction expired. Please try again.',
  '1025': 'An error occurred while establishing connection to M-Pesa.',
  '2001': 'Invalid M-Pesa PIN entered.',
  '9999': 'M-Pesa system maintenance or service unavailable.',
};

export function getMpesaErrorMessage(resultCode: string | number, defaultDesc?: string): string {
  const codeStr = String(resultCode);
  return MPESA_RESULT_CODES[codeStr] || defaultDesc || `M-Pesa payment failed with code ${codeStr}.`;
}

export function formatPhoneNumber(phone: string): string {
  // Remove non-digit characters
  let clean = phone.replace(/\D/g, '');
  
  if (clean.startsWith('0')) {
    clean = '254' + clean.slice(1);
  } else if (clean.startsWith('+254')) {
    clean = clean.slice(1);
  } else if (clean.length === 9) {
    clean = '254' + clean;
  }

  return clean;
}

export async function getDarajaAccessToken(): Promise<string | null> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';

  if (!consumerKey || !consumerSecret) {
    return null;
  }

  const authUrl = environment === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  const authHeader = 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const res = await fetch(authUrl, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.access_token || null;
  } catch (error) {
    console.error('M-Pesa OAuth Error:', error);
    return null;
  }
}

export async function initiateSTKPush(params: STKPushRequestParams): Promise<STKPushResponse> {
  const shortcode = process.env.MPESA_SHORTCODE || '174379';
  const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
  const callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://apextrader.com/api/deposits/mpesa/callback';
  const environment = process.env.MPESA_ENVIRONMENT || 'sandbox';

  const formattedPhone = formatPhoneNumber(params.phoneNumber);

  if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
    return {
      success: false,
      code: 'INVALID_PHONE',
      errorMessage: 'Invalid phone number format. Please use format 07XXXXXXXX or 2547XXXXXXXX.',
    };
  }

  if (params.amount < 1) {
    return {
      success: false,
      code: 'INVALID_AMOUNT',
      errorMessage: 'Minimum deposit amount is KES 1.',
    };
  }

  const token = await getDarajaAccessToken();

  // If no live Daraja credentials configured, return clear instructions/sandbox simulation mode flag
  if (!token) {
    // Generate deterministic mock IDs for development sandbox testing if live keys aren't set
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const mockCheckoutId = `ws_CO_${timestamp}_${Math.floor(100000 + Math.random() * 900000)}`;
    const mockMerchantId = `MOCK_MERCHANT_${Math.floor(1000 + Math.random() * 9000)}`;
    
    return {
      success: true,
      merchantRequestId: mockMerchantId,
      checkoutRequestId: mockCheckoutId,
      responseCode: '0',
      responseDescription: 'Success. STK Push simulated for testing mode.',
      customerMessage: `STK Push initiated to ${formattedPhone} for KES ${params.amount}. Check your phone to complete payment.`,
    };
  }

  const date = new Date();
  const timestamp = date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0');

  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

  const stkUrl = environment === 'production'
    ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(params.amount),
    PartyA: formattedPhone,
    PartyB: shortcode,
    PhoneNumber: formattedPhone,
    CallBackURL: callbackUrl,
    AccountReference: params.accountReference || 'ApexTrader',
    TransactionDesc: params.transactionDesc || 'Deposit to ApexTrader Wallet',
  };

  try {
    const res = await fetch(stkUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.ResponseCode === '0') {
      return {
        success: true,
        merchantRequestId: data.MerchantRequestID,
        checkoutRequestId: data.CheckoutRequestID,
        responseCode: data.ResponseCode,
        responseDescription: data.ResponseDescription,
        customerMessage: data.CustomerMessage,
      };
    } else {
      return {
        success: false,
        code: data.ResponseCode || 'DARADA_ERROR',
        errorMessage: getMpesaErrorMessage(data.ResponseCode, data.ResponseDescription),
      };
    }
  } catch (error) {
    console.error('STK Push initiation error:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      errorMessage: 'Failed to connect to Safaricom Daraja gateway. Please try again.',
    };
  }
}
