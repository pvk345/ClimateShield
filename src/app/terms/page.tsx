export default function TermsPage() {
  return (
    <div className="flex flex-col items-center bg-black min-h-screen px-6 py-16">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <h1 className="text-3xl font-semibold text-zinc-50">Terms of Service</h1>
        <p className="text-xs text-zinc-500">Last updated: June 2026</p>

        <div className="flex flex-col gap-6 text-sm text-zinc-400 leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">1. Acceptance of Terms</h2>
            <p>By accessing or using ClimateShield, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">2. Description of Service</h2>
            <p>ClimateShield provides climate risk information for US properties including wildfire and flood risk scores. All data is provided for informational purposes only and does not constitute professional insurance, real estate, or financial advice.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">3. Data Accuracy</h2>
            <p>Risk scores are based on county-level data from FEMA, USFS, and other government sources. ClimateShield makes no guarantees about the accuracy, completeness, or timeliness of the information provided. Scores should not be the sole basis for any financial or real estate decision.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">4. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">5. Limitation of Liability</h2>
            <p>ClimateShield is not liable for any damages arising from your use of or inability to use the service, including any decisions made based on risk scores provided.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">6. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-semibold text-zinc-200">7. Contact</h2>
            <p>For questions about these terms, please contact us through the app.</p>
          </section>
        </div>
      </main>
    </div>
  );
}