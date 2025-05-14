import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import type { Database } from "@lib/autogen/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UseQueryResult } from "@tanstack/react-query";

export function DeleteFieldButton({
	supabase,
	fieldId,
	dependantQueries,
}: {
	supabase: SupabaseClient<Database>;
	fieldId: string;
	dependantQueries: UseQueryResult[];
}) {
	const handleDelete = async () => {
		await supabase.from("fields").delete().eq("id", fieldId).throwOnError();
		dependantQueries?.forEach((query) => {
			query.refetch();
		});
		window.location.pathname = "/canchas";
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" className="ml-4 text-sm font-medium hover:bg-red-700">
					Eliminar cancha
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Estas completamente seguro?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta accion no puede deshacerse. Esta cancha sera eliminada permanentemente.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
