import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, city, province, region, capoluogo, zone } = body;

    if (!email || !password || !name || !province) {
      return NextResponse.json({ error: 'Dati mancanti.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // 1. Create auth user with auto-confirmed email
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (authError) {
      // Duplicate email
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        return NextResponse.json({ error: 'Questa email è già registrata.' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Errore nella creazione utente.' }, { status: 500 });
    }

    // 2. Create user_profile (via admin to bypass RLS)
    const { error: profileError } = await admin.from('user_profiles').insert({
      id: userId,
      name,
      role: 'member',
      province,
      city: city || province,
      region: region || null,
      capoluogo: capoluogo || null,
      zone: zone || null,
    });

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Errore nella creazione profilo.' }, { status: 500 });
    }

    // 3. Auto-assign zone manager
    const { data: zmProfile } = await admin
      .from('user_profiles')
      .select('id')
      .eq('role', 'zone_manager')
      .eq('capoluogo', capoluogo || '')
      .maybeSingle();

    if (zmProfile?.id) {
      await admin
        .from('user_profiles')
        .update({ zone_manager_id: zmProfile.id })
        .eq('id', userId);
    }

    return NextResponse.json({ userId });
  } catch {
    return NextResponse.json({ error: 'Errore interno. Riprova.' }, { status: 500 });
  }
}
