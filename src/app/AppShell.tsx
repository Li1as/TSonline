import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GameDefinitionPage } from "../pages/GameDefinitionPage";
import { GamesPage } from "../pages/GamesPage";
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
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:gameType" element={<GameDefinitionPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId" element={<RoomPage />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
