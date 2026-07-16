import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Phone, Calendar } from '@/Website/Components/Icons';
import ViewingRequestModal from '@/Website/Global/Components/ViewingRequestModal';

export default function MobileBottomBar({ property = null }) {
  const { globalWebsite, website } = usePage().props;
  const currentWebsite = website || globalWebsite;
  const brandColors = currentWebsite?.brand_colors || {};

  const buttonTertiaryBg = brandColors.button_tertiary_bg || '#000000';
  const buttonTertiaryText = brandColors.button_tertiary_text || '#FFFFFF';

  const contactPhone =
    currentWebsite?.agent_info?.agent_phone ||
    currentWebsite?.contact_info?.agent?.phone ||
    currentWebsite?.contact_info?.phone ||
    '';
  const telHref = contactPhone ? `tel:${String(contactPhone).replace(/[^+\d]/g, '')}` : null;

  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <>
      {/* Mobile Request Viewing Button - Fixed at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="flex gap-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex-1 py-3 px-4 rounded-full font-work-sans font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: buttonTertiaryBg, color: buttonTertiaryText }}
          >
            <Calendar className="w-4 h-4" />
            Request a viewing
          </button>
          {telHref && (
            <a
              href={telHref}
              aria-label="Call now"
              className="flex-none bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-full font-work-sans font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Shared viewing request modal (date/time picker + consent) */}
      <ViewingRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        property={property}
      />
    </>
  );
}
