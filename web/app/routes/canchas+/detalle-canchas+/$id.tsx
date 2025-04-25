import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { FieldDetail } from "./FieldDetail";

export function loader(args: LoaderFunctionArgs) {
    const env = {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    }
    
    return {
        env,
        URL_ORIGIN: new URL(args.request.url).origin,
        id: args.params.id
    };
}

export default function FieldDetailPage() {

const imgs: string[] = ["web/public/img1-f11.jpg", "web/public/img2-f11.jpg", "web/public/img3-f11.jpg"];
    const { env, URL_ORIGIN , id} = useLoaderData<typeof loader>();
    const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const [field, setField] = useState<any>([]);
    const [reservations, setReservations] = useState<any[]>([]);
      
          useEffect(() => {
              supabase
                  .from("fields")
                  .select("*")
                  .eq("id", id)
                  .single()
                  .then(({ data, error }) => {
                      if (error) {
                          console.error("Supabase error:", error);
                      } else {
                          setField(data as any[]);
                      }
                  });
                  supabase
                  .from("reservations")
                  .select("*")
                  .eq("field_id", id)
                  .then(({ data, error }) => {
                      if (error) {
                          console.error("Supabase error:", error);
                      } else {
                          setReservations(data as any[]);
                      }
                  });
          }, []);

          console.log(id);

        const [name, setName] = useState(field.name);
        const [description, setDescription] = useState(field.description);

        useEffect(() => {
            setName(field.name);
            setDescription(field.description)
          }, [field.name, field.description]);
          
  return (
    <FieldDetail
    key={id}
    name={name}
    description={description}
    imgSrc={field.images}
    price={field.price}
    location={`${field.street} ${field.street_number}`}  
    setDescription={setDescription}
    setName={setName}
    reservations={reservations}
    />
  );
}
