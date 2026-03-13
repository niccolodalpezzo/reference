import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/professionisti') || pathname.startsWith('/messaggi')) {
    if (!user) return NextResponse.redirect(new URL('/login?from=member', request.url));
  }

  if (pathname.startsWith('/resp-zona')) {
    if (!user) return NextResponse.redirect(new URL('/login?from=zone_manager', request.url));
    // Role check delegated to client-side AuthGuard to avoid
    // fragile RLS queries in middleware that can cause redirect loops
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/professionisti/:path*', '/messaggi/:path*', '/resp-zona/:path*'],
};
