import { MapPin } from "lucide-react";
import { Card, CardTitle, CardDescription, CardContent } from "~/components/ui/card";

type FieldPreviewProps = {
    name: string;
    img: string; /* aca ni idea como poner*/
    location: string;
}

type FieldsPreviewGridProps = {
    fields: FieldPreviewProps[]; // Array of fields
};

export function FieldsPreviewGrid({fields}: FieldsPreviewGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full p-4">
            {fields.map((field, index) =>
                <FieldPreview key={index} {...field}/>
            )}
        </div>
    );  
}

export function FieldPreview(props:FieldPreviewProps) {
    const {name, location, img} = props;

    return (
    <div className="flex p-2 w-full">
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
    </div>
    );
}

export default function(){
    // esta data es para ver como se veria. Falta que me llegue por parámetro desde la BD la info.

    const fields = [
        { name: "Voley 1", img: "medidas_sm.jpg", location: "Virrey del Pino 1818" },
        { name: "Fulbo 2", img: "medidas_sm.jpg", location: "San Martin 1234" },
        { name: "Hockey 3", img: "medidas_sm.jpg", location: "Corrientes 5678" },
        { name: "Mini golf 4", img: "medidas_sm.jpg", location: "Lavalle 91011" },
        { name: "Ajedrez 5", img: "medidas_sm.jpg", location: "Belgrano 1213" },
    ];
    
    return (
        <div>
            <br/>
            <FieldsPreviewGrid fields={fields}/>
        </div>
    );
}