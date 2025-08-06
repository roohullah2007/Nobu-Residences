import React from 'react';

export default function TermsContent({ website, siteName }) {
  const companyName = siteName || 'Nobu Residences';
  const contactEmail = website?.contact_info?.email || 'info@noburesidences.com';
  const contactPhone = website?.contact_info?.phone || '(555) 123-4567';
  const address = website?.contact_info?.address || '123 Real Estate Ave, City, State 12345';

  return (
    <div className="prose prose-lg max-w-none">
      <div className="space-y-8">
        
        {/* Introduction */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Agreement to Terms</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            These Terms of Service ("Terms") govern your use of {companyName}'s website and real estate services. By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
          </p>
        </section>

        {/* Acceptance of Terms */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Acceptance of Terms</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using this website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </section>

        {/* Use License */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Use License</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed mb-3">
            Permission is granted to temporarily download one copy of the materials on {companyName}'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="font-work-sans text-gray-700 leading-relaxed ml-6 space-y-1">
            <li>• modify or copy the materials</li>
            <li>• use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
            <li>• attempt to decompile or reverse engineer any software contained on the website</li>
            <li>• remove any copyright or other proprietary notations from the materials</li>
          </ul>
          <p className="font-work-sans text-gray-700 leading-relaxed mt-3">
            This license shall automatically terminate if you violate any of these restrictions and may be terminated by us at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
          </p>
        </section>

        {/* User Accounts */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">User Accounts</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed mb-3">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
          </p>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account, whether or not you have authorized such activities or actions.
          </p>
        </section>

        {/* Real Estate Services */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Real Estate Services</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-space-grotesk font-semibold text-xl text-[#293056] mb-2">Property Listings</h3>
              <p className="font-work-sans text-gray-700 leading-relaxed">
                Property information displayed on our website is obtained from various sources including MLS systems, property owners, and third parties. While we strive for accuracy, we do not guarantee the completeness or accuracy of property information and recommend independent verification.
              </p>
            </div>
            
            <div>
              <h3 className="font-space-grotesk font-semibold text-xl text-[#293056] mb-2">Professional Services</h3>
              <p className="font-work-sans text-gray-700 leading-relaxed">
                Our real estate services are provided by licensed professionals. All real estate transactions are subject to applicable laws and regulations. We recommend consulting with appropriate professionals including attorneys, accountants, and inspectors before making any real estate decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Prohibited Uses */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Prohibited Uses</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed mb-3">
            You may not use our service:
          </p>
          <ul className="font-work-sans text-gray-700 leading-relaxed ml-6 space-y-1">
            <li>• For any unlawful purpose or to solicit others to perform unlawful acts</li>
            <li>• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
            <li>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
            <li>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            <li>• To submit false or misleading information</li>
            <li>• To upload or transmit viruses or any other type of malicious code</li>
            <li>• To collect or track personal information of others</li>
            <li>• To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
          </ul>
        </section>

        {/* Content and Intellectual Property */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Content and Intellectual Property</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed mb-3">
            The content on this website, including but not limited to text, graphics, images, logos, and software, is the property of {companyName} or its content suppliers and is protected by copyright and other intellectual property laws.
          </p>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            You may not reproduce, distribute, display, sell, lease, transmit, create derivative works from, translate, modify, reverse-engineer, disassemble, decompile or otherwise exploit this website or any portion of it unless expressly permitted by us in writing.
          </p>
        </section>

        {/* Disclaimer */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Disclaimer</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed mb-3">
            The materials on {companyName}'s website are provided on an 'as is' basis. {companyName} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            Further, {companyName} does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
          </p>
        </section>

        {/* Limitations */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Limitations of Liability</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            In no event shall {companyName} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on {companyName}'s website, even if {companyName} or its authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
          </p>
        </section>

        {/* Indemnification */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Indemnification</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            You agree to indemnify, defend, and hold harmless {companyName}, its officers, directors, employees, agents, and third parties, for any losses, costs, liabilities and damages (including reasonable attorney's fees) relating to or arising out of your use of or inability to use the site, any user postings made by you, your violation of any terms of this Agreement or your violation of any rights of a third party, or your violation of any applicable laws, rules or regulations.
          </p>
        </section>

        {/* Termination */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Termination</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms. If you wish to terminate your account, you may simply discontinue using the service.
          </p>
        </section>

        {/* Governing Law */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Governing Law</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            These Terms shall be interpreted and governed by the laws of the jurisdiction in which {companyName} operates, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </p>
        </section>

        {/* Changes to Terms */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Changes to Terms of Service</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our service after any revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="font-space-grotesk font-bold text-2xl text-[#293056] mb-4">Contact Information</h2>
          <p className="font-work-sans text-gray-700 leading-relaxed mb-3">
            If you have any questions about these Terms of Service, please contact us:
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
