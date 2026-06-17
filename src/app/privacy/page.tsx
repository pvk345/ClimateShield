export default function PrivacyPage() {
  return (
    <div className="flex flex-col items-center bg-black min-h-screen px-6 py-16">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <h1 className="text-3xl font-semibold text-zinc-50">Privacy Policy</h1>
        <p className="text-xs text-zinc-500">Last updated: June 2026</p>

        <div className="flex flex-col gap-6 text-sm text-zinc-400 leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">1. Information We Collect</h2>
            <p>We collect the following information when you use ClimateShield:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Email address (when you create an account)</li>
              <li>Addresses you search and save</li>
              <li>Usage data (pages visited, features used)</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Provide and improve the ClimateShield service</li>
              <li>Save your searched addresses to your account</li>
              <li>Send account-related emails (confirmation, password reset)</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">3. Data Storage</h2>
            <p>Your data is stored securely using Supabase, a SOC 2 compliant database provider. We do not sell your personal information to third parties.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">4. Third Party Services</h2>
            <p>ClimateShield uses the following third party services:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Supabase — database and authentication</li>
              <li>AWS Lambda — ML scoring service</li>
              <li>Vercel — hosting</li>
              <li>US Census Geocoder — address lookup</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">5. Your Rights</h2>
            <p>You can delete your account and all associated data at any time by contacting us. You can also remove saved addresses from your dashboard at any time.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">6. Cookies</h2>
            <p>We use cookies only for authentication purposes to keep you signed in. We do not use tracking or advertising cookies.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">7. Contact</h2>
            <p>For privacy-related questions or to request deletion of your data, please contact us through the app.</p>
          </section>
        </div>
      </main>
    </div>
  );
}