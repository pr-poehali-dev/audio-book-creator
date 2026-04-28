import { useState } from "react";
import { Page } from "@/components/app-data";
import { AppLayout } from "@/components/AppLayout";
import {
  HomePage,
  EditorPage,
  ProjectsPage,
  LibraryPage,
  ExportPage,
  SettingsPage,
  ProfilePage,
  HelpPage,
} from "@/components/AppPages";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageMap: Record<Page, React.ReactNode> = {
    home:     <HomePage setPage={setPage} />,
    editor:   <EditorPage />,
    projects: <ProjectsPage />,
    library:  <LibraryPage />,
    export:   <ExportPage />,
    settings: <SettingsPage />,
    profile:  <ProfilePage />,
    help:     <HelpPage />,
  };

  return (
    <AppLayout
      page={page}
      setPage={setPage}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {pageMap[page]}
    </AppLayout>
  );
}
