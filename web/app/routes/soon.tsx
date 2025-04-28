import { useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export default function () {
	const navigate = useNavigate();

	return (
		<div className="flex h-screen flex-col items-center justify-center bg-gradient-to-r from-[#223332] to-[#223f37] p-4">
			<h1 className="p-4 text-center text-6xl font-extrabold text-[#f18f01] lg:text-9xl">Próximamente!</h1>
			<Button onClick={() => navigate("..")}>Volver</Button>
		</div>
	);
}
