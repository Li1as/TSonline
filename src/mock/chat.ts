import type { ChatMessage } from "../types/chat";

export const chatMessages: ChatMessage[] = [
  {
    id: "C-1",
    user: "System",
    message: "Room created. Editor mode is active.",
    time: "19:02",
    type: "system",
  },
  {
    id: "C-2",
    user: "Ava",
    message: "Let us keep the harbor map on the top layer for the demo.",
    time: "19:03",
    type: "chat",
  },
  {
    id: "C-3",
    user: "Milo",
    message: "I added a market deck and a discard zone placeholder.",
    time: "19:04",
    type: "chat",
  },
  {
    id: "C-4",
    user: "System",
    message: "No real-time sync connected. Showing mock activity only.",
    time: "19:05",
    type: "system",
  },
  {
    id: "C-5",
    user: "Lina",
    message: "The layout is ready for play mode once interactions are added.",
    time: "19:06",
    type: "chat",
  },
];

export const roomMessagesById: Record<string, ChatMessage[]> = {
  "RM-2048": chatMessages,
  "RM-1954": [
    {
      id: "C-6",
      user: "System",
      message: "Dungeon Draft is in progress.",
      time: "20:10",
      type: "system",
    },
    {
      id: "C-7",
      user: "Dara",
      message: "Next round starts after the relic pile is shuffled.",
      time: "20:11",
      type: "chat",
    },
  ],
  "RM-1821": [
    {
      id: "C-8",
      user: "System",
      message: "Editor sandbox loaded with mock assets.",
      time: "18:30",
      type: "system",
    },
  ],
  "RM-1777": [
    {
      id: "C-9",
      user: "Mina",
      message: "The route marker should stay visible in play mode.",
      time: "21:04",
      type: "chat",
    },
  ],
};
