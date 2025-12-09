import { createFileRoute } from '@tanstack/react-router'
import { Footer } from '@/components/home-page/footer'

export const Route = createFileRoute('/privacy')({
  component: Privacy,
})

function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <p className="text-gray-600 leading-relaxed mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to stepps.ai. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">2.1 Information You Provide</h3>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    We collect information you voluntarily provide, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>Name and email address during registration</li>
                    <li>Profile information you choose to add</li>
                    <li>Content you create and share on our platform</li>
                    <li>Communications with our support team</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">2.2 Automatically Collected Information</h3>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    We automatically collect certain information when you use our service:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Usage data and interaction patterns</li>
                    <li>Performance and diagnostic information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">2.3 Cookies and Tracking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized features. You can control cookies through your browser settings.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>To provide and maintain our service</li>
                <li>To process transactions and send related information</li>
                <li>To improve and personalize your experience</li>
                <li>To communicate with you about your account</li>
                <li>To analyze usage and optimize our service</li>
                <li>To detect and prevent fraudulent activity</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">4.1 We Do Not Sell Your Data</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">4.2 Service Providers</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We may share information with trusted third-party service providers who assist us in operating our service, conducting our business, or servicing users, as long as those parties agree to keep this information confidential.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">4.3 Legal Requirements</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We may disclose your information if required by law or in good faith belief that such action is necessary to comply with legal obligations or protect our rights.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 mt-4">
                <li>Secure SSL/TLS encryption for data transmission</li>
                <li>Regular security assessments and updates</li>
                <li>Restricted access to personal data</li>
                <li>Secure data storage and backup systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We retain your personal information only as long as necessary for the purposes outlined in this policy, unless a longer retention period is required by law.
              </p>
              <p className="text-gray-600 leading-relaxed">
                When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required by law to retain certain information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your personal information</li>
                <li>Restriction of processing</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                To exercise these rights, please contact us at support@stepps.ai.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-600 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Third-Party Links</h2>
              <p className="text-gray-600 leading-relaxed">
                Our service may contain links to third-party websites. We are not responsible for the privacy practices of these third-party sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Compliance with Privacy Laws</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">11.1 GDPR</h3>
                  <p className="text-gray-600 leading-relaxed">
                    For EU users, we comply with the General Data Protection Regulation (GDPR). Our legal basis for processing includes consent, contractual necessity, legitimate interests, and legal obligations.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">11.2 CCPA</h3>
                  <p className="text-gray-600 leading-relaxed">
                    For California residents, we comply with the California Consumer Privacy Act (CCPA), granting you specific rights regarding your personal information.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date at the top.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="space-y-2">
                <p className="text-gray-600">Support: support@stepps.ai</p>
                <p className="text-gray-600">Website: https://stepps.ai</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}