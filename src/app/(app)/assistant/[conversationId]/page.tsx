import { notFound, redirect } from "next/navigation";
import {
  AssistantChat,
  type ChatMessage,
} from "@/components/assistant/AssistantChat";
import { createClient } from "@/lib/supabase/server";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: conv } = await supabase
    .from("ai_conversations")
    .select("id, related_assessment_id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conv) notFound();

  const { data: rows } = await supabase
    .from("ai_messages")
    .select("id, role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  const initialMessages: ChatMessage[] = (rows ?? [])
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => ({
      id: r.id as string,
      role: r.role as "user" | "assistant",
      content: r.content as string,
    }));

  return (
    <AssistantChat
      conversationId={conversationId}
      initialMessages={initialMessages}
      relatedAssessmentId={conv.related_assessment_id ?? undefined}
    />
  );
}