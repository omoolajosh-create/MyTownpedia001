import { Header } from './Header'
import { Footer } from './Footer'
import { InstallBanner } from '@/components/common/InstallBanner'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { OrganizationSchema } from '@/components/seo/OrganizationSchema'
import { CookieConsent } from '@/components/common/CookieConsent'
import { UpdateNotification } from '@/components/common/UpdateNotification'
import { InstallPromptModal } from '@/components/home/InstallPromptModal'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { usePrefetch } from '@/hooks/usePrefetch'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  useOnlineStatus();
  usePrefetch();
  
  return (
    <div className="min-h-screen flex flex-col">
      <OrganizationSchema />
      <InstallBanner />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
      <CookieConsent />
      <UpdateNotification />
      <InstallPromptModal />
    </div>
  )
}