// Independent Vercel Serverless Email Service

export async function sendEmailViaVercel(payload) {
  // Use relative endpoint so it automatically routes to Vercel's Serverless Function (/api/send-email)
  const res = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  let data
  const text = await res.text()
  try {
    data = JSON.parse(text)
  } catch (_e) {
    throw new Error(text || `Vercel serverless error (${res.status})`)
  }

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to send email via Vercel service')
  }

  return data
}

export async function sendPasswordResetEmail({ to, otp, username }) {
  return sendEmailViaVercel({
    type: 'password-reset',
    to,
    otp,
    username
  })
}

export async function send2FAEmail({ to, otp, username }) {
  return sendEmailViaVercel({
    type: '2fa-otp',
    to,
    otp,
    username
  })
}

export async function sendBroadcastEmail({ recipients, subject, title, message, ctaLabel, ctaUrl }) {
  return sendEmailViaVercel({
    type: 'broadcast',
    recipients,
    subject,
    title,
    message,
    ctaLabel,
    ctaUrl
  })
}
