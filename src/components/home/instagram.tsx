"use client";

import { Instagram } from "lucide-react";
import Script from "next/script";

const POSTS: string[] = [
  // Paste Instagram post URLs here, e.g.:
  // "https://www.instagram.com/p/XXXXXXXXX/",
];

export function InstagramFeed() {
  return (
    <section className="py-20 bg-stone-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-2">
            Follow Along
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            We&apos;re on Instagram
          </h2>
          <a
            href="https://www.instagram.com/antic.cafez/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors text-sm"
          >
            <Instagram className="h-4 w-4" />
            @antic.cafez
          </a>
        </div>

        {POSTS.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {POSTS.map((url) => (
                <blockquote
                  key={url}
                  className="instagram-media rounded-2xl overflow-hidden shadow-sm"
                  data-instgrm-permalink={url}
                  data-instgrm-version="14"
                  style={{ maxWidth: "100%", width: "100%" }}
                />
              ))}
            </div>
            <Script src="//www.instagram.com/embed.js" strategy="lazyOnload" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <a
              href="https://www.instagram.com/antic.cafez/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-800 text-white font-semibold hover:opacity-90 transition-opacity text-lg shadow-md"
            >
              <Instagram className="h-5 w-5" />
              Visit us on Instagram
            </a>
            <p className="text-stone-400 text-sm">See our latest food, coffee &amp; vibes</p>
          </div>
        )}
      </div>
    </section>
  );
}
