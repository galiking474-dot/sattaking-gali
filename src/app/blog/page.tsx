import type { Metadata } from "next";
import Link from "next/link";
import { FiCalendar, FiClock, FiArrowRight } from "react-icons/fi";
import { getAllPosts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Satta King Blog — Guides, History & Chart Information",
  description:
    "Read guides on Satta King results, today satta result updates, chart history and safe tips. Stay informed with organized daily records and market information.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a5f] text-center mb-2">
        Satta King Blog
      </h1>
      <p className="text-center text-gray-600 text-sm md:text-base mb-8 max-w-2xl mx-auto">
        Guides, result history and chart information to help you understand
        today satta result records and stay informed every day.
      </p>

      <div className="grid gap-5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 hover:shadow-md hover:border-[#e63946]/40 transition-all"
          >
            <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-[#e63946] bg-[#e63946]/10 px-2.5 py-1 rounded-full mb-3">
              {post.category}
            </span>

            <h2 className="text-lg md:text-xl font-bold text-[#1e3a5f] leading-snug group-hover:text-[#e63946] transition-colors">
              {post.title}
            </h2>

            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <FiCalendar size={13} />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <FiClock size={13} />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1 ml-auto font-semibold text-[#e63946]">
                Read more
                <FiArrowRight
                  size={13}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
