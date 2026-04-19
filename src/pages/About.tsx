import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin } from 'lucide-react'

const About = () => {
  return (
    <Layout>
      <SEOHead
        title="About Us - Preserving Heritage & Culture"
        description="Learn about Araromi Obo Heritage - preserving and sharing the rich cultural heritage of Araromi Obo Ekiti and surrounding communities. Connect with your roots."
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">About Us</h1>
            <p className="text-lg text-muted-foreground">
              Preserving and celebrating the rich cultural heritage of our community
            </p>
          </header>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Araromi Obo Heritage is dedicated to preserving, documenting, and sharing the rich cultural heritage, 
                  stories, and traditions of Araromi Obo Ekiti and surrounding communities. We believe in the power of 
                  storytelling to connect generations and keep our history alive for future generations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What We Do</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Collect and preserve historical stories and cultural traditions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Document the history of towns and communities in our region</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Provide a platform for community members to share their stories</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Celebrate and promote our cultural heritage</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Get in touch with us</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href="mailto:araromiobo.heritage@gmail.com" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      araromiobo.heritage@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a 
                      href="tel:+2349067174947" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      09067174947
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Headquarters</p>
                    <p className="text-muted-foreground">Araromi Obo Ekiti</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default About
