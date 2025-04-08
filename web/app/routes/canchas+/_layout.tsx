import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Button, MyButton } from "~/components/ui/button";
import { authenticateUser } from "~/lib/auth.server";

const MenuBarLinks = [
	{ name: "Tus canchas", href: "/canchas" },
	{ name: "Agregar nueva cancha", href: "/canchas/nueva" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	return await authenticateUser(request);
};

export default function CanchasLayout({ children }: { children: React.ReactNode }) {
	const { avatar_url } = useLoaderData<typeof loader>();
	return (
		<div>
			<nav className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-white px-6 py-3 shadow-md">
				<ul className="flex flex-row items-center gap-4">
					<MyButton path="..">
						<img src="../matchpoint-logo.png" className="h-[45px] w-[100px]" />
					</MyButton>{" "}
					{MenuBarLinks.map((link) => {
						return (
							<li key={link.name}>
								<Link to={link.href}>
									<Button>{link.name}</Button>
								</Link>
							</li>
						);
					})}
				</ul>
				<div>
					<Button variant={"outline"} className="h-fit">
						Perfil <ProfilePictureAvatar str={avatar_url} />
					</Button>
				</div>
			</nav>
			<main className="pt-16">
				<Outlet />
			</main>
		</div>
	);
}

export function ProfilePictureAvatar({ str }: { str?: string | null } = { str: null }) {
	return (
		<div className="flex aspect-square w-10 items-center justify-center overflow-hidden rounded-full">
			{str ? (
				<img src={str} alt="Profile" className="h-full w-full object-cover" />
			) : (
				<div className="flex h-full w-full items-center justify-center bg-gray-400 text-white">{"U"}</div>
			)}
		</div>
	);
}
