import { createFileRoute } from '@tanstack/react-router'
import { Footer } from '@/components/home-page/footer'

export const Route = createFileRoute('/terms')({
  component: Terms,
})

function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

          <p className="text-gray-600 leading-relaxed mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using stepps.ai ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials on stepps.ai for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on stepps.ai</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Terms</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3.1 Account Registration</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You must provide accurate, complete, and current information during registration. You are responsible for safeguarding the password and all activities that occur under your account.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3.2 Age Requirements</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You must be at least 13 years of age or the minimum age in your jurisdiction to create an account and use our service.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3.3 One Account Per User</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Each user is limited to one account. Creating multiple accounts without permission is prohibited.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You may not use our service for any unlawful purposes or in any way that could damage, disable, or impair the service. Specifically, you agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Use the service to create or transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems or networks</li>
                <li>Use automated tools to access the service without permission</li>
                <li>Interfere with or disrupt the service or servers connected to the service</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.1 Service Content</h3>
                  <p className="text-gray-600 leading-relaxed">
                    The stepps.ai service and its original content, features, and functionality are owned by stepps.ai and are protected by international copyright, trademark, and other intellectual property laws.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.2 User Content</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You retain ownership of any content you create, upload, or share through our service. By using our service, you grant us a limited, non-exclusive, worldwide license to use, store, and process your content solely to provide and improve the service.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.3 Trademarks</h3>
                  <p className="text-gray-600 leading-relaxed">
                    stepps.ai and related graphics, logos, and service names are trademarks of stepps.ai and may not be used without our prior written consent.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Paid Services</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">7.1 Subscription Plans</h3>
                  <p className="text-gray-600 leading-relaxed">
                    stepps.ai offers both free and paid subscription plans. Paid plans are billed in advance on a monthly or annual basis.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">7.2 Refund Policy</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Refunds are handled on a case-by-case basis. We offer a 14-day money-back guarantee for new customers. Please contact our support team for refund requests.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">7.3 Price Changes</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We reserve the right to modify our subscription fees at any time. Any price changes will be communicated to you at least 30 days in advance.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Upon termination, your account and all associated data will be deleted unless required to be retained by law. You may also terminate your account at any time through your account settings or by contacting our support team.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-gray-600 leading-relaxed">
                The service is provided on an "AS IS" and "AS AVAILABLE" basis. stepps.ai makes no representations or warranties of any kind, express or implied, as to the operation of the service or the information, content, materials, or products included on this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                In no event shall stepps.ai, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These terms shall be interpreted and governed by the laws of the jurisdiction in which stepps.ai operates, without regard to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. If we make material changes, we will notify you by email or by posting a notice on our site prior to the change becoming effective.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 space-y-2">
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