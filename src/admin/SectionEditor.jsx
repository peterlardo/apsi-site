import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { getSiteContent, saveSection } from "../lib/api";
import { getIcon, ICON_NAMES } from "../lib/icons";
import { getSchema } from "./schemas";
import { useContent } from "../context/ContentContext";

const kindMeta = {
  object: { icon: ImageIcon, label: "objet" },
  list: { icon: ImageIcon, label: "liste" },
  strings: { icon: ImageIcon, label: "liste de textes" },
  keyvalues: { icon: ImageIcon, label: "images clé/valeur" },
};

function FieldInput({ field, value, onChange }) {
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.type === "textarea" ? 3 : undefined}
        />
      );
    case "number":
      return (
        <input
          type="number"
          step="any"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder={field.placeholder}
        />
      );
    case "boolean":
      return (
        <label className="admin-check">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      );
    case "icon": {
      const Icon = getIcon(value);
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="admin-module-icon" style={{ width: 40, height: 40 }}>
            {Icon ? <Icon size={19} /> : null}
          </span>
          <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} style={{ flex: 1 }}>
            <option value="">— Aucune icône —</option>
            {ICON_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      );
    }
    default:
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      );
  }
}

function FieldLabel({ field }) {
  return (
    <span>
      {field.label}
      {field.type === "icon" && <span className="hint"> — icône lucide</span>}
    </span>
  );
}

function Field({ field, value, onChange, variant }) {
  return (
    <label className={`admin-field${variant ? ` ${variant}` : ""}`}>
      {field.type !== "boolean" && <FieldLabel field={field} />}
      <FieldInput field={field} value={value} onChange={onChange} />
    </label>
  );
}

