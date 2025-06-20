// File: app/brand/(protected)/messages/[id]/page.tsx
import ChatWindow from "../components/chatWindow";

interface PageProps {
  params: { id: string };
}

export default function MessagePage({ params }: PageProps) {
  // params.id is your roomId
  return <ChatWindow params={{ roomId: params.id }} />;
}
