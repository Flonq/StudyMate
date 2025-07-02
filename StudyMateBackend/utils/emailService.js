const nodemailer = require("nodemailer");

// Gmail transporter - sadece gerektiğinde oluştur
const createGmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("📧 Email credentials not found, skipping email setup");
    return null;
  }

  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendResetEmail = async (to, resetToken) => {
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

  console.log("E-posta gönderme ayarları:", {
    from: process.env.EMAIL_USER,
    to: to,
    emailUser: process.env.EMAIL_USER,
    emailPassLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
  });

  const gmailTransporter = createGmailTransporter();

  if (!gmailTransporter) {
    console.log("📧 Email transporter not available, skipping email send");
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "StudyMate - Şifre Sıfırlama",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; text-align: center;">StudyMate</h1>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px;">
          <h2 style="color: #1f2937;">Şifre Sıfırlama İsteği</h2>
          <p style="color: #4b5563;">Merhaba,</p>
          <p style="color: #4b5563;">Hesabınız için bir şifre sıfırlama isteği aldık. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2563eb; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 5px;
                      font-weight: bold;">
              Şifremi Sıfırla
            </a>
          </div>
          <p style="color: #4b5563;">Bu bağlantı güvenliğiniz için 1 saat süreyle geçerlidir.</p>
          <p style="color: #4b5563;">Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
      </div>
    `,
  };

  try {
    console.log("E-posta gönderme deneniyor...");
    await gmailTransporter.sendMail(mailOptions);
    console.log("E-posta başarıyla gönderildi");
    return true;
  } catch (error) {
    console.error("E-posta gönderme hatası:", error);
    return false;
  }
};

module.exports = {
  sendResetEmail,
};
