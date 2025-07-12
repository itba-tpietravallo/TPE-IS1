import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useMemo, useState } from "react";
import { Card, CardTitle, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { authenticateUser } from "~/lib/auth.server";
import { CreditCard, Mail, Phone, User, CalendarDays } from "lucide-react";
import { getUserLinkedToPaymentMethod } from "@lib/autogen/queries";
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@lib/autogen/database.types";

type Field = {
	avatar_url: string;
	city: string;
	description: string;
	id: string;
	images: string[];
	location: {
		type: string;
		coordinates: number[];
	};
	name: string;
	neighborhood: string;
	owner: string;
	sports: string[];
	street: string;
	street_number: string;
};

type ProfileInfoProps = {
	email?: string;
	userName?: string;
	phone?: string;
	url_origin?: string;
	isLinked?: boolean;
};

type ReservsProps = {
	date: string;
	fieldName: string;
	reservator: string;
};

type ReservsListProps = {
	reservs: ReservsProps[] | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
	const env = {
		SUPABASE_URL:
			process.env.VERCEL_ENV === "production" ? process.env.PROD_SUPABASE_URL! : process.env.DEV_SUPABASE_URL!,
		SUPABASE_ANON_KEY:
			process.env.VERCEL_ENV === "production"
				? process.env.PROD_SUPABASE_ANON_KEY!
				: process.env.DEV_SUPABASE_ANON_KEY!,
	};

	return { ...(await authenticateUser(request)), env, URL_ORIGIN: new URL(request.url).origin };
}

export default function Index() {
	const { user, avatar_url, email, phone, full_name, env, URL_ORIGIN } = useLoaderData<typeof loader>();
	const supabase = createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
	const data = getUserLinkedToPaymentMethod(supabase, user.id!, { enabled: !!user.id });

	return (
		<>
			<Card className="m-16">
				<CardContent className="pt-6">
					<div className="flex flex-col items-center gap-6 md:flex-row">
						<Avatar className="h-24 w-24 border-4 border-white shadow-md">
							<AvatarImage src={avatar_url || undefined} alt="Profile picture" />
							<AvatarFallback>
								{full_name
									?.split(" ")
									.slice(0, 2)
									.map((e) => e.charAt(0))
									.join("")}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 text-center md:text-left">
							<h1 className="text-2xl font-bold">{full_name}</h1>
							<div className="text-muted-foreground">
								<Badge variant="outline" className="mt-1">
									<CalendarDays className="mr-1 h-3 w-3" />
									Miembro desde{" "}
									{new Date(user?.created_at).toLocaleDateString("es-AR", {
										day: "2-digit",
										month: "2-digit",
										year: "numeric",
									})}
								</Badge>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<ProfileInfo
				email={email ?? undefined}
				userName={full_name ?? undefined}
				phone={phone ?? undefined}
				url_origin={URL_ORIGIN ?? undefined}
				isLinked={!!data.data?.user_id}
			/>

			{/* RIP imprimir Reservas */}

			{/* <div className="m-16">
				<div>
					<Card className="h-fit min-h-fit w-full">
						<CardHeader className="w-full text-left">
							<h2 className="text-2xl font-bold">Reservas</h2>
						</CardHeader>
						<CardContent>
							<ReservsList reservs={reservs} />
						</CardContent>
					</Card>
				</div>
			</div> */}
		</>
	);
}

export function ReservsList({ reservs }: ReservsListProps) {
	return (
		<div className="p-4">
			<h2 className="mb-4 text-xl font-semibold">Reservations</h2>
			<ul className="space-y-4">
				{reservs?.map((reservation, index) => (
					<li key={index} className="rounded-lg border p-4 shadow-sm">
						<p>
							<strong>Date:</strong>{" "}
							{new Date(reservation.date).toLocaleString("es-AR", {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
							})}
						</p>
						<p>
							<strong>Field:</strong> {reservation.fieldName}
						</p>
						<p>
							<strong>User:</strong> {reservation.reservator}
						</p>
					</li>
				))}
			</ul>
		</div>
	);
}

export function ProfileInfo({ email, userName, phone, url_origin, isLinked }: ProfileInfoProps) {
	const [phoneSaved, setPhoneSaved] = useState(phone ?? "");
	const [phoneInput, setPhoneInput] = useState("");

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPhoneInput(e.target.value);
	};

	const handleSave = () => {
		setPhoneSaved(phoneInput);
		setPhoneInput("");
	};

	const handleCancel = () => {
		setPhoneInput("");
	};

	const phoneDisplayed = phoneInput !== "" ? phoneInput : phoneSaved;

	return (
		<Card className="mb-6 ml-16 mr-16 mt-16">
			<CardHeader>
				<CardTitle>Información de tu cuenta</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<Label htmlFor="email">Email</Label>
							</div>
							<Input id="email" value={email ?? ""} readOnly />
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4 text-muted-foreground" />
								<Label htmlFor="username">Nombre de usuario</Label>
							</div>
							<Input id="username" value={userName || "(no vinculado)"} readOnly />
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Phone className="h-4 w-4 text-muted-foreground" />
								<Label htmlFor="phone">Teléfono</Label>
							</div>
							<Input
								id="phone"
								placeholder="Agregar número de teléfono"
								value={phoneDisplayed}
								onChange={handlePhoneChange}
							/>
							{!phoneSaved && phoneInput === "" && (
								<p className="text-sm text-muted-foreground">(no vinculado)</p>
							)}
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<CreditCard className="h-4 w-4 text-muted-foreground" />
								<Label htmlFor="payment">Método de cobro</Label>
							</div>
							<div className="flex gap-2">
								{isLinked ? (
									<div className="group relative flex w-full items-center justify-center gap-2 rounded-md border border-green-200 bg-green-50 p-2 text-green-700">
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-sm font-medium">Mercado Pago vinculado</span>
										<button className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-green-600 hover:bg-green-100 hover:text-red-600">
											<svg
												className="h-3 w-3"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
											<span className="absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
												Desvincular
											</span>
										</button>
									</div>
								) : (
									<Link
										className="w-full"
										to={`${new URL("/api/v1/payments/oauth/mercadopago", url_origin)}`}
									>
										<Button variant="outline" className="w-full">
											<CreditCard className="mr-2 h-4 w-full" />
											Vincular a Mercado Pago
										</Button>
									</Link>
								)}
							</div>
						</div>
					</div>
				</div>
			</CardContent>

			{phoneInput && (
				<CardFooter className="flex justify-between border-t pt-6">
					<Button variant="outline" onClick={handleCancel}>
						Cancelar
					</Button>
					<Button onClick={handleSave}>Guardar cambios</Button>
				</CardFooter>
			)}
		</Card>
	);
}
