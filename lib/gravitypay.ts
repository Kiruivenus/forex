import crypto from 'crypto';

export interface GravityPaySTKPushParams {
  phoneNumber: string;
  amount: number;
  accountReference?: string;
  transactionDesc?: string;
  metadata?: Record<string, unknown>;
}

export interface GravityPaySTKPushResponse {
  success: boolean;
  transactionId?: string;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  customerMessage?: string;
  errorMessage?: string;
  code?: string;
  rawResponse?: Record<string, unknown>;
}

export interface GravityPayStatusResponse {
  success: boolean;
  status?: string;
  checkoutRequestId?: string;
  mpesaReceipt?: string;
  errorMessage?: string;
}

export function formatGravityPayPhone(phone: string): string {
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

/**
 * Verifies GravityPay Webhook HMAC SHA-256 signature header
 */
export function verifyGravityPayWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.GRAVITYPAY_WEBHOOK_SECRET;
  if (!secret) return true; // Skip verification if webhook secret is not configured in dev environment
  if (!signatureHeader) return false;

  try {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader.toLowerCase()),
      Buffer.from(computedSignature.toLowerCase())
    );
  } catch (err) {
    console.error('GravityPay signature verification error:', err);
    return false;
  }
}

/**
 * Initiates an M-Pesa STK Push prompt via official GravityPayApp API (https://api.gravitypayapp.com/api/v1/stk/push)
 */
export async function initiateGravityPaySTKPush(
  params: GravityPaySTKPushParams
): Promise<GravityPaySTKPushResponse> {
  const secretKey = process.env.GRAVITYPAY_SECRET_KEY || process.env.GRAVITYPAY_API_KEY;
  const publicKey = process.env.GRAVITYPAY_PUBLIC_KEY || process.env.GRAVITYPAY_API_KEY;
  const baseUrl = process.env.GRAVITYPAY_BASE_URL || 'https://api.gravitypayapp.com';
  const stkEndpoint = `${baseUrl}/api/v1/stk/push`;

  const formattedPhone = formatGravityPayPhone(params.phoneNumber);

  if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
    return {
      success: false,
      code: 'INVALID_PHONE',
      errorMessage: 'Invalid Kenyan phone number format. Please use format 07XXXXXXXX or 01XXXXXXXX.',
    };
  }

  if (params.amount < 1) {
    return {
      success: false,
      code: 'INVALID_AMOUNT',
      errorMessage: 'Minimum deposit amount is KES 1.',
    };
  }

  // Generate safe 12-char reference for strict GravityPay validation
  const rawRef = params.accountReference || 'PalOption';
  const sanitizedReference = rawRef.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'PalOption';
  const truncatedDesc = (params.transactionDesc || 'PalOption Deposit').slice(0, 20);

  // Development sandbox simulation mode if API key is not set
  if (!secretKey) {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const mockCheckoutId = `ws_CO_${timestamp}_${Math.floor(100000 + Math.random() * 900000)}`;
    const mockMerchantId = `45091-${Math.floor(100000 + Math.random() * 900000)}-1`;
    const mockTxId = `tx_${Date.now()}`;

    return {
      success: true,
      transactionId: mockTxId,
      merchantRequestId: mockMerchantId,
      checkoutRequestId: mockCheckoutId,
      customerMessage: `STK Push prompt sent to ${formattedPhone} for KES ${params.amount} via GravityPay. Check your phone to complete payment.`,
    };
  }

  const requestBody = {
    phoneNumber: formattedPhone,
    amount: Math.round(params.amount),
    reference: sanitizedReference,
    description: truncatedDesc,
    metadata: params.metadata || {},
  };

  try {
    const res = await fetch(stkEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secretKey}`,
        'x-api-key': publicKey || secretKey,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json().catch(() => ({}));

    if (data.success || res.ok) {
      const responseData = data.data || {};
      const checkoutRequestId =
        responseData.checkoutRequestId ||
        responseData.checkout_request_id ||
        data.checkoutRequestId ||
        `ws_CO_${Date.now()}`;

      const merchantRequestId =
        responseData.merchantRequestId ||
        responseData.merchant_request_id ||
        data.merchantRequestId ||
        `MR_${Date.now()}`;

      const transactionId =
        responseData.transactionId ||
        responseData.transaction_id ||
        data.transactionId;

      return {
        success: true,
        transactionId,
        merchantRequestId,
        checkoutRequestId,
        customerMessage: data.message || `STK Push sent to ${formattedPhone} for KES ${params.amount}. Please enter your M-Pesa PIN.`,
        rawResponse: data,
      };
    } else {
      return {
        success: false,
        code: String(res.status || data.errorCode || 'GRAVITYPAY_ERROR'),
        errorMessage:
          data.message ||
          data.errorMessage ||
          data.error ||
          'Failed to initiate GravityPay STK push prompt.',
        rawResponse: data,
      };
    }
  } catch (error) {
    console.error('GravityPay STK Push Error:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      errorMessage: 'Failed to connect to GravityPay gateway. Please check server network connection.',
    };
  }
}

/**
 * Checks status of an STK push transaction using official GravityPay status API
 */
export async function checkGravityPayStatus(
  checkoutRequestId: string
): Promise<GravityPayStatusResponse> {
  const secretKey = process.env.GRAVITYPAY_SECRET_KEY || process.env.GRAVITYPAY_API_KEY;
  const publicKey = process.env.GRAVITYPAY_PUBLIC_KEY || process.env.GRAVITYPAY_API_KEY;
  const baseUrl = process.env.GRAVITYPAY_BASE_URL || 'https://api.gravitypayapp.com';

  if (!secretKey) {
    return { success: false, errorMessage: 'API key not configured' };
  }

  const statusUrl = `${baseUrl}/api/v1/stk/status/${encodeURIComponent(checkoutRequestId)}`;

  try {
    const res = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'x-api-key': publicKey || secretKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (data.success || res.ok) {
      const statusData = data.data || data;
      return {
        success: true,
        status: statusData.status,
        checkoutRequestId: statusData.checkoutRequestId || checkoutRequestId,
        mpesaReceipt: statusData.mpesaReceipt,
      };
    } else {
      return {
        success: false,
        errorMessage: data.message || 'Status query failed',
      };
    }
  } catch (err) {
    console.error('GravityPay status query error:', err);
    return { success: false, errorMessage: 'Network error querying status' };
  }
}
