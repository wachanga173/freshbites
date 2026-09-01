const nodemailer = require('nodemailer')

module.exports = async (req, res) => {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const user = process.env.GMAIL_USER || process.env.SMTP_USER
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || process.env.GMAIL_PASS

  if (!user || !pass) {
    return res.status(500).json({
      error: 'Vercel environment variables (GMAIL_USER, GMAIL_APP_PASSWORD) are not configured in your Vercel project settings.'
    })
  }

  const cleanUser = user.trim()
  const cleanPass = pass.replace(/\s+/g, '')

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: cleanUser,
      pass: cleanPass
    }
  })

  try {
    const { type, to, recipients, subject, title, message, ctaLabel, ctaUrl, otp, username } = req.body || {}

    // 1. Password Reset OTP Email
    if (type === 'password-reset') {
      if (!to || !otp) {
        return res.status(400).json({ error: 'Missing recipient email or OTP code.' })
      }

      await transporter.sendMail({
        from: `"Fresh Bites Café" <${cleanUser}>`,
        to: to.trim(),
        subject: 'Fresh Bites Café - Password Reset Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
              <h2 style="color: #0f172a; margin: 0; font-size: 22px;">Fresh Bites Café</h2>
              <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Customer Password Recovery</p>
            </div>
            <p style="color: #334155; font-size: 15px; margin-bottom: 16px;">Hello${username ? ` <strong>${username}</strong>` : ''},</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">We received a request to reset your Fresh Bites Café password. Use the 6-digit verification code below to complete your reset:</p>
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">This code is valid for <strong>15 minutes</strong>. If you did not request this password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Fresh Bites Café • Delicious & Nutritious Dining</p>
          </div>
        `
      })

      return res.json({ success: true, message: 'Password reset email sent successfully.' })
    }

    // 2. Two-Factor Authentication (2FA) Email
    if (type === '2fa-otp') {
      if (!to || !otp) {
        return res.status(400).json({ error: 'Missing recipient email or OTP code.' })
      }

      await transporter.sendMail({
        from: `"Fresh Bites Café" <${cleanUser}>`,
        to: to.trim(),
        subject: 'Fresh Bites Café - Two-Factor Authentication (2FA) Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
              <h2 style="color: #0f172a; margin: 0; font-size: 22px;">Fresh Bites Café</h2>
              <p style="color: #64748b; margin: 4px 0 0; font-size: 14px;">Two-Factor Authentication</p>
            </div>
            <p style="color: #334155; font-size: 15px; margin-bottom: 16px;">Hello${username ? ` <strong>${username}</strong>` : ''},</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Here is your 6-digit 2FA login verification code:</p>
            <div style="background: #f8fafc; border: 2px dashed #d4a053; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #b88636; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px;">This security code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Fresh Bites Café • Delicious & Nutritious Dining</p>
          </div>
        `
      })

      return res.json({ success: true, message: '2FA verification email sent.' })
    }

    // 3. Marketing / Broadcast Email
    if (type === 'broadcast' || recipients || to) {
      let targetList = []
      if (Array.isArray(recipients) && recipients.length > 0) {
        targetList = recipients
      } else if (to) {
        targetList = [{ email: to }]
      }

      if (targetList.length === 0) {
        return res.status(400).json({ error: 'No recipients provided for broadcast.' })
      }

      const ctaHtml = (ctaLabel && ctaUrl) ? `
        <div style="text-align: center; margin: 30px 0 10px;">
          <a href="${ctaUrl}" style="background: #d4a053; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(212,160,83,0.35);">
            ${ctaLabel} →
          </a>
        </div>
      ` : ''

      let successCount = 0
      let lastErr = ''

      for (const r of targetList) {
        const destEmail = typeof r === 'string' ? r : r.email
        if (!destEmail || !destEmail.includes('@')) continue

        try {
          await transporter.sendMail({
            from: `"Fresh Bites Café" <${cleanUser}>`,
            to: destEmail.trim(),
            subject: subject || 'Fresh Bites Café Announcement',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
                <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px;">
                  <h2 style="color: #0f172a; margin: 0 0 6px 0; font-size: 24px;">Fresh Bites Café</h2>
                  <p style="color: #64748b; margin: 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Café Announcement & Specials</p>
                </div>
                ${title ? `<h3 style="color: #0f172a; font-size: 20px; margin: 0 0 16px 0;">${title}</h3>` : ''}
                <div style="color: #334155; font-size: 15px; line-height: 1.7; white-space: pre-line;">
                  ${message || ''}
                </div>
                ${ctaHtml}
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 20px;" />
                <div style="text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                  <p style="margin: 0 0 4px;">You received this email because you are a registered customer at Fresh Bites Café.</p>
                  <p style="margin: 0;">Fresh Bites Café • Delicious & Nutritious Dining</p>
                </div>
              </div>
            `
          })
          successCount++
        } catch (err) {
          lastErr = err.message
        }
      }

      if (successCount === 0) {
        return res.status(500).json({ error: `Email dispatch failed: ${lastErr || 'Unable to deliver message'}` })
      }

      return res.json({
        success: true,
        recipientCount: successCount,
        message: `Broadcast successfully sent to ${successCount} recipient(s).`
      })
    }

    return res.status(400).json({ error: 'Invalid email request type.' })
  } catch (error) {
    console.error('Vercel mailer error:', error)
    return res.status(500).json({ error: error.message || 'Internal Mailer Error' })
  }
}
