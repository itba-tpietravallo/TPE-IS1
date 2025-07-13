import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { Info } from "lucide-react";
import { useState } from "react";
import { getAllTeams, getAllUsers } from "@lib/autogen/queries";
import { Button } from "~/components/ui/button";

import type { Database } from "@lib/autogen/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export function ReservationSheet({
	reservation,
	team,
	supabase,
}: {
	reservation: any;
	team: any;
	supabase: SupabaseClient<Database>;
}) {
	const [open, setOpen] = useState(false);
	const [isCanceling, setIsCanceling] = useState(false);
	const teamsData = getAllTeams(supabase);
	const usersData = getAllUsers(supabase);

	const handleCancelation = async () => {
		try {
			setIsCanceling(true);
			const ownerData = await getAllUsers(supabase).then((res) =>
				res.data?.find((user) => user.id === reservation.owner_id)
			);

			if (!reservation) {
				alert("Error: Reserva no encontrada");
				setIsCanceling(false);
				return;
			}

			await fetch(new URL("api/v1/send-email", window.location.origin).toString(), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: "cancelled_reservation",
					player_email: ownerData?.email || "",
					player_name: ownerData?.full_name || "",
					payment_id: reservation.payments_ids?.[0] || "",
					field_name: reservation.field.name,
					reservation_date: reservation?.date_time,
					confirmed: true,
				}),
			});

			alert("Reserva cancelada exitosamente");
		} catch (error) {
			console.error("Error al cancelar la reserva:", error);
			alert("Error al cancelar la reserva");
		} finally {
			setIsCanceling(false);
		}
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<button>
					<Info className="text-gray h-5 w-5 justify-center hover:text-blue-700" />
				</button>
			</SheetTrigger>
			<SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
				<SheetHeader>
					<SheetTitle className="underline">Detalles de la reserva</SheetTitle>
				</SheetHeader>
				<div className="mt-4 space-y-3">
					<div className="rounded-md border border-gray-300 bg-white p-4 shadow-sm">
						<p>
							<strong>Fecha: </strong> {new Date(reservation.date_time).toLocaleDateString("es-AR")}
						</p>
						<p>
							<strong>Horario: </strong>
							{new Date(reservation.date_time).toLocaleTimeString("es-ES", {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
					<div className="space-y-1 text-sm text-gray-400">
						<p>
							<strong>Dueño de la reserva:</strong>
							{usersData.data?.find((user) => user.id === reservation?.owner_id)?.full_name ||
								"Desconocido"}
						</p>
						<p>
							<strong>Id de la reserva:</strong> {reservation?.id}
						</p>
					</div>
					<p className="text-lg">
						<strong>Equipo:</strong> {team?.name}
					</p>
					<div>
						<ul className="mt-2 space-y-1">
							{team?.players.map((playerId: string) => {
								const user = usersData.data?.find((user) => user.id === playerId) || null;
								const name = user?.full_name || "Desconocido";
								const pending = !reservation.confirmed;
								// console.log("players id", team.players);
								// console.log("pendientes", reservation.payments_ids);
								return (
									<li key={playerId} className="flex items-center justify-start gap-2">
										<span>{name}</span>
										<span className={pending ? "text-yellow-500" : "text-green-500"}>
											{pending ? "Pago pendiente" : "Pagado"}
										</span>
									</li>
								);
							})}
						</ul>
					</div>
					<Button
						variant="destructive"
						onClick={handleCancelation}
						disabled={isCanceling}
						className={isCanceling ? "animate-pulse" : ""}
					>
						{isCanceling ? "Cancelando..." : "Cancelar Reserva"}
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
