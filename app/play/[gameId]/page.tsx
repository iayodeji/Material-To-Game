import { Metadata } from "next";
import PlayClient from "./PlayClient";

export const metadata: Metadata = {
  title: "Play — QuestForge",
};

export default async function PlayPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  return <PlayClient gameId={gameId} />;
}
