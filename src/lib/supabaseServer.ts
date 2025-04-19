// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers"; // Import cookies dari next/headers

// Impor tipe Database jika kamu generate Supabase types (opsional)
// import { Database } from '@/types/supabase';

// Fungsi untuk membuat Supabase client di Server Component
export const createSupabaseServerClient = () => {
  const cookieStore = cookies(); // Dapatkan cookie store

  // Ambil environment variables (pastikan ada tanda seru ! jika kamu yakin tidak null)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Sebaiknya throw error di sini jika env vars tidak ada saat runtime
    // Meskipun pengecekan sudah ada di client, ini untuk server-side
    throw new Error(
      "Supabase URL or Anon Key is missing in server environment."
    );
  }

  // Buat dan kembalikan Supabase client yang dikonfigurasi untuk SSR
  return createServerClient(
    // Gunakan createServerClient dari @supabase/ssr
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        // Fungsi untuk mendapatkan cookie
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Fungsi untuk mengatur cookie (handle error jika dipanggil dari Server Component)
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Abaikan error jika 'set' dipanggil dari Server Component
            // Middleware biasanya yang menangani update cookie session
          }
        },
        // Fungsi untuk menghapus cookie (handle error jika dipanggil dari Server Component)
        remove(name: string, options: CookieOptions) {
          try {
            // Hapus cookie dengan mengatur value kosong dan maxAge 0
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch (error) {
            // Abaikan error jika 'remove' dipanggil dari Server Component
          }
        },
      },
    }
    // Jika pakai generated types:
    // <Database>
  );
};
