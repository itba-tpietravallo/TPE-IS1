import { useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";

export default function () {
	const navigate = useNavigate();

	return (
		<div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#223332] to-[#223f37] p-4">
			<h1 className="text-center text-6xl font-extrabold text-[#f18f01] lg:text-9xl p-4">Proximamente!</h1>
            <Button onClick={() => navigate("..")}>Volver</Button>
		</div>
	);
}
