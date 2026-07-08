import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Satta Result - your trusted source for live daily results and chart records.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a5f] text-center mb-8">
        About Us
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">Who We Are</h2>
          <p>
            Satta Result is a trusted online platform that provides accurate and
            timely daily results for popular games including Gali, Desawar,
            Ghaziabad, Faridabad, and many more. We are committed to delivering
            the fastest and most reliable result updates.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">Our Mission</h2>
          <p>
            Our mission is to provide a single, reliable destination where users
            can access live results, historical chart records, and game
            information. We strive for accuracy, speed, and a seamless user
            experience across all devices.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">What We Offer</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Real-time live result updates</li>
            <li>Historical chart records with search functionality</li>
            <li>Push notifications for instant alerts</li>
            <li>Mobile-friendly responsive design</li>
            <li>24/7 customer support via WhatsApp</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#1e3a5f] mb-2">Disclaimer</h2>
          <p className="text-sm text-gray-500">
            This website is for informational and entertainment purposes only. We
            do not encourage or promote any illegal activities. Please check your
            local laws before using this website. Users are responsible for their
            own actions.
          </p>
        </section>
      </div>
    </div>
  );
}
