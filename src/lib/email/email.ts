import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'noreply.cleancycle@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'gexu mtww ccar feml',
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"CleanCycle" <${process.env.SMTP_FROM || 'noreply.cleancycle@gmail.com'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Generate 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email templates
export function getVerificationEmailTemplate(code: string, locale: string = 'en'): { subject: string; html: string } {
  const translations: Record<string, { subject: string; title: string; greeting: string; message: string; codeLabel: string; footer: string; warning: string }> = {
    en: {
      subject: 'Verify Your Email - CleanCycle',
      title: 'Email Verification',
      greeting: 'Hello!',
      message: 'Thank you for registering with CleanCycle. Please use the following code to verify your email address:',
      codeLabel: 'Your verification code:',
      footer: 'This code will expire in 15 minutes.',
      warning: 'If you did not create an account, please ignore this email.',
    },
    hu: {
      subject: 'Email cím megerősítése - CleanCycle',
      title: 'Email megerősítés',
      greeting: 'Üdvözöljük!',
      message: 'Köszönjük, hogy regisztrált a CleanCycle-ra. Kérjük, használja az alábbi kódot email címének megerősítéséhez:',
      codeLabel: 'Megerősítő kód:',
      footer: 'Ez a kód 15 percig érvényes.',
      warning: 'Ha nem Ön hozta létre ezt a fiókot, kérjük, hagyja figyelmen kívül ezt az emailt.',
    },
    nl: {
      subject: 'Verifieer uw e-mail - CleanCycle',
      title: 'E-mailverificatie',
      greeting: 'Hallo!',
      message: 'Bedankt voor uw registratie bij CleanCycle. Gebruik de volgende code om uw e-mailadres te verifiëren:',
      codeLabel: 'Uw verificatiecode:',
      footer: 'Deze code verloopt over 15 minuten.',
      warning: 'Als u geen account heeft aangemaakt, negeer dan deze e-mail.',
    },
    de: {
      subject: 'E-Mail verifizieren - CleanCycle',
      title: 'E-Mail-Verifizierung',
      greeting: 'Hallo!',
      message: 'Vielen Dank für Ihre Registrierung bei CleanCycle. Bitte verwenden Sie den folgenden Code, um Ihre E-Mail-Adresse zu verifizieren:',
      codeLabel: 'Ihr Verifizierungscode:',
      footer: 'Dieser Code läuft in 15 Minuten ab.',
      warning: 'Wenn Sie kein Konto erstellt haben, ignorieren Sie bitte diese E-Mail.',
    },
    fr: {
      subject: 'Vérifiez votre e-mail - CleanCycle',
      title: 'Vérification de l\'e-mail',
      greeting: 'Bonjour!',
      message: 'Merci de vous être inscrit sur CleanCycle. Veuillez utiliser le code suivant pour vérifier votre adresse e-mail:',
      codeLabel: 'Votre code de vérification:',
      footer: 'Ce code expirera dans 15 minutes.',
      warning: 'Si vous n\'avez pas créé de compte, veuillez ignorer cet e-mail.',
    },
    it: {
      subject: 'Verifica la tua email - CleanCycle',
      title: 'Verifica email',
      greeting: 'Ciao!',
      message: 'Grazie per esserti registrato su CleanCycle. Utilizza il seguente codice per verificare il tuo indirizzo email:',
      codeLabel: 'Il tuo codice di verifica:',
      footer: 'Questo codice scadrà tra 15 minuti.',
      warning: 'Se non hai creato un account, ignora questa email.',
    },
    be: {
      subject: 'Verifieer uw e-mail - CleanCycle',
      title: 'E-mailverificatie',
      greeting: 'Hallo!',
      message: 'Bedankt voor uw registratie bij CleanCycle. Gebruik de volgende code om uw e-mailadres te verifiëren:',
      codeLabel: 'Uw verificatiecode:',
      footer: 'Deze code verloopt over 15 minuten.',
      warning: 'Als u geen account heeft aangemaakt, negeer dan deze e-mail.',
    },
    bg: {
      subject: 'Потвърдете вашия имейл - CleanCycle',
      title: 'Потвърждение на имейл',
      greeting: 'Здравейте!',
      message: 'Благодарим ви, че се регистрирахте в CleanCycle. Моля, използвайте следния код, за да потвърдите вашия имейл адрес:',
      codeLabel: 'Вашият код за потвърждение:',
      footer: 'Този код ще изтече след 15 минути.',
      warning: 'Ако не сте създали акаунт, моля игнорирайте този имейл.',
    },
    sk: {
      subject: 'Overte svoj email - CleanCycle',
      title: 'Overenie emailu',
      greeting: 'Ahoj!',
      message: 'Ďakujeme za registráciu v CleanCycle. Použite nasledujúci kód na overenie vašej emailovej adresy:',
      codeLabel: 'Váš overovací kód:',
      footer: 'Tento kód vyprší za 15 minút.',
      warning: 'Ak ste nevytvorili účet, ignorujte tento email.',
    },
  };

  const t = translations[locale] || translations.en;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">CleanCycle</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">${t.title}</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">${t.greeting}</p>
                  <p style="margin: 0 0 30px 0; color: #666666; font-size: 14px; line-height: 1.6;">${t.message}</p>
                  
                  <!-- Verification Code -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <div style="background-color: #f0fdfa; border: 2px dashed #14b8a6; border-radius: 8px; padding: 20px; display: inline-block;">
                          <p style="margin: 0 0 10px 0; color: #0d9488; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${t.codeLabel}</p>
                          <p style="margin: 0; color: #0f172a; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0 0; color: #999999; font-size: 12px; text-align: center;">${t.footer}</p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">${t.warning}</p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">© 2025 CleanCycle. Powered by Daniel Soos.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject: t.subject, html };
}

export function getPasswordResetEmailTemplate(resetLink: string, locale: string = 'en'): { subject: string; html: string } {
  const translations: Record<string, { subject: string; title: string; greeting: string; message: string; buttonText: string; footer: string; warning: string; expiry: string }> = {
    en: {
      subject: 'Reset Your Password - CleanCycle',
      title: 'Password Reset',
      greeting: 'Hello!',
      message: 'We received a request to reset your password. Click the button below to create a new password:',
      buttonText: 'Reset Password',
      footer: 'This link will expire in 1 hour.',
      warning: 'If you did not request a password reset, please ignore this email.',
      expiry: 'Link expires in 1 hour',
    },
    hu: {
      subject: 'Jelszó visszaállítása - CleanCycle',
      title: 'Jelszó visszaállítás',
      greeting: 'Üdvözöljük!',
      message: 'Jelszó visszaállítási kérelmet kaptunk. Kattintson az alábbi gombra új jelszó létrehozásához:',
      buttonText: 'Jelszó visszaállítása',
      footer: 'Ez a link 1 órán belül lejár.',
      warning: 'Ha nem Ön kérte a jelszó visszaállítását, kérjük, hagyja figyelmen kívül ezt az emailt.',
      expiry: 'A link 1 órán belül lejár',
    },
    // Add other languages as needed...
  };

  const t = translations[locale] || translations.en;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">CleanCycle</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">${t.title}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">${t.greeting}</p>
                  <p style="margin: 0 0 30px 0; color: #666666; font-size: 14px; line-height: 1.6;">${t.message}</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${resetLink}" style="display: inline-block; background-color: #14b8a6; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">${t.buttonText}</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 30px 0 0 0; color: #999999; font-size: 12px; text-align: center;">${t.footer}</p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">${t.warning}</p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">© 2025 CleanCycle. Powered by Daniel Soos.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject: t.subject, html };
}

