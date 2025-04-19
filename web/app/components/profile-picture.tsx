import clsx from "clsx";

export function ProfilePictureAvatar(
	{ str, name, className }: { str?: string | null; name?: string | null; className?: string } = { str: null },
) {
	return (
		<div className={clsx("h-10 w-10 overflow-hidden rounded-full border border-black", className)}>
			{str ? (
				<img src={str} alt="Profile" className="h-full w-full object-cover" />
			) : (
				<div className="flex h-full w-full items-center justify-center bg-gray-200">
					<span className="text-sm text-gray-500">{name?.charAt(0).toUpperCase()}</span>
				</div>
			)}
		</div>
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
