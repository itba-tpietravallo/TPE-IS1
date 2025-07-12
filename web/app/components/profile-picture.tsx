import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import clsx from "clsx";

export function ProfilePictureAvatar(
	{ str, name, className }: { str?: string | null; name?: string | null; className?: string } = { str: null },
) {
	return (
		<Avatar className="h-10 w-10 overflow-hidden rounded-full border border-black object-cover shadow-md">
			<AvatarImage className="h-full w-full object-cover" src={str || undefined} alt="Profile picture" />
			<AvatarFallback className="flex h-full w-full items-center justify-center text-xs font-bold">
				{name
					?.split(" ")
					.slice(0, 2)
					.map((e) => e.charAt(0))
					.join("")}
			</AvatarFallback>
		</Avatar>
	);
}

export function ProfilePictureCard(
	{ str, name, className }: { str?: string | null; name?: string | null; className?: string } = { str: null },
) {
	return (
		<div className="flex flex-row items-center gap-2 md:rounded-lg md:border md:border-black md:bg-white md:p-2 md:px-4">
			<p className="hidden md:inline-block">Perfil</p>
			<ProfilePictureAvatar str={str} name={name} className={className} />
		</div>
	);
}
