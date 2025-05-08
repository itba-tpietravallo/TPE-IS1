// location.ts
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { getNearbyFields } from './autogen/queries';
import { supabase } from '@lib/supabase';

function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    }

    getCurrentLocation();
  }, []);

  return { location, errorMsg } as { location: Location.LocationObject, errorMsg: null } | { location: null, errorMsg: string };
}


export function getNearbyFieldsByLoc() {

      const { location, errorMsg } = useLocation();
  
      // errorMsg is null if location is granted
      if (errorMsg != null) {
          throw new Error("could not retrieve coords");
      }
  
      const { data } = getNearbyFields(supabase, location?.coords.latitude, location?.coords.longitude, 10, { enabled: !!location });

      return {data};
}