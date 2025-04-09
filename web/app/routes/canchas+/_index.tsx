import { MapPin } from "lucide-react";
import { Card, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";

type FieldPreviewProps = {
    id: string;
    name: string;
    img: string; /* aca ni idea como poner*/
    location: string;
}

export function loader(args: LoaderFunctionArgs) {
    const env = {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    }
    
    return ({
        env,
        URL_ORIGIN: new URL(args.request.url).origin
    });
}

type FieldsPreviewGridProps = {
    fields: FieldPreviewProps[];
};

export function FieldsPreviewGrid({fields}: FieldsPreviewGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full p-4">
            {fields.map((field, index) => (
                
                <FieldPreview key={field.id} {...field} />

            ))}
        </div>
    );  
}

export function FieldPreview(props:FieldPreviewProps) {
    const {id, name, location, img} = props;

    return (
    <div className="flex p-2 w-full">
       <Link to={`/canchas/detalle-canchas/${id}`} className="w-full">
            <Card className="w-full">
                <CardTitle className="p-4"> {name} </CardTitle>
                <CardDescription className="flex items-center gap-2 m-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {location}
                    </CardDescription>
                <CardContent className="flex justify-center" >
                    <img src={img} className="w-full h-32 object-cover rounded-lg"/>
                </CardContent>
            </Card>
        </Link>
    </div>
    );
}



export default function(){

    const { URL_ORIGIN, env } = useLoaderData<typeof loader>();
    const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const [users, setUsers] = useState<any[]>([]);
    
        useEffect(() => {
            supabase
                .from("fields")
                .select("*")
                .then(({ data, error }) => {
                    if (error) {
                        console.error("Supabase error:", error);
                    } else {
                        setUsers(data as any[]);
                    }
                });
        }, []);

        const fields = users.map((user, i) => ({

            id: user.id,
            name: user.name,
            img: user.images[0],
            location: `${user.street} ${user.street_number}`,
          }));
    
    return (
        <div>
            <br/>
            <FieldsPreviewGrid fields={fields}/>
        </div>
    );
}