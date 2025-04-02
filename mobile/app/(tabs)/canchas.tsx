import FieldPost from "@/components/fieldPost";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, SafeAreaView, StyleSheet } from "react-native";

type Field = {
  id: string;
  owner: string;
  avatar: string;
  images: string[];
  name: string;
  lat: number;
  long: number;
  dist_meters: number;
};

function CanchasFeed() {
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    supabase.rpc('nearby_fields', {
      lat: -34.601, // @todo get user location
      long: -58.382,
      lim: 10,
    }).then(({ data, error }) => {
      if (error) {
        console.error("Error fetching fields:", error);
      } else {
        setFields(data);
        console.log('Data: ', data as Field[]);
      }
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ScrollView
        horizontal={false}
        contentContainerStyle={{ flexDirection: "column" }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        
        {
          fields.map((field) => (
            <FieldPost
              key={field.id}
              images={field.images}
              name={field.name}
              sport="Futbol"          // Replace with actual sport name
              location="Buenos Aires" // Replace with actual location name
            />
          ))
        }
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 120,
  },
  buttonContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 15,
    backgroundColor: "#CC0000",
  },
});

export default CanchasFeed;
