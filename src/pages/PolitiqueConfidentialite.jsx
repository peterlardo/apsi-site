import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Eye, Lock } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { useContent } from "../context/ContentContext";
import { contactApi } from "../lib/api";

export default function PolitiqueConfidentialite() {
  const { content: { COMPANY, CONTACT_CARDS } } = useContent();
  return (
    <>
      <PageHero
        title={<>Politique de <em>confidentialité</em></>}
        crumbs={[{ label: "Confidentialité" }]}
      />
      <section className="section">
        <div className="container legal-content">
          <Reveal>
            <p className="lead">
              La présente politique décrit comment APSI-CG collecte, traite et protège vos données
              personnelles conformément au RGPD (Règlement UE 2016/679) et à la législation congolaise.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h2>1. Responsable de traitement</h2>
            <p>
              Le traitement de vos données est assuré par l'Association des Professionnels de la Sécurité de
              l'Information du Congo (APSI-CG), dont le siège est {COMPANY.address}, {COMPANY.city}.
            </p>
            <p>
              <strong>Délégué à la protection des données (DPD) :</strong> Andy Nkodia Samba — vous pouvez
              l'atteindre à <a href={`mailto:dpo@apsi-cg.org`}>dpo@apsi-cg.org</a> pour toute question
              relative à vos droits ou au traitement de vos données.
            </p>
          </Reveal>

          <Reveal delay={160}>
            <h2>2. Données collectées & finalités</h2>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Finalité</th>
                  <th>Données concernées</th>
                  <th>Base juridique</th>
                  <th>Rétention</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Réponse à vos demandes de contact</td>
                  <td>Nom, prénom, e-mail, sujet, message, consentement</td>
                  <td>Exécution d'une prestation précontractuelle (art. 6.1.b) + consentement</td>
                  <td>3 ans après le dernier contact</td>
                </tr>
                <tr>
                  <td>Envoi de la newsletter</td>
                  <td>Adresse e-mail, source du consentement, IP</td>
                  <td>Consentement explicite (art. 6.1.a)</td>
                  <td>Jusqu'au désabonnement</td>
                </tr>
                <tr>
                  <td>Inscription aux formations</td>
                  <td>Nom, prénom, e-mail, téléphone, organisation, profil, notes</td>
                  <td>Exécution d'un contrat de formation (art. 6.1.b)</td>
                  <td>3 ans après la fin de la formation</td>
                </tr>
                <tr>
                  <td>Administration du site (back-office)</td>
                  <td>Nom, e-mail, rôle du compte administrateur</td>
                  <td>Intérêt légitime à la gestion du site (art. 6.1.f)</td>
                  <td>Durée du contrat d'adhésion</td>
                </tr>
                <tr>
                  <td>Mesure d'audience & statistiques</td>
                  <td>Adresse IP (anonymisée), pages vues, agent utilisateur</td>
                  <td>Consentement (art. 6.1.a)</td>
                  <td>13 mois maximum</td>
                </tr>
              </tbody>
            </table>
          </Reveal>

          <Reveal delay={240}>
            <h2>3. Cookies & technologies de pistage</h2>
            <p>
              APSI-CG ne dépose aucun cookie publicitaire ou de ciblage sans votre consentement explicite.
              Seuls les cookies strictement nécessaires (cookie de consentement, navigation) sont déposés par
              défaut. Les cookies de mesure d'audience (Plausible Analytics, exemptés de consentement
              lorsqu'ils anonymisent l'IP) ne sont activés qu'après votre accord. Consultez notre{" "}
              <Link to="/cookies">politique Cookies</Link> détaillée pour la liste complète.
            </p>
          </Reveal>

          <Reveal delay={320}>
            <h2>4. Partage & transferts des données</h2>
            <p>
              Vos données sont traitées par nos équipes et, le cas échéant, par nos sous-traitants (hébergeur
              du formulaire, prestataire d'envoi d'e-mails) qui agissent sur nos instructions et sous nos
              responsabilités. Aucune sous-traitance ne fait l'objet d'un transfert hors de l'UE que dans le
              respect des garanties prévues à l'article 46 du RGPD.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <h2>5. Vos droits</h2>
            <p>Vous disposez, sauf limitations, des droits suivants :</p>
            <ul className="check-list">
              <li><Eye size={18} /> Droit d'accès, de rectification et d'opposition</li>
              <li><Lock size={18} /> Droit à l'effacement et à la limitation du traitement</li>
              <li><ShieldCheck size={18} /> Droit à la portabilité des données vous concernant</li>
              <li><Mail size={18} /> Droit de retirer votre consentement à tout moment</li>
            </ul>
            <p>
              Pour exercer ces droits, adressez votre demande à <a href={`mailto:dpo@apsi-cg.org`}>dpo@apsi-cg.org</a>{" "}
              en indiquant votre nom et votre adresse e-mail. Vous pouvez également demander la suppression de
              vos données directement depuis le{" "}
              <a href="#data-request">formulaire de demande de suppression</a>.
            </p>
          </Reveal>

          <Reveal delay={480}>
            <h2 id="data-request">6. Exercer votre droit à l'effacement</h2>
            <p>
              Vous pouvez demander la suppression de l'ensemble des données vous concernant (messages de
              contact et désinscription de la newsletter) en saisissant votre adresse e-mail ci-dessous.
            </p>
            <DataErasureForm />
          </Reveal>

          <Reveal delay={560}>
            <h2>7. Sécurité</h2>
            <p>
              Les données sont traitées sur des serveurs sécurisés, en accès restreint, avec des sauvegardes
              régulières. Les mots de passe administrateurs sont hashés (bcrypt) et les communications
              utilisent le chiffrement TLS (HTTPS).
            </p>
          </Reveal>

          <Reveal delay={640}>
            <div className="legal-contact">
              <h2>Nous contacter</h2>
              <div className="contact-grid-simple">
                {CONTACT_CARDS.slice(0, 2).map((c) => (
                  <div key={c.title} className="contact-line">
                    <span className="feature-icon"><c.icon size={20} strokeWidth={1.8} /></span>
                    <strong>{c.title}</strong>
                    {c.lines.map((l, j) => (
                      <p key={j}>{l}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function DataErasureForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  return (
    <form
      className="erase-form"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus({ type: "loading", text: "Demande en cours…" });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return setStatus({ type: "err", text: "E-mail invalide." });
        }
        contactApi
          .erase(email)
          .then(() => setStatus({ type: "ok", text: "Vos données personnelles (messages et newsletter) ont été supprimées. Un courriel de confirmation vous a été envoyé." }))
          .catch(() => setStatus({ type: "err", text: "Une erreur est survenue. Réessayez ou contactez le DPO." }));
      }}
    >
      <label htmlFor="erase-email">Adresse e-mail *</label>
      <input
        id="erase-email"
        type="email"
        required
        placeholder="vous@entreprise.cg"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="btn btn--sm" disabled={status?.type === "loading"}>
        <span className="btn-inner">Demander la suppression</span>
      </button>
      {status && <div className={`form-status form-status--${status.type}`}>{status.text}</div>}
    </form>
  );
}
