import { Link, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

export default function Index() {
	const navigator = useNavigate();
	const [timer, setTimer] = useState(10);

	useEffect(() => {
		function tick() {
			setTimer((prev) => {
				if (prev <= 1) {
					navigator("/canchas");
					return 0;
				}
				return prev - 1;
			});
		}

		const interval = setInterval(tick, 1000);
		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<div className="flex h-screen flex-col items-center justify-center bg-green-400">
			<h1 className="text-4xl font-bold">Mercado Pago Autorizado</h1>
			<p className="text-2xl font-semibold">Autorizacion completada</p>
			<Link to={"/canchas"} className="m-4 rounded border border-black p-2 px-4 shadow-sm hover:brightness-150">
				Regresa a tus canchas
			</Link>
			<p className="mt-10">Seras redirigido automaticamente en {timer} segundos</p>
		</div>
	);
}
