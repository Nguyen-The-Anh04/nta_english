/**
 * Mock MoMo Disbursement Service
 * Dùng để giả lập API rút tiền MoMo (SampoX) cho development
 */

// Mock gọi MoMo Disbursement API
const mockMoMoDisbursement = async (data) => {
    // Giả lập network delay (1-2 giây)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { phone, amount } = data;
    
    // Random kết quả (90% thành công)
    const success = Math.random() > 0.1;
    
    // Mock response từ MoMo API
    return {
        resultCode: success ? 0 : 99,
        message: success ? "Giao dịch thành công" : "Giao dịch thất bại do tài khoản nhận chưa xác minh",
        transId: success ? `TXN${Date.now()}${Math.floor(Math.random() * 1000)}` : null,
        amount: amount,
        receiver: phone,
        partnerCode: process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529",
        createdAt: new Date().toISOString()
    };
};

// Tạo QR Code URL cho withdrawal (dùng QR Server miễn phí)
const generateWithdrawalQR = (withdrawal) => {
    const qrString = `${withdrawal.bankName}|${withdrawal.accountNumber}|${withdrawal.accountName}|${withdrawal.amount}|WD${withdrawal.id}`;
    
    // Sử dụng QR Server API miễn phí
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;
    
    return qrUrl;
};

// Tạo thông tin chuyển tiền (hiển thị cho admin)
const generateTransferInfo = (withdrawal) => {
    return {
        bankName: withdrawal.bankName,
        accountNumber: withdrawal.accountNumber,
        accountName: withdrawal.accountName,
        amount: withdrawal.amount,
        fee: withdrawal.fee || 1000,
        receiveAmount: withdrawal.amount - (withdrawal.fee || 1000),
        withdrawalId: withdrawal.id,
        transactionCode: `WD${withdrawal.id}${Date.now()}`
    };
};

// Validate thông tin rút tiền
const validateWithdrawal = (withdrawal, availableBalance) => {
    const errors = [];
    
    if (!withdrawal.amount || withdrawal.amount < 50000) {
        errors.push("Số tiền tối thiểu là 50,000 VNĐ");
    }
    
    if (withdrawal.amount > availableBalance) {
        errors.push("Số dư không đủ");
    }
    
    if (!withdrawal.bankName) {
        errors.push("Thiếu tên ngân hàng");
    }
    
    if (!withdrawal.accountNumber) {
        errors.push("Thiếu số tài khoản");
    }
    
    if (!withdrawal.accountName) {
        errors.push("Thiếu tên chủ tài khoản");
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    mockMoMoDisbursement,
    generateWithdrawalQR,
    generateTransferInfo,
    validateWithdrawal
};