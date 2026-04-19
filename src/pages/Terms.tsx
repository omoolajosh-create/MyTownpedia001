import { Layout } from '@/components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';

export default function Terms() {
  return (
    <Layout>
      <Helmet>
        <title>Terms of Service - MyTownpedia</title>
        <meta name="description" content="MyTownpedia terms of service and usage guidelines" />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <Card className="mb-6">
            <CardContent className="pt-6 prose prose-sm max-w-none">
              <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
              <p>
                By accessing and using MyTownpedia ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Platform Purpose</h2>
              <p>
                MyTownpedia is dedicated to documenting, preserving, and sharing African town stories, traditions, and cultural heritage. Our platform enables communities to celebrate their heritage and connect with their roots.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">User Accounts</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">Registration</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>One person or entity may maintain only one account</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Account Security</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep your password confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>You are responsible for all activities under your account</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Content Guidelines</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">Your Content</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You retain ownership of content you submit</li>
                <li>You grant us a license to display and distribute your content</li>
                <li>You must have rights to all content you share</li>
                <li>Content must be accurate and not misleading</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Prohibited Content</h3>
              <p>You may not post content that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violates laws or regulations</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains hate speech or promotes violence</li>
                <li>Is spam or misleading</li>
                <li>Harasses or threatens others</li>
                <li>Contains malware or harmful code</li>
                <li>Violates privacy rights</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptable Use</h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the platform for its intended purpose</li>
                <li>Respect other users and their content</li>
                <li>Comply with all applicable laws</li>
                <li>Not attempt to circumvent security measures</li>
                <li>Not interfere with platform operations</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Crowdfunding and Donations</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Campaign creators are responsible for fulfilling commitments</li>
                <li>We do not guarantee campaign success or fund usage</li>
                <li>All transactions are processed securely</li>
                <li>Refund policies are determined by campaign creators</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Intellectual Property</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Platform design and code are our property</li>
                <li>User content remains the property of content creators</li>
                <li>Respect copyright and trademark rights</li>
                <li>Report infringement to us promptly</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Termination</h2>
              <p>We may suspend or terminate your account if you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate these terms</li>
                <li>Engage in fraudulent activity</li>
                <li>Harm other users or the platform</li>
                <li>Request account deletion</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Disclaimers</h2>
              <p>
                The platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access or error-free operation. User-generated content reflects the views of contributors, not MyTownpedia.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, MyTownpedia shall not be liable for indirect, incidental, consequential, or punitive damages arising from your use of the platform.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to Terms</h2>
              <p>
                We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Governing Law</h2>
              <p>
                These terms are governed by the laws of Nigeria. Any disputes will be resolved in Nigerian courts.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
              <p>
                For questions about these Terms of Service, contact us at:{' '}
                <a href="mailto:araromiobo.heritage@gmail.com" className="text-primary hover:underline">
                  araromiobo.heritage@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
