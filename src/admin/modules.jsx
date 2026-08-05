import {
  Archive,
  Calendar,
  FilePenLine,
  GraduationCap,
  LayoutDashboard,
  Network,
  Newspaper,
  Receipt,
  Tag,
  UserCog,
  UserPlus,
  Wallet,
} from "lucide-react";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Contenu from "./Contenu";
import Blog from "./Blog";
import Categories from "./Categories";
import Events from "./Events";
import FormationsAdmin from "./Formations";
import Membres from "./Membres";
import Cotisations from "./Cotisations";
import Archivage from "./Archivage";
import Collaboratif from "./Collaboratif";
import Facturation from "./Facturation";
import PlaceholderModule from "./Placeholder";

export const adminModules = [
  {
    id: "apercu",
    label: "Aperçu",
    icon: LayoutDashboard,
    path: "apercu",
    element: <Dashboard />,
  },
  {
    id: "contenu",
    label: "Contenu du site",
    icon: FilePenLine,
    path: "contenu",
    element: <Contenu />,
  },
  {
    id: "blog",
    label: "Articles",
    icon: Newspaper,
    path: "blog",
    element: <Blog />,
  },
  {
    id: "categories",
    label: "Catégories",
    icon: Tag,
    path: "categories",
    element: <Categories />,
  },
  {
    id: "events",
    label: "Événements",
    icon: Calendar,
    path: "events",
    element: <Events />,
  },
  {
    id: "formations",
    label: "Formations",
    icon: GraduationCap,
    path: "formations",
    element: <FormationsAdmin />,
  },
  {
    id: "archivage",
    label: "Archivage électronique",
    icon: Archive,
    path: "archivage",
    element: <Archivage />,
  },
  {
    id: "collaboratif",
    label: "Travail collaboratif",
    icon: Network,
    path: "collaboratif",
    element: <Collaboratif />,
  },
  {
    id: "membres",
    label: "Gestion des membres",
    icon: UserPlus,
    path: "membres",
    element: <Membres />,
  },
  {
    id: "cotisations",
    label: "Cotisations",
    icon: Wallet,
    path: "cotisations",
    element: <Cotisations />,
  },
  {
    id: "facturation",
    label: "Facturation",
    icon: Receipt,
    path: "facturation",
    element: <Facturation />,
  },
  {
    id: "profil",
    label: "Profil",
    icon: UserCog,
    path: "profil",
    element: <Profile />,
  },
];

export const getModule = (id) => adminModules.find((m) => m.id === id);




