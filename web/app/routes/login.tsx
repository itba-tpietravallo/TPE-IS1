import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Card, CardTitle } from '~/components/ui/card'
import { useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { LoaderFunctionArgs } from '@remix-run/node';
import { createSupabaseClient } from '~/lib/supabase.client';

export function loader(args: LoaderFunctionArgs) {
    const env = {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    }
    
    return {
        env,
        URL_ORIGIN: new URL(args.request.url).origin
    };
}


export function LoginCard() {
    const { URL_ORIGIN, env } = useLoaderData<typeof loader>();
    const supabase = createSupabaseClient(env);

    return <Card className='flex flex-col p-4 justify-center items-center'>
        <CardTitle>Welcome to MatchPoint!</CardTitle>
        <div className='min-w-96'>
            <Suspense fallback={<div>Loading...</div>} >
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google', 'facebook']}
                    redirectTo={ new URL(URL_ORIGIN).toString() + "login/callback" }
                />
            </Suspense>
        </div>
    </Card>
}

export default function(){
    return <div className='flex justify-center items-center h-screen'>
        <LoginCard/>
    </div>
}
