import { MapPin, Phone, Clock } from "lucide-react";
import { CAFE_ADDRESS, CAFE_PHONE, CAFE_HOURS } from "@/lib/constants";

export function Visit() {
  return (
    <section id="visit" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-medium text-amber-700 uppercase tracking-wider mb-2">
              Come See Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
              Find us in your neighborhood
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <MapPin className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">Address</p>
                  <p className="text-stone-600 text-sm">{CAFE_ADDRESS}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Phone className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">Phone</p>
                  <a
                    href={`tel:${CAFE_PHONE}`}
                    className="text-stone-600 text-sm hover:text-amber-700 transition-colors"
                  >
                    {CAFE_PHONE}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Clock className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-medium text-stone-900">Hours</p>
                  <p className="text-stone-600 text-sm">{CAFE_HOURS.weekdays}</p>
                  <p className="text-stone-600 text-sm">{CAFE_HOURS.weekends}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-72 md:h-80 rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
            <iframe
              title="AnticCafe location"
              src="https://maps.google.com/maps?q=Dibyasori+Planning,+Pepsicola,+Bhaktapur,+Nepal&output=embed"
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
