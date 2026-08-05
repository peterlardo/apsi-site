import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Lock, Search, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";
import { getDownloads, verifyMember, downloadFileBlob } from "../lib/api";

const FILTER_ALL = "Tous";

function getIcon(name) {
  return LucideIcons[name] || LucideIcons.FileText;
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " o";
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + " Ko";
  return (bytes / 1048576).toFixed(1) + " Mo";
}

export default function Telechargements() {
  const { content: { DOWNLOADS, IMAGES } } = useContent();
  const [apiDownloads, setApiDownloads] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(FILTER_ALL);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDoc, setModalDoc] = useState(null);
  const [memberCode, setMemberCode] = useState("");
  const [verifiedMember, setVerifiedMember] = useState(null);
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    getDownloads()
      .then((data) => { if (Array.isArray(data) && data.length > 0) setApiDownloads(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("apsi_member_code");
    if (saved) {
      setMemberCode(saved);
      verifyMember(saved).then((res) => {
        if (res.valid) setVerifiedMember(res.member);
      }).catch(() => {});
    }
  }, []);

  const downloads = useMemo(() => {
    if (apiDownloads) {
      return apiDownloads.map((d) => ({
        ...d,
        IconComp: getIcon(d.icon),
      }));
    }
    return (DOWNLOADS || []).map((d) => ({
      ...d,
      IconComp: d.icon || LucideIcons.FileText,
    }));
  }, [apiDownloads, DOWNLOADS]);

  const categories = useMemo(() => {
    const cats = [...new Set(downloads.map((d) => d.category).filter(Boolean))];
    return [FILTER_ALL, ...cats];
  }, [downloads]);

  const filtered = downloads.filter((d) => {
    const matchesQuery =
      !query.trim() ||
      [d.title, d.description, d.category]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
    const matchesCat = category === FILTER_ALL || d.category === category;
    return matchesQuery && matchesCat;
  });

  function openModal(doc) {
    if (verifiedMember) {
      handleDownload(doc);
      return;
    }
    setModalDoc(doc);
    setModalOpen(true);
    setVerifyError("");
    setTimeout(() => codeRef.current?.focus(), 100);
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (!memberCode.trim()) return;
    setVerifying(true);
    setVerifyError("");
    try {
      const res = await verifyMember(memberCode.trim());
      if (res.valid) {
        setVerifiedMember(res.member);
        sessionStorage.setItem("apsi_member_code", memberCode.trim());
        setModalOpen(false);
        if (modalDoc) handleDownload(modalDoc);
      } else {
        setVerifyError(res.error || "Code invalide");
      }
    } catch {
      setVerifyError("Erreur de vérification");
    } finally {
      setVerifying(false);
    }
  }

  async function handleDownload(doc) {
    setDownloading(true);
    try {
      const res = await downloadFileBlob(doc.id, memberCode || undefined);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name || doc.title || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Erreur de téléchargement");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <PageHero
        title={<>Nos <em>téléchargements</em></>}
        crumbs={[{ label: "Téléchargements" }]}
        image={IMAGES.heroTelechargements}
      />

      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Ressources"
            title={<>Téléchargez nos <strong>documents</strong></>}
            text="Accédez aux statuts, guides, formulaires et ressources de l'APSI-CG pour renforcer votre sécurité numérique."
          />

          {verifiedMember && (
            <div className="dl-member-bar">
              <span>Membre connecté : <strong>{verifiedMember.first_name} {verifiedMember.last_name}</strong></span>
              <button onClick={() => { setVerifiedMember(null); setMemberCode(""); sessionStorage.removeItem("apsi_member_code"); }}>
                Déconnexion
              </button>
            </div>
          )}

          <Reveal>
            <div className="dl-toolbar">
              <label className="dl-search">
                <Search size={18} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un document"
                  aria-label="Rechercher un document"
                />
              </label>
              <div className="dl-filters">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`dl-tag${category === cat ? " dl-tag--active" : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="dl-grid">
              {filtered.length === 0 ? (
                <div className="dl-empty">
                  <h3>Aucun document trouvé</h3>
                  <p>Modifiez votre recherche ou changez de catégorie.</p>
                </div>
              ) : (
                filtered.map((d, i) => {
                  const IconComp = d.IconComp;
                  const isRestricted = d.restricted === 1;
                  return (
                    <div className={`dl-card${isRestricted ? " dl-card--restricted" : ""}`} key={d.id || i}>
                      <div className="dl-card-icon">
                        <IconComp size={28} strokeWidth={1.8} />
                      </div>
                      <div className="dl-card-body">
                        <div className="dl-card-header">
                          <span className="dl-card-cat">{d.category}</span>
                          {isRestricted && <span className="dl-card-badge"><Lock size={11} /> Membres</span>}
                        </div>
                        <h3>{d.title}</h3>
                        <p>{d.description}</p>
                      </div>
                      <div className="dl-card-foot">
                        <span className="dl-card-size">{formatSize(d.file_size)}</span>
                        <button
                          className={`btn btn--sm${isRestricted && !verifiedMember ? " btn--outline" : ""}`}
                          onClick={() => isRestricted ? openModal(d) : handleDownload(d)}
                          disabled={downloading}
                        >
                          <span className="btn-inner">
                            {isRestricted && !verifiedMember ? "Vérifier pour télécharger" : "Télécharger"}
                          </span>
                          <span className="btn-arrow"><Download size={15} /></span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {modalOpen && (
        <div className="dl-modal" onClick={() => setModalOpen(false)}>
          <div className="dl-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="dl-modal-close" onClick={() => setModalOpen(false)}><X size={18} /></button>
            <div className="dl-modal-icon"><Lock size={32} /></div>
            <h3>Document réservé aux membres</h3>
            <p>Entrez votre code membre pour accéder au téléchargement de <strong>{modalDoc?.title}</strong>.</p>
            <form onSubmit={handleVerify} className="dl-modal-form">
              <input
                ref={codeRef}
                type="text"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                placeholder="Votre code membre"
                required
              />
              {verifyError && <div className="dl-modal-error">{verifyError}</div>}
              <button type="submit" className="btn" disabled={verifying}>
                <span className="btn-inner">{verifying ? "Vérification…" : "Vérifier"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <CtaSection />
      <Newsletter />
    </>
  );
}
