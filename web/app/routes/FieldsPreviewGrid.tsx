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
            <CardDescription className="m-3">{location}</CardDescription>
            <CardContent className="flex justify-center" >{img}</CardContent>
        </Card>
    </div>
    );
}

export default function(){
    // faltaria poner un parámetro a esta función para que le llegue el array fields,
    // pero para testear/ver lo dejo asi
    const fields = [
        { name: "Voley 1", img: "(foto 1)", location: "Virrey del Pino 1818" },
        { name: "Fulbo 2", img: "(foto 2)", location: "San Martin 1234" },
        { name: "Hockey 3", img: "(foto 3)", location: "Corrientes 5678" },
        { name: "Mini golf 4", img: "(foto 4)", location: "Lavalle 91011" },
        { name: "Ajedrez 5", img: "(foto 5)", location: "Belgrano 1213" },
    ];
    
    return <FieldsPreviewGrid fields={fields}/>;
}