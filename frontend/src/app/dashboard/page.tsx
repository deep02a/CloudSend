// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SidebarDemo } from "@/app/components/dashboard";


export default async function DashboardPage() {
  const cookieStore = await cookies(); // ✅ synchronous if used in server component
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/login?error=Unauthorized');
  }

  return <SidebarDemo />;
}









