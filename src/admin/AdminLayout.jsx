import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Archive,
  Bell,
  ChevronDown,
  FilePenLine,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Network,
  Receipt,
  Search,
  ShieldCheck,
  UserCog,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  {
    section: "Menu",
    items: [
      { id: "apercu", label: "Tableau de bord", icon: LayoutDashboard, to: "/admin/apercu" },
      {
        id: "contenu",
        label: "Contenu",
        icon: FilePenLine,
        to: "/admin/contenu",
        children: [
          { id: "contenu-sections", label: "Sections", to: "/admin/contenu" },
          { id: "contenu-blog", label: "Blog", to: "/admin/blog" },
        ],
      },
    ],
  },
  {
    section: "Outils",
    items: [
      { id: "formations", label: "Formations", icon: GraduationCap, to: "/admin/formations" },
      { id: "archivage", label: "Archivage électronique", icon: Archive, to: "/admin/archivage" },
      { id: "collaboratif", label: "Travail collaboratif", icon: Network, to: "/admin/collaboratif" },
      { id: "membres", label: "Gestion des membres", icon: UserPlus, to: "/admin/membres" },
      { id: "cotisations", label: "Cotisations", icon: Wallet, to: "/admin/cotisations" },
      { id: "facturation", label: "Facturation", icon: Receipt, to: "/admin/facturation" },
    ],
  },
];

function matches(location, to) {
  return (
    location.pathname === to ||
    location.pathname.startsWith(`${to}/`) ||
    (to === "/admin/apercu" && location.pathname === "/admin")
  );
}

export default function AdminLayout() {
  const { user, initializing, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState(() => {
    const init = {};
    for (const group of NAV) {
      for (const item of group.items) {
        if (item.children && item.children.some((c) => matches(location, c.to))) {
          init[item.id] = true;
        }
      }
    }
    return init;
  });

  if (initializing) {
    return (
      <div className="admin-loading">
        <Loader2 className="spin" size={20} /> Chargement…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  async function handleLogout() {
    setBusy(true);
    await logout();
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function toggleMenu(id) {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="admin-shell">
      <div
        className={`admin-overlay${sidebarOpen ? " is-visible" : ""}`}
        onClick={closeSidebar}
      />
      <aside className={`admin-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="admin-sidebar-brand">
          <img src="/logo-white.png" alt="APSI-CG" className="admin-sidebar-logo" />
        </div>

        <nav className="admin-nav">
          {NAV.map((group) => (
            <div key={group.section}>
              <span className="admin-nav-section">{group.section}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const childActive =
                  item.children &&
                  item.children.some((c) => matches(location, c.to));
                const active =
                  matches(location, item.to) || childActive;
                const open = !!openMenus[item.id];

                if (item.children) {
                  return (
                    <div key={item.id} className="admin-nav-group">
                      <button
                        type="button"
                        className={`admin-nav-link admin-nav-toggle${active ? " is-active" : ""}${open ? " is-open" : ""}`}
                        onClick={() => toggleMenu(item.id)}
                        aria-expanded={open}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                        <ChevronDown size={16} className="admin-nav-chevron" />
                      </button>
                      <div className={`admin-nav-sub${open ? " is-open" : ""}`}>
                        {item.children.map((child) => {
                          const childIsActive = matches(location, child.to);
                          return (
                            <Link
                              key={child.id}
                              to={child.to}
                              className={`admin-nav-sublink${childIsActive ? " is-active" : ""}`}
                              onClick={closeSidebar}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    className={`admin-nav-link${active ? " is-active" : ""}`}
                    onClick={closeSidebar}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-sidebar-site">
            <ShieldCheck size={17} />
            Voir le site public
          </Link>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-burger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="admin-search">
            <Search size={17} />
            <input type="text" placeholder="Rechercher…" aria-label="Rechercher" />
          </div>

          <div className="admin-topbar-right">
            <Link to="/" className="admin-icon-btn" title="Voir le site">
              <ShieldCheck size={19} />
            </Link>
            <button className="admin-icon-btn" title="Notifications">
              <Bell size={19} />
              <span className="notif-dot" />
            </button>
            <div className="admin-profile-menu">
              <button
                type="button"
                className="admin-profile-btn"
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
                title="Profil"
              >
                <UserCog size={19} />
                <span>Profil</span>
                <ChevronDown size={15} className={`admin-profile-chevron${profileOpen ? " is-open" : ""}`} />
              </button>
              <div className={`admin-profile-dropdown${profileOpen ? " is-open" : ""}`}>
                <Link to="/admin/apercu" onClick={() => setProfileOpen(false)}>
                  Administration
                </Link>
                <Link to="/admin/facturation" onClick={() => setProfileOpen(false)}>
                  Facturation
                </Link>
                <Link to="/admin/profil" onClick={() => setProfileOpen(false)}>
                  Profil
                </Link>
              </div>
            </div>
            <div className="admin-topbar-user" title={user.email}>
              <span className="admin-avatar">{user.name.charAt(0).toUpperCase()}</span>
              <span>
                <strong>{user.name}</strong>
                <small>{user.role === "admin" ? "Administrateur" : user.role}</small>
              </span>
            </div>
            <button
              className="admin-icon-btn"
              onClick={handleLogout}
              disabled={busy}
              title="Déconnexion"
            >
              {busy ? <Loader2 className="spin" size={17} /> : <LogOut size={17} />}
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}




