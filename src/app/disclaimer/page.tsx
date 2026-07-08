import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer for Satta Result website.",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a5f] text-center mb-8">
        Disclaimer
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed text-sm">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">General Disclaimer</h2>
          <p>
            The information provided on this website is for general informational
            and entertainment purposes only. All information on the site is
            provided in good faith. However, we make no representation or warranty
            of any kind, express or implied, regarding the accuracy, adequacy,
            validity, reliability, availability, or completeness of any
            information on the site.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">No Encouragement</h2>
          <p>
            This website does not encourage or promote any form of illegal
            gambling or betting. We are purely an informational portal that
            displays publicly available results. Users are advised to check their
            local laws and regulations before engaging in any activities.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">User Responsibility</h2>
          <p>
            Users access this website at their own risk. We shall not be held
            responsible for any losses, damages, or legal issues arising from the
            use of information provided on this website. Users are solely
            responsible for their own actions and decisions.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">External Links</h2>
          <p>
            This website may contain links to third-party websites. We have no
            control over the content, privacy policies, or practices of any
            third-party sites and assume no responsibility for them.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">Accuracy of Information</h2>
          <p>
            While we strive to provide accurate and up-to-date results, we cannot
            guarantee that all information is correct at all times. Results
            displayed are sourced from publicly available data and are provided
            as-is.
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4 border-t border-gray-200">
          By using this website, you acknowledge that you have read, understood,
          and agree to this disclaimer.
        </p>
      </div>
    </div>
  );
}
