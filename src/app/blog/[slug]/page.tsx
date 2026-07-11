import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiCalendar, FiClock, FiChevronLeft } from "react-icons/fi";
import { getAllPosts, getPostBySlug, type BlogBlock } from "@/lib/blog-data";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Blog Not Found" };
  }

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: `https://www.todaysattaresults.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="text-lg md:text-xl font-bold text-[#1e3a5f] mt-8 mb-3">
          {block.text}
        </h2>
      );
    case "paragraph":
      return <p className="mb-4">{block.text}</p>;
    case "list":
      return (
        <ul className="list-disc list-inside space-y-1.5 mb-4 marker:text-[#e63946]">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "faq":
      return (
        <div className="space-y-3 mb-4">
          {block.items.map((item, i) => (
            <div
              key={i}
              className="bg-[#f0f4f8] rounded-lg border border-gray-200 p-4"
            >
              <h3 className="font-bold text-gray-900 mb-1">{item.q}</h3>
              <p className="text-sm text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      );
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm font-semibold text-[#e63946] hover:underline mb-5"
      >
        <FiChevronLeft size={16} />
        Back to Blog
      </Link>

      <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-[#e63946] bg-[#e63946]/10 px-2.5 py-1 rounded-full mb-4">
          {post.category}
        </span>

        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e3a5f] leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pb-5 mb-5 border-b border-gray-200">
          <span className="flex items-center gap-1.5">
            <FiCalendar size={13} />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <FiClock size={13} />
            {post.readTime}
          </span>
        </div>

        <div className="text-gray-700 leading-relaxed">
          {post.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-[#e63946] text-white text-sm font-semibold hover:bg-[#c62d3a] transition-colors"
          >
            Today Satta Result
          </Link>
          <Link
            href="/charts"
            className="px-4 py-2 rounded-lg bg-[#0d1b2a] text-white text-sm font-semibold hover:bg-[#1b2d45] transition-colors"
          >
            View Chart Records
          </Link>
        </div>
      </article>
    </div>
  );
}
