import { Navigate, useParams } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { TopBar } from "../components/layout/TopBar";
import { RoomChatSection } from "../components/room/RoomChatSection";
import { RoomInfoSection } from "../components/room/RoomInfoSection";
import { RoomTablePlaceholder } from "../components/room/RoomTablePlaceholder";
import { RoomUsersSection } from "../components/room/RoomUsersSection";
import { useAppState } from "../state/AppContext";

export function RoomPage() {
  const { roomId = "" } = useParams();
  const { getRoomById } = useAppState();
  const room = getRoomById(roomId);

  if (!room) {
    return <Navigate to="/rooms" replace />;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-zinc-900">
      <TopBar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <RoomInfoSection room={room} />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <RoomTablePlaceholder room={room} />
          <div className="flex flex-col gap-4">
            <RoomUsersSection roomId={room.id} />
            <RoomChatSection roomId={room.id} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
