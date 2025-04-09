import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { authenticateUser } from "~/lib/auth.server";

const MenuBarLinks = [
    { name: 'Tus canchas', href: '/canchas' },
    { name: 'Agregar nueva cancha', href: '/canchas/nueva' },
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
    return await authenticateUser(request);
}

export default function CanchasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { avatar_url } = useLoaderData<typeof loader>();
    return (
        <div>
            <nav className="fixed top-0 left-0 right-0 bg-white shadow-md px-6 py-3 flex justify-between items-center z-10">
                <ul className="flex gap-4 flex-row items-center">
                    <div className="font-bold p-1 px-2 mx-2 outline rounded"><img src="/matchpoint-logo.png" className="w-[100px] h-[45px]"/></div> {/* @todo Reemplazar por logo */}
                    {
                        MenuBarLinks.map((link) => {
                            return <li key={link.name}>
                                <Link to={link.href}><Button className="bg-[#223332]">{link.name}</Button></Link>
                            </li>
                        })
                    }
                </ul>
                <div>
                    <Button variant={"outline"} className="h-fit">Perfil <ProfilePictureAvatar str={avatar_url}/></Button>
                </div>
            </nav>
            <main className="pt-[83px]">
                <Outlet/>
            </main>
        </div>
    )
}

export function ProfilePictureAvatar({ str }: { str?: string | null } = { str: null }) {
    return <div className="flex items-center justify-center aspect-square w-10 rounded-full overflow-hidden">
    {
        str ?
        <img 
            src={str}
            alt="Profile"
            className="w-full h-full object-cover"
        />
        :
        <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white">
            {'U'}
        </div>
    }
    </div>
}
