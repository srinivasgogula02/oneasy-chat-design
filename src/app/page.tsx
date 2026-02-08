import { ProChat } from "@/components/chat/pro-chat";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      <ProChat userId={user?.id} />
    </main>
  );
}
