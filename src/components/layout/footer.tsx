import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import {
  CAFE_NAME,
  CAFE_ADDRESS,
  CAFE_PHONE,
  CAFE_EMAIL,
  CAFE_HOURS,
} from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="mb-3">
            <Image
              src="/logo.svg"
              alt={CAFE_NAME}
              width={120}
              height={40}
              className="h-9 w-auto brightness-0 invert"
            />
          </div>
          <p className="text-sm leading-relaxed text-stone-400">
            Bhaktapur&apos;s favourite breakfast & brunch spot — artisan coffee,
            fresh morning plates, and good vibes every day.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Visit Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              {CAFE_ADDRESS}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-amber-500 shrink-0" />
              <a href={`tel:${CAFE_PHONE}`} className="hover:text-white transition-colors">
                {CAFE_PHONE}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-500 shrink-0" />
              <a href={`mailto:${CAFE_EMAIL}`} className="hover:text-white transition-colors">
                {CAFE_EMAIL}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Hours</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              {CAFE_HOURS.weekdays}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              {CAFE_HOURS.weekends}
            </li>
          </ul>
          <div className="mt-6 flex gap-3">
            <Link href="/menu" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
              Menu
            </Link>
            <Link href="/about" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
              About
            </Link>
            <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-400 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-stone-800 text-center text-xs text-stone-500 py-4 px-4">
        © {new Date().getFullYear()} {CAFE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
