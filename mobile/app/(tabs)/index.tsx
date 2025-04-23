import TeamsFeed from "./teamsFeed";

export default function Index() {
	return <TeamsFeed />;
}

/*import CanchasFeed from "./canchas";
import { Text } from "react-native";
import TeamDetail from "./teamDetail";

export default function Index(){
  return <CanchasFeed/>
}*/

//Esto es para ver la data de un equipo (cuando esten los equipos en la db saco esto)
// export default function Index() {
//   return <TeamDetail name={name} sport={sport} description={description} players={players} />;
// }

const name = "MatchPoint team";
const sport = "Futbol";
const description = "El equipo mas grande";
const players = [
	{
		id: "1",
		name: "Feli B",
		number: 11,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
	{
		id: "2",
		name: "Tomi P",
		number: 10,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
	{
		id: "3",
		name: "Maxi W",
		number: 7,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
	{
		id: "4",
		name: "Lola DV",
		number: 8,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
	{
		id: "5",
		name: "Lu O",
		number: 9,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
	{
		id: "6",
		name: "Jose M",
		number: 6,
		photo: "https://cdn-icons-png.flaticon.com/512/1144/1144760.png",
	},
];
