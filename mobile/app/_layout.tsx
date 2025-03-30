import { Stack } from "expo-router";

import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import { View, Text } from 'react-native'
import { Session } from '@supabase/supabase-js'

export default function RootLayout() {
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
		})
		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
		})
	}, []);

	return <View>
		{ (session && session.user) ? <Stack/> : <Auth/> }
	</View>;
}
