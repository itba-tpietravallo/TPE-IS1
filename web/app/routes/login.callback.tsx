import type { ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { createSupabaseServerClient } from '../lib/supabase.server';

export const loader = async ({ request }: ActionFunctionArgs) => {
    const url = new URL(request.url)
    const code = url.searchParams.get('code');

    if (code) {
        const { supabaseClient, headers } = createSupabaseServerClient(request);
        const { error } = await supabaseClient.auth.exchangeCodeForSession(code);
        if (error) {
            return redirect('/login')
        }
        return redirect('/canchas', {
            headers,
        })
    }

    return new Response('Authentication failed', {
        status: 400,
    })
}