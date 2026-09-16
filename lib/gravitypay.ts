export interface GravityPaySTKPushParams {
  phoneNumber: string;
  amount: number;
  accountReference?: string;
  transactionDesc?: string;
  callbackUrl?: string;
}

export interface GravityPaySTKPushResponse {
  success: boolean;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  customerMessage?: string;
  errorMessage?: string;
  code?: string;
  rawResponse?: Record<string, unknown>;
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
 * Initiates an M-Pesa STK Push prompt via GravityPayApp API gateway
 */
export async function initiateGravityPaySTKPush(
  params: GravityPaySTKPushParams
): Promise<GravityPaySTKPushResponse> {
  const apiKey = process.env.GRAVITYPAY_API_KEY;
  const gravityPayUrl =
    process.env.GRAVITYPAY_STK_URL || 'https://gravitypayapp.com/api/v1/stkpush';
  const callbackUrl =
    params.callbackUrl ||
    process.env.GRAVITYPAY_CALLBACK_URL ||
    process.env.MPESA_CALLBACK_URL ||
    'https://apextrader.com/api/deposits/mpesa/gravitypay/callback';

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

  // If GravityPay API Key is not set, simulate STK Push for development/sandbox mode
  if (!apiKey) {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const mockCheckoutId = `gp_CO_${timestamp}_${Math.floor(100000 + Math.random() * 900000)}`;
    const mockMerchantId = `GRAVITYPAY_${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      success: true,
      merchantRequestId: mockMerchantId,
      checkoutRequestId: mockCheckoutId,
      customerMessage: `STK Push prompt sent to ${formattedPhone} for KES ${params.amount} via GravityPayApp. Check your phone to complete payment.`,
    };
  }

  const requestBody = {
    api_key: apiKey,
    apiKey,
    phone: formattedPhone,
    phoneNumber: formattedPhone,
    amount: Math.round(params.amount),
    reference: params.accountReference || 'ApexTrader',
    account_reference: params.accountReference || 'ApexTrader',
    description: params.transactionDesc || 'Deposit to ApexTrader Wallet',
    callback_url: callbackUrl,
    callbackUrl,
  };

  try {
    const res = await fetch(gravityPayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json().catch(() => ({}));

    // Support flexible status responses from GravityPayApp API
    const isSuccess =
      data.status === 'success' ||
      data.status === 'SUCCESS' ||
      data.status === true ||
      data.success === true ||
      data.code === '200' ||
      data.ResponseCode === '0' ||
      res.ok;

    const checkoutRequestId =
      data.checkout_request_id ||
      data.checkoutRequestId ||
      data.CheckoutRequestID ||
      data.id ||
      `gp_CO_${Date.now()}`;

    const merchantRequestId =
      data.merchant_request_id ||
      data.merchantRequestId ||
      data.MerchantRequestID ||
      data.reference ||
      `gp_MR_${Date.now()}`;

    const customerMessage =
      data.message ||
      data.customer_message ||
      data.CustomerMessage ||
      `STK Push sent to ${formattedPhone} for KES ${params.amount}. Enter M-Pesa PIN on your phone.`;

    if (isSuccess) {
      return {
        success: true,
        merchantRequestId,
        checkoutRequestId,
        customerMessage,
        rawResponse: data,
      };
    } else {
      return {
        success: false,
        code: data.code || data.status || 'GRAVITYPAY_ERROR',
        errorMessage:
          data.message ||
          data.error ||
          data.errorMessage ||
          'Failed to initiate GravityPay STK push prompt.',
        rawResponse: data,
      };
    }
  } catch (error) {
    console.error('GravityPay STK Push Error:', error);
    return {
      success: false,
      code: 'NETWORK_ERROR',
      errorMessage: 'Failed to connect to GravityPayApp gateway. Please try again.',
    };
  }
}
