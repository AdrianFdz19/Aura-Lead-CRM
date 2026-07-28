import ChatPage from '@/app/components/chat/ChatPage';
import { getSession } from '@/lib/auth'; // Tu función de sesión

export default async function Page() {
  const session = await getSession();
  
  // Pasamos el tenantId como propiedad
  return (
    <>
        { session?.tenantId && <ChatPage tenantId={session.tenantId} /> }
    </>
  );
}