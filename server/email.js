const TO = "contact@apsi.cg";

const mailChannelsEndpoint = "https://api.mailchannels.net/tx/v1/email";

function buildPersonalizations(toEmail) {
  return [{ email: toEmail }];
}

function buildFrom() {
  return { name: "APSI-CG", email: "noreply@apsi-cg.org" };
}

async function sendEmail(env, { to, subject, html, replyTo }) {
  const body = {
    personalizations: buildPersonalizations(to),
    from: buildFrom(),
    subject,
    content: [{ type: "text/html", value: html }],
  };
  if (replyTo) {
    body.from.reply_to = { email: replyTo };
  }

  const res = await fetch(mailChannelsEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("MailChannels error:", err);
  }
  return res.json();
}

export async function sendContactEmail(env, { name, email, subject, message }) {
  return sendEmail(env, {
    to: TO,
    subject: subject || `Nouveau message de ${name}`,
    replyTo: email,
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
  });
}

export async function sendNewsletterEmail(env, { email, source }) {
  return sendEmail(env, {
    to: TO,
    subject: `Nouvelle inscription newsletter — ${email}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0d9488;">Nouvelle inscription newsletter</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Source</td><td style="padding:8px 0;">${source || "site"}</td></tr>
        </table>
        <p style="margin-top:16px;font-size:12px;color:#999;">Inscription depuis le site APSI-CG</p>
      </div>
    `,
  });
}

export async function sendTrainingRegistrationEmail(env, { fullName, email, phone, organization, profile, trainingTitle, notes }) {
  return sendEmail(env, {
    to: TO,
    subject: `Nouvelle inscription formation — ${trainingTitle}`,
    replyTo: email,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0d9488;">Nouvelle inscription à une formation</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Formation</td><td style="padding:8px 0;">${trainingTitle}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Nom</td><td style="padding:8px 0;">${fullName}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Téléphone</td><td style="padding:8px 0;">${phone || "-"}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Organisation</td><td style="padding:8px 0;">${organization || "-"}</td></tr>
          <tr><td style="padding:8px 0;font-weight:bold;color:#555;">Profil</td><td style="padding:8px 0;">${profile || "-"}</td></tr>
        </table>
        ${notes ? `<div style="margin-top:16px;padding:16px;background:#f1f5f9;border-radius:8px;border-left:4px solid #0d9488;"><p style="margin:0;white-space:pre-wrap;"><strong>Notes :</strong> ${notes}</p></div>` : ""}
        <p style="margin-top:16px;font-size:12px;color:#999;">Inscription depuis le site APSI-CG</p>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail(env, { name, email, resetUrl }) {
  return sendEmail(env, {
    to: email,
    subject: "Réinitialisation de votre mot de passe APSI-CG",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="text-align:center;padding:24px 0;">
          <div style="display:inline-block;background:#0d9488;color:#fff;font-size:20px;font-weight:700;padding:12px 24px;border-radius:8px;">APSI-CG</div>
        </div>
        <h2 style="color:#1e293b;text-align:center;">Réinitialisation du mot de passe</h2>
        <p style="color:#475569;line-height:1.6;">Bonjour <strong>${name || "Utilisateur"}</strong>,</p>
        <p style="color:#475569;line-height:1.6;">Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte APSI-CG.</p>
        <p style="color:#475569;line-height:1.6;">Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">Réinitialiser mon mot de passe</a>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:24px 0;">
          <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">
            <strong style="color:#475569;">Important :</strong> Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre mot de passe actuel restera inchangé.
          </p>
        </div>
        <p style="color:#475569;line-height:1.6;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
        <p style="word-break:break-all;color:#0d9488;font-size:13px;background:#f1f5f9;padding:12px;border-radius:4px;">${resetUrl}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" />
        <p style="color:#94a3b8;font-size:12px;text-align:center;">
          APSI-CG — Association des Professionnels de la Sécurité de l'Information du Congo<br/>
          Ceci est un message automatique, merci de ne pas y répondre.
        </p>
      </div>
    `,
  });
}
