import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { RoomPage } from "../pages/RoomPage";
import { RoomsPage } from "../pages/RoomsPage";
import { AppProvider } from "../state/AppContext";

export function AppShell() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId" element={<RoomPage />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
