import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ApexCode — Next-Gen Competitive Programming & Online Judge",
  description:
    "Master algorithms, development challenges, SQL queries, and shell scripting with real-time evaluation and AI code analysis.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileData = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, role, profile_picture_url")
      .eq("id", user.id)
      .single();
    profileData = profile;
  }

  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen antialiased selection:bg-blue-500 selection:text-white">
        <ThemeProvider>
          <Navbar
            userRole={profileData?.role}
            username={profileData?.username}
            avatarUrl={profileData?.profile_picture_url}
          />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
