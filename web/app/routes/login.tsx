import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { Card, CardTitle } from '~/components/ui/card'
import { useLoaderData } from '@remix-run/react';

export function loader() {
    const env = {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    }
    
    return {
        env
    };
}

export function LoginCard() {
    const { env } = useLoaderData<typeof loader>();
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    return <Card className='flex flex-col p-4 justify-center items-center'>
        <CardTitle>Welcome to MatchPoint!</CardTitle>
        <div className='min-w-96'>
            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook']}
            />
        </div>
    </Card>
}

export default function(){
    return <div className='flex justify-center items-center h-screen'>
        <LoginCard/>
    </div>
}
