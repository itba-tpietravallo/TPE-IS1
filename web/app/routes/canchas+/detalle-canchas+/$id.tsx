import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import { FieldDetail } from "./_index";

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

let globalName = "Canchita";
let globalLocation = "Av. Rolon 326, San Isidro, Buenos Aires";
let globalDescription =
  "Lionel Andrés Messi Cuccittini (Rosario, 24 de junio de 1987), conocido como Leo Messi, es un futbolista argentino que juega como delantero o centrocampista. Desde 2023, integra el plantel del Inter Miami de la MLS canadoestadounidense. Es también internacional con la selección de Argentina, de la que es capitán.";

export default function FieldDetailPage() {

const imgs: string[] = ["web/public/img1-f11.jpg", "web/public/img2-f11.jpg", "web/public/img3-f11.jpg"];
    const [name, setName] = useState(globalName);
    const [location, setLocation] = useState(globalLocation);
    const [description, setDescription] = useState(globalDescription);

    const { env, URL_ORIGIN , id} = useLoaderData<typeof loader>();
    const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const [field, setField] = useState<any>([]);
      
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
          }, []);

          console.log(id);
  return (
    <FieldDetail
    name={field.name}
    description={field.description}
    imgSrc={field.images}
    location={`${field.street} ${field.street_number}`}
    setDescription={setDescription}
    setLocation={setLocation}
    setName={setName}
    />
  );
}
