import { MapPin, Phone, Clock } from "lucide-react";
import { CAFE_ADDRESS, CAFE_PHONE, CAFE_HOURS } from "@/lib/constants";

export function Visit() {
  return (
    <section id="visit" className="py-20 bg-stone-950">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-2">
              Come See Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Find us in your neighborhood
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-stone-800">
                  <MapPin className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Address</p>
                  <p className="text-stone-400 text-sm">{CAFE_ADDRESS}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-stone-800">
                  <Phone className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Phone</p>
                  <a
                    href={`tel:${CAFE_PHONE}`}
                    className="text-stone-400 text-sm hover:text-amber-400 transition-colors"
                  >
                    {CAFE_PHONE}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-stone-800">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Hours</p>
                  <p className="text-stone-400 text-sm">{CAFE_HOURS.weekdays}</p>
                  <p className="text-stone-400 text-sm">{CAFE_HOURS.weekends}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-72 md:h-80 rounded-2xl overflow-hidden border border-stone-800">
            <iframe
              title="AnticCafe location"
              src="https://maps.google.com/maps?q=Antic+Cafez,+M9P8%2B5C7,+Madhyapur+Thimi+44600,+Nepal&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
