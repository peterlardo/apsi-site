import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Commissions from "./pages/Commissions";
import Formations from "./pages/Formations";
import TrainingDetail from "./pages/TrainingDetail";
import Evenements from "./pages/Evenements";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import Cookies from "./pages/Cookies";
import MentionsLegales from "./pages/MentionsLegales";
import Login from "./admin/Login";
import ForgotPassword from "./admin/ForgotPassword";
import ResetPassword from "./admin/ResetPassword";
import AdminLayout from "./admin/AdminLayout";
import SectionEditor from "./admin/SectionEditor";
import BlogEditor from "./admin/BlogEditor";
import EventEditor from "./admin/EventEditor";
import { adminModules } from "./admin/modules";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="a-propos" element={<About />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="formations" element={<Formations />} />
          <Route path="formations/:slug" element={<TrainingDetail />} />
          <Route path="evenements" element={<Evenements />} />
          <Route path="services" element={<Services />} />
          <Route path="projets" element={<Projects />} />
          <Route path="equipe" element={<Team />} />
          <Route path="tarifs" element={<Pricing />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="contact" element={<Contact />} />
          <Route path="politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="cookies" element={<Cookies />} />
          <Route path="mentions-legales" element={<MentionsLegales />} />
          <Route path="*" element={<Home />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="apercu" replace />} />
          {adminModules.map((m) => (
            <Route key={m.id} path={m.path} element={m.element} />
          ))}
          <Route path="contenu/:name" element={<SectionEditor />} />
          <Route path="blog/nouveau" element={<BlogEditor />} />
          <Route path="blog/:id/edit" element={<BlogEditor />} />
          <Route path="events/nouveau" element={<EventEditor />} />
          <Route path="events/:id/edit" element={<EventEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
