"use client";

import { useState, FormEvent } from "react";
import { submitContactMessage } from "@/lib/firestore";
import { getWhatsAppLink } from "@/lib/utils";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "911234567890";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error("Name and message are required");
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim(),
      });
      toast.success("Message sent successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a5f] text-center mb-2">
        Contact Us
      </h1>
      <p className="text-center text-gray-500 mb-8">
        Have a question? Reach out to us via the form below or WhatsApp.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1e3a5f] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#2a5080] transition-colors disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* WhatsApp & Info */}
        <div className="space-y-6">
          <div className="bg-green-50 rounded-xl border border-green-200 p-6 text-center">
            <FaWhatsapp className="mx-auto text-green-600 mb-3" size={48} />
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Chat on WhatsApp
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Get instant replies on WhatsApp. We&apos;re available 24/7.
            </p>
            <a
              href={getWhatsAppLink(whatsappNumber, "GALI KING")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors"
            >
              Start Chat
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Quick Info</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>Response Time:</strong> We typically respond within 1 hour.
              </p>
              <p>
                <strong>Support Hours:</strong> 24/7 available on WhatsApp.
              </p>
              <p>
                <strong>Email:</strong> support@sattaresult.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
