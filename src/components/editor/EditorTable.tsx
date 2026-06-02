import type { Room } from "../../types/room";
import { RoomTablePlaceholder } from "../room/RoomTablePlaceholder";
import { DefinitionEditorRoom } from "./DefinitionEditorRoom";

interface EditorTableProps {
  room: Room;
}

export function EditorTable({ room }: EditorTableProps) {
  if (room.editorType === "definitionEditor") {
    return <DefinitionEditorRoom room={room} />;
  }

  return <RoomTablePlaceholder room={room} />;
}
