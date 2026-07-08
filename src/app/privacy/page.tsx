import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Satta Result website.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a5f] text-center mb-8">
        Privacy Policy
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed text-sm">
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">1. Information We Collect</h2>
          <p>
            We may collect personal information that you voluntarily provide when
            using our services, including your name, email address, phone number
            (via the contact form), and device information for push notifications.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To provide and maintain our service</li>
            <li>To send push notifications about result updates</li>
            <li>To respond to your contact inquiries</li>
            <li>To improve our website and user experience</li>
            <li>To display relevant advertisements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">3. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on
            our website and hold certain information. You can instruct your
            browser to refuse all cookies or to indicate when a cookie is being
            sent.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">4. Third-Party Services</h2>
          <p>
            We may use third-party services such as Google Analytics and
            advertising networks that collect, monitor, and analyze usage data.
            These third parties have their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">5. Data Security</h2>
          <p>
            The security of your data is important to us. We use commercially
            acceptable means to protect your personal information, but no method
            of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900 mb-2">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us through our contact page or via WhatsApp.
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4 border-t border-gray-200">
          Last updated: May 2026
        </p>
      </div>
    </div>
  );
}
