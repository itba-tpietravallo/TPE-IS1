import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
	return [{ title: "Terms of Service" }, { name: "description", content: "Terms of Service" }];
};

export default function TermsOfService() {
	return (
		<main className="mx-auto max-w-3xl p-6 text-base leading-relaxed">
			<h1 className="mb-4 text-2xl font-bold">Terms of Service</h1>
			<p>Effective Date: April 4, 2025</p>

			<section className="mt-6">
				<p>By using this service, you agree to the following simple terms:</p>

				<ul className="mt-4 list-inside list-disc space-y-2">
					<li>
						You are free to use this service as-is. Certain features or products may only be available for
						purchase.
					</li>
					<li>We do not provide any warranty or guarantee.</li>
					<li>
						We retain all rights to refuse service, deny sign-ups, or cancel user accounts at any time, for
						any reason.
					</li>
					<li>We are not responsible for any damages or losses resulting from using this service.</li>
					<li>
						All payments are handled by third-party payment processors (MercadoPago, Stripe). They may
						collect your information in order to fullfill your transaction, and have their own independent
						terms of service and privacy policies.
					</li>
					<li>
						Your data may be shared with third parties for purposes such as authentication, processing
						payments, or delivering goods and services you have requested.
					</li>
					<li>
						These terms may change at any time. Continued use of the service means you accept the latest
						version.
					</li>
				</ul>

				<p className="mt-6">If you do not agree with these terms, please do not use the service.</p>
			</section>
		</main>
	);
}
