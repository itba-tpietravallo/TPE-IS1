import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { IAdditionalCardFormData, IPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/payment/type";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticateUser } from "~/lib/auth.server";
import { User } from "@supabase/supabase-js";

export async function loader({ request }: LoaderFunctionArgs) {
	return await authenticateUser(request);
}

const initialization = {
	amount: 100,
	preferenceId: "449538966-a9f2d51a-c17d-4187-a611-114d57bf46b9",
};

const onError = async (error) => {
	console.log("onError", error);
};

const onReady = async () => {
	console.log("onReady");
};

const onSubmit = (user: User) => async (param: IPaymentFormData, param2?: IAdditionalCardFormData | null) => {
	console.log("onSubmit. @ user_id: ", user.id);

	const body = {
		amount: initialization.amount,
		email: param.formData.payer.email!,
		installments: (param.formData.installments || 1).toString(),
		token: param.formData.token.toString(),
		description: "Test payment",
		processor: "mercado-pago",
		userId: user.id.toString(),
		preferenceId: initialization.preferenceId.toString(),
	};

	const stringified = JSON.stringify(body);

	console.log("onSubmit. @ body: ", body);
	console.log("onSubmit. @ stringified: ", stringified);

	return await fetch("/api/v1/payments", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: stringified,
	})
		.then((response) => response.text())
		.then((response) => {
			console.log(response);
			// recibir el resultado del pago
		})
		.catch((error) => {
			console.log(error);
			// manejar la respuesta de error al intentar crear el pago
		});
};

export default function () {
	const { user } = useLoaderData<typeof loader>();

	useEffect(() => {
		initMercadoPago("APP_USR-75093873-9cea-4784-bae5-dd8058bddf71");

		console.log("initMercadoPago");

		return () => {
			window?.cardPaymentBrickController?.unmount();
		};
	}, []);

	return (
		<Payment
			initialization={initialization}
			customization={{
				paymentMethods: { maxInstallments: 1, minInstallments: 1, prepaidCard: "all", debitCard: "all" },
			}}
			onSubmit={onSubmit(user)}
			onReady={onReady}
			onError={onError}
		/>
	);
}
