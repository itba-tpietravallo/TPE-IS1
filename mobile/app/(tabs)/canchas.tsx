import FieldPost from "@/components/fieldPost";
import { ScrollView, Text, View, SafeAreaView, StyleSheet } from "react-native";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";

type Field = {
  id: string;
  owner: string;
  avatar_url: string;
  images: string[];
  name: string;
  lat: number;
  long: number;
  dist_meters: number;
};

function CanchasFeed() {
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    supabase
      .rpc("nearby_fields", {
        lat: -34.601, // @todo get user location
        long: -58.382,
        lim: 10,
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching fields:", error);
        } else {
          setFields(data);
          console.log("Data: ", data as Field[]);
        }
      });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2f4f3",
      }}
    >
      <ScrollView
        horizontal={false}
        contentContainerStyle={{ flexDirection: "column", paddingBottom: 100 }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {fields.map((field) => (
          <FieldPost
            name={field.name}
            sport="Futbol"
            location="Buenos Aires"
            key={field.id}
            images={field.images}
          />
        ))}
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
