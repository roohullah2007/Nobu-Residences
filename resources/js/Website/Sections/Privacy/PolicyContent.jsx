import React from 'react';

export default function PolicyContent({ website, siteName }) {
  const companyName = siteName || 'Nobu Residences';
  const contactEmail = website?.contact_email || 'info@noburesidence.com';
  const contactPhone = website?.phone || '(555) 123-4567';
  const address = website?.address || '123 Real Estate Ave, City, State 12345';

  return (
    <div className="prose prose-lg max-w-none">
      <div className="space-y-8">
        
        {/* Introduction */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Introduction</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            This Privacy Policy describes how {companyName} ("we," "our," or "us") collects, uses, and shares your personal information when you visit or make a purchase from our website or use our real estate services.
          </p>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Information We Collect</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-space-grotesk font-semibold text-xl text-[#293056] mb-2">Personal Information</h3>
              <p className="font-work-sans text-gray-700 leading-relaxed">
                When you interact with our services, we may collect personal information such as:
              </p>
              <ul className="font-work-sans text-gray-700 leading-relaxed ml-6 mt-2 space-y-1">
                <li>• Name and contact information (email, phone number, mailing address)</li>
                <li>• Property preferences and search criteria</li>
                <li>• Financial information (for pre-qualification purposes)</li>
                <li>• Communication records and preferences</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-space-grotesk font-semibold text-xl text-[#293056] mb-2">Automatically Collected Information</h3>
              <p className="font-work-sans text-gray-700 leading-relaxed">
                We automatically collect certain information about your device and how you interact with our website, including:
              </p>
              <ul className="font-work-sans text-gray-700 leading-relaxed ml-6 mt-2 space-y-1">
                <li>• IP address and browser information</li>
                <li>• Website usage patterns and preferences</li>
                <li>• Property viewing history and saved searches</li>
                <li>• Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">How We Use Your Information</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed mb-3">
            We use the information we collect to:
          </p>
          <ul className="font-work-sans text-gray-700 leading-relaxed ml-6 space-y-1">
            <li>• Provide and improve our real estate services</li>
            <li>• Match you with suitable properties and opportunities</li>
            <li>• Communicate with you about properties, market updates, and our services</li>
            <li>• Process transactions and maintain records</li>
            <li>• Comply with legal obligations and protect our rights</li>
            <li>• Analyze website usage to improve user experience</li>
          </ul>
        </section>

        {/* Information Sharing */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Information Sharing</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed mb-3">
            We may share your personal information in the following circumstances:
          </p>
          <ul className="font-work-sans text-gray-700 leading-relaxed ml-6 space-y-1">
            <li>• With your consent or at your direction</li>
            <li>• With real estate professionals, lenders, and service providers</li>
            <li>• With MLS (Multiple Listing Service) systems when appropriate</li>
            <li>• To comply with legal requirements or protect our rights</li>
            <li>• In connection with business transfers or acquisitions</li>
          </ul>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Data Security</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Your Rights</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed mb-3">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="font-work-sans text-gray-700 leading-relaxed ml-6 space-y-1">
            <li>• The right to access and receive a copy of your personal information</li>
            <li>• The right to update or correct inaccurate information</li>
            <li>• The right to delete your personal information</li>
            <li>• The right to restrict or object to processing</li>
            <li>• The right to data portability</li>
            <li>• The right to withdraw consent</li>
          </ul>
        </section>

        {/* Cookies and Tracking */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Cookies and Tracking</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze website traffic. You can control cookie settings through your browser, but disabling cookies may limit some website functionality.
          </p>
        </section>

        {/* Third-Party Services */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Third-Party Services</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            Our website may contain links to third-party websites or integrate with third-party services (such as MLS systems, mapping services, or social media platforms). This Privacy Policy does not apply to those third-party services, and we encourage you to review their privacy policies.
          </p>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Children's Privacy</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        {/* Changes to Privacy Policy */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Changes to This Privacy Policy</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Contact Us</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed mb-3">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
          </p>
          <div className="font-work-sans text-gray-700 leading-relaxed space-y-1">
            <p><strong>Email:</strong> {contactEmail}</p>
            <p><strong>Phone:</strong> {contactPhone}</p>
            <p><strong>Address:</strong> {address}</p>
          </div>
        </section>

      </div>
    </div>
  );
}
