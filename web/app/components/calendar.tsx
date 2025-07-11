"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Users, CreditCard, Trophy } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/lib/database.types";
import { ReservationSlot } from "./reservation-slot";
import { getUsername } from "@lib/autogen/queries";

type Reservation = {
	date_time: string;
	slot_duration: number | undefined;
	event_name: string;
	payment_status: "pending" | "confirmed";
	sport?: string;
	team?: string;
	owner: string;
};

type EnrichedReservation = Reservation & {
	team_members: string[];
	owner_name: string;
};

type WeekCalendarProps = {
	reservations: Reservation[];
	supabase: SupabaseClient<Database>;
};

function UsernameFromId({ userId, supabase }: { userId: string; supabase: SupabaseClient<Database> }) {
	const { data } = getUsername(supabase, userId);
	return <>{data?.full_name || ""}</>;
}

export function WeekCalendar({ reservations, supabase }: WeekCalendarProps) {
	const [currentWeekStart, setCurrentWeekStart] = useState(() => {
		const today = new Date();
		const dayOfWeek = today.getDay();
		const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Make Monday the first day
		const monday = new Date(today);
		monday.setDate(today.getDate() + mondayOffset);
		monday.setHours(0, 0, 0, 0);
		return monday;
	});

	const [selectedReservation, setSelectedReservation] = useState<EnrichedReservation | null>(null);

	const weekDays = useMemo(() => {
		const days = [];
		for (let i = 0; i < 7; i++) {
			const day = new Date(currentWeekStart);
			day.setDate(currentWeekStart.getDate() + i);
			days.push(day);
		}
		return days;
	}, [currentWeekStart]);

	const weeklyReservations = useMemo(() => {
		const weekEnd = new Date(currentWeekStart);
		weekEnd.setDate(currentWeekStart.getDate() + 7);

		return reservations.filter((reservation) => {
			const reservationDate = new Date(reservation.date_time);
			return reservationDate >= currentWeekStart && reservationDate < weekEnd;
		});
	}, [reservations, currentWeekStart]);

	const getReservationsForDay = (day: Date) => {
		return weeklyReservations.filter((reservation) => {
			const reservationDate = new Date(reservation.date_time);
			return (
				reservationDate.getDate() === day.getDate() &&
				reservationDate.getMonth() === day.getMonth() &&
				reservationDate.getFullYear() === day.getFullYear()
			);
		});
	};

	const navigateWeek = (direction: "prev" | "next") => {
		const newWeekStart = new Date(currentWeekStart);
		newWeekStart.setDate(currentWeekStart.getDate() + (direction === "next" ? 7 : -7));
		setCurrentWeekStart(newWeekStart);
	};

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
		if (!minutes) return minutes;
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

	const getWeekRange = () => {
		const weekEnd = new Date(currentWeekStart);
		weekEnd.setDate(currentWeekStart.getDate() + 6);

		const startMonth = currentWeekStart.toLocaleDateString("es-ES", { month: "long" });
		const endMonth = weekEnd.toLocaleDateString("es-ES", { month: "long" });
		const year = currentWeekStart.getFullYear();

		if (startMonth === endMonth) {
			return `${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} ${year}`;
		} else {
			return `${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} - ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)} ${year}`;
		}
	};

	const handleReservationClick = (enrichedReservation: EnrichedReservation) => {
		setSelectedReservation(enrichedReservation);
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-2xl font-bold">Calendario de Reservas</CardTitle>
					<div className="flex items-center gap-4">
						<span className="text-lg font-medium text-muted-foreground">{getWeekRange()}</span>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-7 gap-2">
					{weekDays.map((day, index) => {
						const dayReservations = getReservationsForDay(day);
						const isToday = new Date().toDateString() === day.toDateString();

						return (
							<div
								key={index}
								className={`min-h-[200px] rounded-lg border p-3 ${
									isToday ? "border-blue-200 bg-blue-50" : "bg-gray-50"
								}`}
							>
								<div className="mb-2 text-center">
									<div className="text-sm font-medium text-muted-foreground">
										{day.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase()}
									</div>
									<div className={`text-lg font-bold ${isToday ? "text-blue-600" : ""}`}>
										{day.getDate()}
									</div>
								</div>

								<div className="space-y-2">
									{dayReservations.map((reservation, reservationIndex) => (
										<ReservationSlot
											key={reservationIndex}
											reservation={reservation}
											supabase={supabase}
											onReservationClick={handleReservationClick}
										/>
									))}

									{dayReservations.length === 0 && (
										<div className="py-4 text-center text-xs text-muted-foreground">
											Sin reservas
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>

				{weeklyReservations.length === 0 && (
					<div className="py-8 text-center text-muted-foreground">No hay reservas para esta semana</div>
				)}
			</CardContent>

			<Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold">{selectedReservation?.event_name}</DialogTitle>
					</DialogHeader>

					{selectedReservation && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium text-muted-foreground">Fecha:</span>
									<p>
										{new Date(selectedReservation.date_time)
											.toLocaleDateString("es-ES", {
												weekday: "long",
												year: "numeric",
												month: "long",
												day: "numeric",
											})
											.replace(/^\b\w/g, (char) => char.toUpperCase())}
									</p>
								</div>
								<div>
									<span className="font-medium text-muted-foreground">Hora:</span>
									<p>{formatTime(selectedReservation.date_time)}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium text-muted-foreground">Duración:</span>
									{selectedReservation.slot_duration && (
										<p>{formatDuration(selectedReservation.slot_duration)}</p>
									)}
								</div>
								{selectedReservation.sport && (
									<div className="flex items-center gap-2">
										<Trophy className="h-4 w-4 text-muted-foreground" />
										<div>
											<span className="font-medium text-muted-foreground">Deporte:</span>
											<p>{selectedReservation.sport}</p>
										</div>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium text-muted-foreground">Propietario:</span>
								</div>
								<div className="pl-6">
									<p className="text-sm">{selectedReservation.owner_name}</p>
								</div>
							</div>

							{selectedReservation.team_members && selectedReservation.team_members.length > 0 && (
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Users className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium text-muted-foreground">Miembros del equipo:</span>
									</div>
									<div className="pl-6">
										<ul className="space-y-1">
											{selectedReservation.team_members.map((member, index) => (
												<li key={index} className="text-sm">
													<UsernameFromId userId={member} supabase={supabase} />
												</li>
											))}
										</ul>
									</div>
								</div>
							)}

							<div className="flex items-center gap-2 rounded-lg border p-3">
								<CreditCard className="h-4 w-4" />
								<div className="flex-1">
									<span className="font-medium text-muted-foreground">Estado del pago:</span>
									<p
										className={`font-medium ${
											selectedReservation.payment_status === "confirmed"
												? "text-blue-600"
												: "text-orange-600"
										}`}
									>
										{selectedReservation.payment_status === "confirmed"
											? "Confirmado"
											: "Pendiente de pago"}
									</p>
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</Card>
	);
}
