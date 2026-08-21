// app/page.tsx

import prisma from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();
  return (
    <div className="min-h-screen bg-red-500 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-[#333333]">
        Superblog
      </h1>
      <ol className="list-decimal list-inside">
        {users.map((user) => (
          <li key={user.id} className="mb-2">
            {user.name}
          </li>
        ))}
      </ol>
    </div>
  );
} 