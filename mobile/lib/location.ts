// location.ts
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { getNearbyFields } from "./autogen/queries";
import { supabase } from "@lib/supabase";

export function useLocation() {
	const [location, setLocation] = useState<Location.LocationObject | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const getCurrentLocation = async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					if (isMounted) setErrorMsg("Permission to access location was denied");
					return;
				}

				const loc = await Location.getCurrentPositionAsync({});
				if (isMounted) setLocation(loc);
			} catch (err) {
				if (isMounted) setErrorMsg("Error getting location");
			}
		};

		getCurrentLocation();

		return () => {
			isMounted = false;
		};
	}, []);

	return { location, errorMsg } as
		| { location: Location.LocationObject; errorMsg: null }
		| { location: null; errorMsg: string };
}

export function getNearbyFieldsByLoc(lat: number, long: number) {
	const { data } = getNearbyFields(supabase, lat, long, 10, { enabled: !!(lat && long) });
	return { data };
}
