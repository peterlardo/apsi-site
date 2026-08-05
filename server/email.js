const FROM = "APSI-CG <onboarding@resend.dev>";
const TO = "contact@apsi-cg.org";

export async function sendContactEmail(env, { name, email, subject, message }) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return null;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: subject || `Nouveau message de ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#0d9488;">Nouveau message de contact</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Nom</td><td style="padding:8px 0;">${name}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Sujet</td><td style="padding:8px 0;">${subject || "-"}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f1f5f9;border-radius:8px;border-left:4px solid #0d9488;">
            <p style="margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="margin-top:16px;font-size:12px;color:#999;">Envoyé depuis le formulaire de contact APSI-CG</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    throw new Error(`Email send failed: ${res.status}`);
  }

  return res.json();
}
