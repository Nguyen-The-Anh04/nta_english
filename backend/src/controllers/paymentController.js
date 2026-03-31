const crypto = require('crypto');
const https = require('https');

// ==================== MOMO PAYMENT ====================

// Tạo thanh toán MOMO
const createMoMoPayment = async (req, res) => {
  try {
    const { order_id, amount, order_info, redirect_url, ipn_url } = req.body;

    // MOMO Test/Sandbox credentials (SampoX)
    const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529";
    const accessKey = process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j";
    const secretKey = process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
    const endpoint = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";

    const requestId = partnerCode + new Date().getTime();
    const orderId = order_id || requestId;
    const orderInfoText = order_info || "Thanh toán đơn hàng NTA English";
    const redirectUrl = redirect_url || "http://localhost:3000/payment-result";
    const ipnUrl = ipn_url || "http://localhost:5000/api/payment/momo/ipn";
    const requestType = "payWithMethod";
    const extraData = "";

    // Tạo chữ ký (signature)
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfoText}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = JSON.stringify({
      partnerCode,
      partnerName: "NTA English",
      storeId: "NTAEnglishStore",
      requestId,
      amount,
      orderId,
      orderInfo: orderInfoText,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      requestType,
      extraData,
      signature,
    });

    // Gọi API MOMO
    const result = await callMoMoAPI(endpoint, requestBody);

    if (result.resultCode === 0) {
      res.json({
        success: true,
        data: {
          payUrl: result.payUrl,
          orderId: orderId,
          requestId: requestId,
          amount: amount,
          qrCode: result.qrCodeUrl || result.payUrl,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || "Tạo thanh toán MOMO thất bại",
        resultCode: result.resultCode,
      });
    }
  } catch (error) {
    console.error("Create MOMO payment error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi tạo thanh toán MOMO" });
  }
};

// Xử lý IPN từ MOMO
const handleMoMoIPN = async (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    // Xác thực chữ ký
    const accessKey = process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j";
    const secretKey = process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: "Chữ ký không hợp lệ" });
    }

    // Xử lý kết quả thanh toán
    if (resultCode === 0) {
      // Thanh toán thành công
      console.log(`MOMO Payment success for order ${orderId}, transId: ${transId}`);
      // TODO: Cập nhật trạng thái đơn hàng trong database
    } else {
      // Thanh toán thất bại
      console.log(`MOMO Payment failed for order ${orderId}, resultCode: ${resultCode}`);
    }

    res.json({ success: true, message: "IPN received" });
  } catch (error) {
    console.error("Handle MOMO IPN error:", error);
    res.status(500).json({ success: false, message: "Lỗi xử lý IPN" });
  }
};

// Kiểm tra trạng thái giao dịch MOMO
const checkMoMoTransactionStatus = async (req, res) => {
  try {
    const { orderId } = req.body;

    const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529";
    const accessKey = process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j";
    const secretKey = process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
    const endpoint = process.env.MOMO_ENDPOINT_STATUS || "https://test-payment.momo.vn/v2/gateway/api/query";

    const requestId = partnerCode + new Date().getTime();

    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
    
    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = JSON.stringify({
      partnerCode,
      requestId,
      orderId,
      signature,
      lang: "vi",
    });

    const result = await callMoMoAPI(endpoint, requestBody);

    res.json({
      success: true,
      data: {
        orderId: result.orderId,
        resultCode: result.resultCode,
        message: result.message,
        amount: result.amount,
        transId: result.transId,
      },
    });
  } catch (error) {
    console.error("Check MOMO transaction status error:", error);
    res.status(500).json({ success: false, message: "Lỗi kiểm tra trạng thái giao dịch" });
  }
};

// Helper function gọi API MOMO
const callMoMoAPI = (endpoint, requestBody) => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
};

// ==================== VNPAY PAYMENT ====================

