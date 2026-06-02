import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAppState } from "../../state/AppContext";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Games", to: "/games" },
  { label: "Rooms", to: "/rooms" },
];

export function TopBar() {
  const navigate = useNavigate();
  const { rooms, joinRoom, currentUser, isConnected } = useAppState();
  const demoRoomId = rooms[0]?.id;

  async function handleJoinDemo() {
    if (!demoRoomId) {
      return;
    }
    const didJoin = await joinRoom(demoRoomId);
    if (didJoin) {
      navigate(`/rooms/${demoRoomId}`);
    }
  }

  return (
    <header className="border-b border-zinc-200 bg-white/95">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-900 p-2 shadow-sm">
            <img src={logo} alt="TSonline logo" className="max-h-full max-w-full" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">TSonline</p>
            <p className="text-xs text-zinc-500">Tabletop rooms and editor</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? "bg-white font-medium text-zinc-900 shadow-sm"
                    : "text-zinc-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 lg:block">
            {isConnected ? currentUser?.name ?? "Connecting..." : "Server offline"}
          </div>
          <button
            type="button"
            onClick={handleJoinDemo}
            disabled={!isConnected}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700"
          >
            Join Demo
          </button>
          <NavLink
            to="/rooms"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
          >
            Create Room
          </NavLink>
        </div>
      </div>
    </header>
  );
}
