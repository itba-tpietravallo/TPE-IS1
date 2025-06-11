"use client";
import { Clock } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@lib/autogen/database.types";
import { getTeamMembers, getUserSessionById } from "@lib/autogen/queries";

type ReservationSlotProps = {
	reservation: {
		date_time: string;
		slot_duration: number;
		event_name: string;
		payment_status: "pending" | "confirmed";
		sport?: string;
		team?: string;
		owner: string;
	};
	supabase: SupabaseClient<Database>;
	onReservationClick: (reservation: any) => void;
};

export function ReservationSlot({ reservation, supabase, onReservationClick }: ReservationSlotProps) {
	// Fetch team members if team exists
	const { data: teamData } = getTeamMembers(supabase as any, reservation.team!, { enabled: !!reservation.team });

	// Fetch owner information
	const { data: ownerData } = getUserSessionById(supabase as any, reservation.owner, {
		enabled: !!reservation.owner,
	});

	const formatTime = (dateString: string) => {
		return new Date(dateString)
			.toLocaleTimeString("es-ES", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			})
			.replace(/^\b\w/g, (char) => char.toUpperCase());
	};

	const formatDuration = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0 && mins > 0) {
			return `${hours}h ${mins}m`;
		} else if (hours > 0) {
			return `${hours}h`;
		} else {
			return `${mins}m`;
		}
	};

	const handleClick = () => {
		// Combine reservation data with fetched information
		const enrichedReservation = {
			...reservation,
			team_members: teamData?.players || [],
			owner_name: ownerData?.full_name || "Usuario desconocido",
		};
		onReservationClick(enrichedReservation);
	};

	return (
		<div
			onClick={handleClick}
			className={`cursor-pointer rounded-md border border-gray-200 p-2 shadow-sm transition-all hover:shadow-md ${
				reservation.payment_status === "confirmed"
					? "border-blue-200 bg-blue-50 hover:bg-blue-100"
					: "bg-white hover:bg-gray-50"
			}`}
		>
			<div className="mb-1 truncate text-sm font-medium text-gray-900">{reservation.event_name}</div>
			<div className="flex items-center gap-1 text-xs text-muted-foreground">
				<Clock className="h-3 w-3" />
				{formatTime(reservation.date_time)}
			</div>
			<div className="mt-1 text-xs text-muted-foreground">{formatDuration(reservation.slot_duration)}</div>
			<div
				className={`mt-1 text-xs font-medium ${
					reservation.payment_status === "confirmed" ? "text-blue-600" : "text-orange-600"
				}`}
			>
				{reservation.payment_status === "confirmed" ? "Confirmado" : "Pendiente"}
			</div>
		</div>
	);
}
