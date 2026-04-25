import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Mail, MapPin, Globe, Heart } from 'lucide-react'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/30 border-t border-border/40 mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 overflow-hidden">
                <img src="/tribal-m-logo.png" alt="MyTownpedia Logo" className="h-full w-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-serif font-bold text-foreground">MyTownpedia</span>
                <span className="text-xs text-muted-foreground">Preserving Heritage</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Born in Araromi Obo Ekiti, preserving African town stories, traditions, and heritage for future generations.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                aria-label="Visit our Facebook page"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                aria-label="Visit our Twitter page"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                aria-label="Visit our Instagram page"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Explore</h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'Towns', href: '/towns' },
                { label: 'Stories', href: '/stories' },
                { label: 'News', href: '/news' },
                { label: 'Heritage Timeline', href: '/heritage/timeline' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* News & Updates */}
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">News</h3>
            <ul className="space-y-3">
              {[
                { label: 'Latest News', href: '/news' },
                { label: 'Community Updates', href: '/news?category=Community' },
                { label: 'Heritage Stories', href: '/news?category=Heritage' },
                { label: 'Events & Opportunities', href: '/news?category=Opportunities' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Community</h3>
            <ul className="space-y-3">
              {[
                { label: 'Events', href: '/events' },
                { label: 'Crowdfunding', href: '/crowdfunding' },
                { label: 'Partners', href: '/partners' },
                { label: 'Install App', href: '/install' },
                { label: 'About Us', href: '/about' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:araromiobo.heritage@gmail.com" className="hover:text-foreground transition-colors">
                  araromiobo.heritage@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Araromi Obo Ekiti, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} MyTownpedia. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="h-4 w-4 text-heritage-ruby fill-heritage-ruby" /> for African communities
          </p>
        </div>
      </div>
    </footer>
  )
}