import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { ProfilePictureCard } from "~/components/profile-picture";
import { Button } from "~/components/ui/button";
import { authenticateUser } from "~/lib/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	// NOTE: This is a temporary solution to get the user's language preference
	// until we have a proper localization system in place.
	// This is here to display the TOS/PP Links in English for Google's OAuth verification process.
	// Otherwise, the links will be in Spanish.
	const useSpanish = request.headers.get("Accept-Language")?.includes("es");
	return { ...(await authenticateUser(request)), useSpanish };
};

type MenuBarLinks = (
	| {
			name: string;
			href: string;
			description: string;
			content?: undefined;
	  }
	| {
			name: string;
			content: {
				name: string;
				href: string;
				description: string;
			}[];
			href?: undefined;
			description?: undefined;
	  }
)[];

export default function CanchasLayout({ children }: { children: React.ReactNode }) {
	const { avatar_url, full_name, useSpanish } = useLoaderData<typeof loader>();

	const MenuBarLinks = [
		{ name: "Tus canchas", href: "/canchas", description: "Mira y administra tus canchas" },
		{
			name: "Agregar nueva cancha",
			href: "/canchas/nueva",
			description: "Publica mas canchas y alcanza mas usuarios!",
		},
		{
			name: useSpanish ? "Legales" : "Privacy Policy & Terms of Service",
			content: [
				{
					name: useSpanish ? "Politica de Privacidad" : "Privacy Policy",
					href: "/privacy",
					description: useSpanish ? "Politica de privacidad de MatchPoint" : "Matchpoint Privacy Policy",
				},
				{
					name: useSpanish ? "Terminos de uso" : "Terms of Service",
					href: "/tos",
					description: useSpanish ? "Terminos de uso de MatchPoint" : "Matchpoint Terms of Service",
				},
			],
		},
	];

	return (
		<div className="absolute left-0 top-0 flex h-screen min-h-screen w-full flex-col overflow-y-scroll">
			<div className="sticky left-0 right-0 top-0 isolate z-10 flex items-center justify-between bg-[#f2f4f3] px-6 py-3 shadow-md">
				<ul className="flex flex-row items-center gap-4">
					<Link to="/">
						<img src="/matchpoint-logo.png" className="h-[45px] w-auto" />
					</Link>
					<NavigationMenu>
						<NavigationMenuListDesktop MenuBarLinks={MenuBarLinks} />
						<NavigationMenuListMobile MenuBarLinks={MenuBarLinks} />
					</NavigationMenu>
				</ul>
				<div>
					<ProfilePictureCard str={avatar_url} name={full_name} />
				</div>
			</div>
			<main className="relative min-h-full w-full">
				<Outlet />
			</main>
		</div>
	);
}

export function NavigationMenuListDesktop({ MenuBarLinks }: { MenuBarLinks: MenuBarLinks }) {
	return (
		<NavigationMenuList className="relative hidden lg:flex">
			{MenuBarLinks.map((link, index) => {
				return link.content ? (
					<NavigationMenuItem key={link.name}>
						<NavigationMenuTrigger className="!bg-[#223222] !text-white hover:brightness-150">
							{link.name}
						</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
								{link.content.map((subLink, subIndex) => (
									<li key={subIndex}>
										<NavigationMenuLink className="p-2 px-4 !text-white" asChild>
											<Link
												className="block select-none space-y-1 rounded-md !bg-[#223222] p-3 leading-none no-underline outline-none transition-colors hover:text-accent-foreground hover:brightness-150 focus:text-accent-foreground"
												to={subLink.href}
											>
												<div className="mb-2 text-sm font-medium leading-none text-background">
													{subLink.name}
												</div>
												<p className="text-sm leading-snug text-white/80">
													{subLink.description}
												</p>
											</Link>
										</NavigationMenuLink>
									</li>
								))}
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
				) : (
					<li key={link.name}>
						<NavigationMenuLink className="px-4 !text-white" asChild>
							<Link
								to={link.href}
								className="m-0 inline-flex h-9 select-none items-center justify-center rounded-md !bg-[#223222] p-0 !text-white no-underline outline-none transition-colors hover:text-accent-foreground hover:brightness-150 focus:text-accent-foreground"
							>
								<div className="text-nowrap text-sm font-medium leading-none text-background">
									{link.name}
								</div>
							</Link>
						</NavigationMenuLink>
					</li>
				);
			})}
		</NavigationMenuList>
	);
}

export function NavigationMenuListMobile({ MenuBarLinks }: { MenuBarLinks: MenuBarLinks }) {
	return (
		<NavigationMenuList className="relative lg:hidden">
			<NavigationMenuItem>
				<NavigationMenuTrigger className="h-full !bg-[#223222] !text-white hover:brightness-150">
					Menu
				</NavigationMenuTrigger>
				<NavigationMenuContent>
					<ul className="grid max-h-[60vh] w-[300px] gap-3 overflow-y-auto p-4 md:w-[500px] md:grid-cols-2">
						{MenuBarLinks.map((link, index) => {
							return link.content ? (
								[
									<hr key={`hr-menu-separator-${link.href}`} className="col-span-full" />,
									...link.content.map((subLink, subIndex) => {
										return (
											<li key={subIndex} className="h-full w-full">
												<NavigationMenuLink className="p-2 px-4 !text-white" asChild>
													<Link
														to={subLink.href}
														className="block h-full select-none space-y-1 rounded-md !bg-[#223222] p-3 leading-none no-underline outline-none transition-colors hover:text-accent-foreground hover:brightness-150 focus:text-accent-foreground"
													>
														<div className="mb-2 text-sm font-medium leading-none text-background">
															{subLink.name}
														</div>
														<p className="text-sm leading-snug text-white/80">
															{subLink.description}
														</p>
													</Link>
												</NavigationMenuLink>
											</li>
										);
									}),
								]
							) : (
								<li key={link.name} className="h-full w-full">
									<NavigationMenuLink className="p-2 px-4 !text-white" asChild>
										<Link
											to={link.href}
											className="block h-full select-none space-y-1 rounded-md !bg-[#223222] p-3 leading-none no-underline outline-none transition-colors hover:text-accent-foreground hover:brightness-150 focus:text-accent-foreground"
										>
											<div className="mb-2 text-sm font-medium leading-none text-background">
												{link.name}
											</div>
											<p className="text-sm leading-snug text-white/80">{link.description}</p>
										</Link>
									</NavigationMenuLink>
								</li>
							);
						})}
					</ul>
				</NavigationMenuContent>
			</NavigationMenuItem>
		</NavigationMenuList>
	);
}
