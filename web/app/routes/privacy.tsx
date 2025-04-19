import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
	return [{ title: "Privacy Policy" }, { name: "description", content: "Privacy Policy" }];
};

export default function PrivacyPolicy() {
	return (
		<main className="mx-auto max-w-3xl p-6 text-base leading-relaxed">
			<h1 className="mb-4 text-2xl font-bold">Privacy Policy</h1>
			<p>Effective Date: April 4, 2025</p>

			<section className="mt-6">
				<p>We care about your privacy. This is a basic overview of what we collect and how it's used:</p>

				<ul className="mt-4 list-inside list-disc space-y-2">
					<li>We collect only the data we need to provide the service.</li>
					<li>This may include your full name, email, and profile picture.</li>
					<li>
						When signing in with Google, we may access your Google account's basic profile information, such
						as your full name and email address. This information is used solely to personalize your
						experience and manage your account.
					</li>
					<li>
						We do not access, use, store, or share any private Google user data, such as Google Drive files,
						calendar events, or Gmail content. Only non-private information (your name and email address) is
						stored securely for identification purposes.
					</li>
					<li>
						Payment details are handled by third-party processors. We do not store your credit card
						information.
					</li>
					<li>
						We may share your data with trusted third parties to:
						<ul className="ml-6 mt-2 list-inside list-disc space-y-1">
							<li>Authenticate your account</li>
							<li>Process payments</li>
							<li>Deliver goods or services you request</li>
						</ul>
					</li>
					<li>We do not sell your data.</li>
					<li>
						We may use cookies or similar tools to improve your experience and understand how the service is
						used.
					</li>
					<li>
						You can contact us anytime to ask what data we have about you or to request its deletion at
						tpietravallo@itba.edu.ar.
					</li>
					<li>
						This policy may be updated from time to time. If you keep using the service, that means you
						agree to the updated version.
					</li>
				</ul>

				<p className="mt-6">If you have any questions, feel free to reach out.</p>
			</section>
		</main>
	);
}
