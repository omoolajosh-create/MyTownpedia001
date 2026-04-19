import { Layout } from '@/components/layout/Layout';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';

export default function Privacy() {
  return (
    <Layout>
      <Helmet>
        <title>Privacy Policy - MyTownpedia</title>
        <meta name="description" content="MyTownpedia privacy policy and data protection information" />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <Card className="mb-6">
            <CardContent className="pt-6 prose prose-sm max-w-none">
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p>
                MyTownpedia ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and email address when you create an account</li>
                <li>Profile information you choose to provide</li>
                <li>Content you submit (stories, comments, photos)</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Usage Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>How you interact with our platform</li>
                <li>Pages visited and features used</li>
                <li>Device information and browser type</li>
                <li>IP address and general location</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our services</li>
                <li>To authenticate your account and ensure security</li>
                <li>To send notifications about relevant content</li>
                <li>To improve our platform and user experience</li>
                <li>To communicate with you about updates and features</li>
                <li>To comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
              <p>We do not sell your personal information. We may share information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With your consent</li>
                <li>To comply with legal requirements</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist our operations</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of communications</li>
                <li>Export your data</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage, and remember your preferences.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Children's Privacy</h2>
              <p>
                Our platform is not intended for children under 13. We do not knowingly collect information from children under 13.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notification.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at:{' '}
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