function StringListEditor({ itemLabel, values, onChange }) {
  return (
    <div className="admin-items" style={{ gap: 8 }}>
      {values.map((v, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            value={v ?? ""}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={itemLabel}
          />
          <button
            type="button"
            className="admin-btn admin-btn--icon danger"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            title="Supprimer"
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-add-btn"
        onClick={() => onChange([...values, ""])}
      >
        <Plus size={16} /> Ajouter {itemLabel ? `un·e ${itemLabel}` : "un élément"}
      </button>
    </div>
  );
}

function GroupEditor({ field, values, onChange }) {
  if (field.type === "strings") {
    return <StringListEditor itemLabel={field.itemLabel} values={values} onChange={onChange} />;
  }
  return (
    <div className="admin-items" style={{ gap: 8 }}>
      {values.map((item, i) => (
        <div
          key={i}
          style={{
            border: "1px solid var(--admin-border)",
            borderRadius: 9,
            padding: "12px 14px",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <strong style={{ fontSize: "0.82rem", color: "var(--admin-text)" }}>
              {field.itemLabel} n°{i + 1}
            </strong>
            <button
              type="button"
              className="admin-btn admin-btn--icon danger"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="admin-form" style={{ gap: 12 }}>
            {field.itemFields.map((f) => (
              <Field
                key={f.key}
                field={f}
                value={item?.[f.key]}
                onChange={(v) => {
                  const next = [...values];
                  next[i] = { ...item, [f.key]: v };
                  onChange(next);
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="admin-add-btn"
        onClick={() => onChange([...values, {}])}
      >
        <Plus size={16} /> Ajouter {field.itemLabel ? `un·e ${field.itemLabel}` : "un élément"}
      </button>
    </div>
  );
}

function itemSummary(item, schema) {
  const titleField = schema.fields.find((f) => f.key === "title" || f.key === "name" || f.key === "q" || f.key === "label");
  const v = titleField ? item?.[titleField.key] : null;
  return typeof v === "string" && v.trim() ? v : "Élément";
}

export default function SectionEditor() {
  const { name } = useParams();
  const schema = getSchema(name);
  const { refresh } = useContent();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getSiteContent();
        const existing = res.content?.[name];
        if (cancelled) return;
        setData(existing !== undefined ? existing : schema.kind === "object" || schema.kind === "keyvalues" ? {} : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Impossible de charger la section");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [name, schema]);

  const entries = useMemo(() => {
    if (!data || schema.kind !== "keyvalues") return [];
    return Object.entries(data).map(([key, value]) => ({ key, value }));
  }, [data, schema.kind]);

  function markDirty() {
    setDirty(true);
    setSaved(false);
  }

  function setObjectField(key, value) {
    setData((d) => ({ ...d, [key]: value }));
    markDirty();
  }

  function setItem(index, key, value) {
    setData((d) => d.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
    markDirty();
  }

  function setItemGroup(index, groupKey, values) {
    setData((d) => d.map((item, i) => (i === index ? { ...item, [groupKey]: values } : item)));
    markDirty();
  }

  function moveItem(index, dir) {
    setData((d) => {
      const next = [...d];
      const target = index + dir;
      if (target < 0 || target >= next.length) return d;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    markDirty();
  }

  function removeItem(index) {
    setData((d) => d.filter((_, i) => i !== index));
    markDirty();
  }

  function addItem() {
    setData((d) => [...d, {}]);
    markDirty();
  }

  function setString(index, value) {
    setData((d) => d.map((s, i) => (i === index ? value : s)));
    markDirty();
  }

  function addString() {
    setData((d) => [...d, ""]);
    markDirty();
  }

  function removeString(index) {
    setData((d) => d.filter((_, i) => i !== index));
    markDirty();
  }

  function setEntry(index, field, value) {
    setData((d) => {
      const e = entries.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry));
      return Object.fromEntries(e.filter((x) => x.key.trim()));
    });
    markDirty();
  }

  function addEntry() {
    setData((d) => ({ ...d, "": "" }));
    markDirty();
  }

  function removeEntry(index) {
    const keyToRemove = entries[index]?.key;
    setData((d) => {
      const next = { ...d };
      delete next[keyToRemove];
      return next;
    });
    markDirty();
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await saveSection(name, data);
      refresh();
      setDirty(false);
      setSaved(true);
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  if (!schema) {
    return (
      <div className="admin-empty">
        Section « {name} » inconnue. <Link to="/admin/contenu">Retour au contenu</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-head">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/admin/contenu" className="admin-btn admin-btn--ghost admin-btn--icon" title="Retour">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2>{schema.label}</h2>
            <p>
              Section <code style={{ color: "var(--teal-700)" }}>{name}</code> ·{" "}
              {kindMeta[schema.kind]?.label}
            </p>
          </div>
        </div>
        <div className="admin-editor-bar">
          {dirty && <span className="editor-dirty">Modifications non enregistrées</span>}
          {saved && (
            <span className="badge badge--green">
              <Check size={13} /> Enregistré
            </span>
          )}
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={saving || !dirty || data === null}
          >
            {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {loading && (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement de la section…
        </div>
      )}

      {!loading && data !== null && (
        <div className="admin-panel">
          <div className="admin-panel-body">
            {schema.kind === "object" && (
              <div className="admin-form" style={{ maxWidth: 640 }}>
                {schema.fields.map((f) => (
                  <Field key={f.key} field={f} value={data[f.key]} onChange={(v) => setObjectField(f.key, v)} />
                ))}
              </div>
            )}

            {schema.kind === "list" && (
              <div className="admin-items">
                {data.map((item, i) => (
                  <div key={i} className="admin-item">
                    <span className="admin-item-index">{i + 1}</span>
                    <div className="admin-item-fields">
                      <strong style={{ fontSize: "0.85rem", color: "var(--teal-800)" }}>
                        {itemSummary(item, schema)}
                      </strong>
                      {schema.fields.map((f) =>
                        f.type === "strings" ? (
                          <div key={f.key} className="admin-field">
                            <span>{f.label}</span>
                            <StringListEditor
                              itemLabel={f.itemLabel}
                              values={Array.isArray(item[f.key]) ? item[f.key] : []}
                              onChange={(v) => setItemGroup(i, f.key, v)}
                            />
                          </div>
                        ) : f.type === "group" ? (
                          <div key={f.key} className="admin-field">
                            <span>{f.label}</span>
                            <GroupEditor
                              field={f}
                              values={Array.isArray(item[f.key]) ? item[f.key] : []}
                              onChange={(v) => setItemGroup(i, f.key, v)}
                            />
                          </div>
                        ) : (
                          <Field key={f.key} field={f} value={item[f.key]} onChange={(v) => setItem(i, f.key, v)} />
                        )
                      )}
                    </div>
                    <div className="admin-item-actions">
                      <button className="admin-btn admin-btn--icon" onClick={() => moveItem(i, -1)} disabled={i === 0} title="Monter">
                        <ChevronUp size={15} />
                      </button>
                      <button className="admin-btn admin-btn--icon" onClick={() => moveItem(i, 1)} disabled={i === data.length - 1} title="Descendre">
                        <ChevronDown size={15} />
                      </button>
                      <button className="admin-btn admin-btn--icon danger" onClick={() => removeItem(i)} title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                <button className="admin-add-btn" onClick={addItem}>
                  <Plus size={16} /> Ajouter {schema.itemLabel ? `un·e ${schema.itemLabel}` : "un élément"}
                </button>
              </div>
            )}

            {schema.kind === "strings" && (
              <div className="admin-items">
                {data.map((s, i) => (
                  <div key={i} className="admin-item" style={{ alignItems: "center" }}>
                    <span className="admin-item-index">{i + 1}</span>
                    <input
                      type="text"
                      value={s ?? ""}
                      onChange={(e) => setString(i, e.target.value)}
                      placeholder={schema.itemLabel}
                      style={{ flex: 1 }}
                    />
                    <div className="admin-item-actions" style={{ flexDirection: "row" }}>
                      <button className="admin-btn admin-btn--icon" onClick={() => moveItem(i, -1)} disabled={i === 0}>
                        <ChevronUp size={15} />
                      </button>
                      <button className="admin-btn admin-btn--icon" onClick={() => moveItem(i, 1)} disabled={i === data.length - 1}>
                        <ChevronDown size={15} />
                      </button>
                      <button className="admin-btn admin-btn--icon danger" onClick={() => removeString(i)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                <button className="admin-add-btn" onClick={addString}>
                  <Plus size={16} /> Ajouter {schema.itemLabel ? `un·e ${schema.itemLabel}` : "un élément"}
                </button>
              </div>
            )}

            {schema.kind === "keyvalues" && (
              <div className="admin-items">
                {entries.map((entry, i) => (
                  <div key={i} className="admin-item" style={{ alignItems: "center" }}>
                    <span className="admin-item-index">{i + 1}</span>
                    <div className="admin-form-row" style={{ flex: 1 }}>
                      <Field field={{ key: "key", label: "Clé", type: "text" }} value={entry.key} onChange={(v) => setEntry(i, "key", v)} />
                      <Field field={{ key: "value", label: "URL", type: "text" }} value={entry.value} onChange={(v) => setEntry(i, "value", v)} />
                    </div>
                    <div className="admin-item-actions" style={{ flexDirection: "row" }}>
                      <button className="admin-btn admin-btn--icon danger" onClick={() => removeEntry(i)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                <button className="admin-add-btn" onClick={addEntry}>
                  <Plus size={16} /> Ajouter une image
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
