import type { MetaFunction } from "@remix-run/node";
import { Button } from "../components/ui/button";

export const meta: MetaFunction = () => {
	return [
		{ title: "New MatchPoint App" },
		{ name: "description", content: "Welcome to MatchPoint!" },
	];
};

export function ButtonDemo() {
	return <Button>Button</Button>;
}

export default function Index() {
	return (
		<div className="flex h-screen items-center justify-center bg-[#223332]">
			<div className="flex flex-col items-center gap-16">
				<header className="flex flex-col items-center gap-5">
					<div className="space-y-10">
						<div className="space-y-3">
							<h1 className="text-6xl lg:text-9xl text-center font-bold text-[#f18f01]">
								MatchPoint
							</h1>
							<h3 className="text-2xl lg:text-4xl text-center font-bold text-[#f18f01]/60">
								No te quedes sin jugar
							</h3>
						</div>
						<div className="space-x-9 text-center mt-1">
							<Button className="hover:bg-[#f18f01]/50" size={"xl"}>Encontrá tu equipo</Button>
							<Button className="hover:bg-[#f18f01]/50" size={"xl"}>Publicá tu cancha</Button>
						</div>
					</div>
				</header>
			</div>
		</div>
	);
}