// Tạo thanh toán VNPAY
const createVNPayPayment = async (req, res) => {
  try {
    const { order_id, amount, order_info, ip_addr, bank_code } = req.body;

    // VNPAY Test/Sandbox credentials
    const vnp_TmnCode = process.env.VNPAY_TMN_CODE || "2QXUI4B4";
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || "SecretKey123";
    const vnp_Url = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL || "http://localhost:3000/payment-result";

    const date = new Date();
    const createDate = date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const orderId = order_id || `VNP${date.getTime()}`;
    const amountValue = amount * 100; // VNPAY yêu cầu amount * 100
    const orderInfoText = order_info || "Thanh toan don hang NTA English";
    const orderType = "billpayment";
    const locale = "vn";
    const currCode = "VND";
    const vnp_IpAddr = ip_addr || "127.0.0.1";

    // Tạo chữ ký
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfoText;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amountValue;
    vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = vnp_IpAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    
    if (bank_code) {
      vnp_Params['vnp_BankCode'] = bank_code;
    }

    // Sắp xếp params theo alphabet
    vnp_Params = sortObject(vnp_Params);

    // Tạo query string
    const signData = Object.keys(vnp_Params)
      .map(key => `${key}=${vnp_Params[key]}`)
      .join('&');

    // Tạo chữ ký HMAC SHA512
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;

    // Tạo URL thanh toán
    const vnpUrl = vnp_Url + '?' + Object.keys(vnp_Params)
      .map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`)
      .join('&');

    res.json({
      success: true,
      data: {
        paymentUrl: vnpUrl,
        orderId: orderId,
        amount: amount,
        orderInfo: orderInfoText,
      },
    });
  } catch (error) {
    console.error("Create VNPAY payment error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi tạo thanh toán VNPAY" });
  }
};

// Xử lý return URL từ VNPAY
const handleVNPayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa hash để xác thực
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp params
    const sortedParams = sortObject(vnp_Params);

    // Tạo chuỗi xác thực
    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');

    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || "SecretKey123";
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const orderId = vnp_Params['vnp_TxnRef'];
      const rspCode = vnp_Params['vnp_ResponseCode'];
      const amount = vnp_Params['vnp_Amount'] / 100;

      if (rspCode === '00') {
        // Thanh toán thành công
        console.log(`VNPAY Payment success for order ${orderId}`);
        res.json({
          success: true,
          message: "Thanh toán thành công",
          data: { orderId, amount, responseCode: rspCode },
        });
      } else {
        // Thanh toán thất bại
        console.log(`VNPAY Payment failed for order ${orderId}, code: ${rspCode}`);
        res.json({
          success: false,
          message: "Thanh toán thất bại",
          data: { orderId, responseCode: rspCode },
        });
      }
    } else {
      res.status(400).json({ success: false, message: "Chữ ký không hợp lệ" });
    }
  } catch (error) {
    console.error("Handle VNPAY return error:", error);
    res.status(500).json({ success: false, message: "Lỗi xử lý kết quả thanh toán" });
  }
};

// Xử lý IPN từ VNPAY
const handleVNPayIPN = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa hash để xác thực
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp params
    const sortedParams = sortObject(vnp_Params);

    // Tạo chuỗi xác thực
    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');

    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET || "SecretKey123";
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      const orderId = vnp_Params['vnp_TxnRef'];
      const rspCode = vnp_Params['vnp_ResponseCode'];
      const amount = vnp_Params['vnp_Amount'] / 100;

      if (rspCode === '00') {
        // Thanh toán thành công
        console.log(`VNPAY IPN: Payment success for order ${orderId}`);
        // TODO: Cập nhật trạng thái đơn hàng trong database
        res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
      } else {
        // Thanh toán thất bại
        console.log(`VNPAY IPN: Payment failed for order ${orderId}`);
        res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
      }
    } else {
      res.status(200).json({ RspCode: '97', Message: 'Invalid Signature' });
    }
  } catch (error) {
    console.error("Handle VNPAY IPN error:", error);
    res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

// Helper function sắp xếp object
const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach(key => {
    sorted[key] = obj[key];
  });
  return sorted;
};

module.exports = {
  createMoMoPayment,
  handleMoMoIPN,
  checkMoMoTransactionStatus,
  createVNPayPayment,
  handleVNPayReturn,
  handleVNPayIPN,
};
