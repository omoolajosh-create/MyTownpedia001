import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  HandHeart,
  MapPinned,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'

const programmes = [
  {
    icon: BookOpenCheck,
    title: 'Education Access',
    description: 'Make scholarships, bursaries, admissions and training opportunities easier to find before deadlines pass.',
    metric: 'Opportunities verified',
    tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  {
    icon: MessageSquareText,
    title: 'Community Alert',
    description: 'Organise useful updates about health, roads, public services and local developments with clear source labels.',
    metric: 'Residents informed',
    tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  {
    icon: HandHeart,
    title: 'Digital Skills Desk',
    description: 'Connect young people and residents to jobs, grants, digital skills and practical application support.',
    metric: 'People supported',
    tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
]

const trustSteps = [
  ['01', 'Discover', 'We collect relevant local information from official institutions, trusted organisations and community contributors.'],
  ['02', 'Check', 'We keep the original source visible and distinguish official notices, verified stories and community reports.'],
  ['03', 'Explain', 'AI can improve clarity, but it does not replace editorial review or the original source.'],
  ['04', 'Measure', 'We report what was published, who it served and which community outcomes the programme created.'],
]

export default function Impact() {
  return (
    <Layout>
      <SEOHead
        title="Impact & Partnerships | MyTownpedia"
        description="Support MyTownpedia's work connecting Ekiti communities with trusted local information, opportunities and practical support."
        type="website"
      />

      <main>
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-heritage-earth via-heritage-bronze to-heritage-sunset-deep text-white">
          <div className="absolute inset-0 opacity-30 texture-grain" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-heritage-gold/25 blur-3xl" />
          <div className="container relative mx-auto px-4 py-20 md:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="max-w-3xl space-y-7">
                <Badge className="border border-white/20 bg-white/10 text-white hover:bg-white/20">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Building useful local infrastructure
                </Badge>
                <h1 className="text-5xl leading-[0.98] md:text-7xl">Information that helps a town move forward.</h1>
                <p className="max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl">
                  MyTownpedia is building a trusted local opportunity and community intelligence platform for Ekiti—so residents can find what matters, organisations can reach the right people, and supporters can see measurable impact.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="bg-heritage-gold text-heritage-earth hover:bg-heritage-gold-light">
                    <a href="mailto:araromiobo.heritage@gmail.com?subject=MyTownpedia%20partnership%20conversation">
                      Start a partnership conversation <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                    <Link to="/news">See the platform in action</Link>
                  </Button>
                </div>
              </div>

              <Card className="border-white/15 bg-black/20 text-white shadow-2xl backdrop-blur-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">The MyTownpedia promise</CardTitle>
                    <ShieldCheck className="h-6 w-6 text-heritage-gold" />
                  </div>
                  <CardDescription className="text-white/65">Useful before impressive. Trusted before fast.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {['Relevant local information, not random volume', 'Original sources kept visible', 'Human approval for important publishing decisions', 'Clear reporting for every sponsored programme'].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-white/85">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-heritage-gold" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border/50 bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">A different kind of local platform</p>
              <h2 className="mb-5 text-3xl md:text-5xl">We are not trying to publish everything.</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                We are building the place residents return to when they need a verified opportunity, a clear local update, a useful notice or a responsible way to be heard.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
              {[
                [BellRing, 'Find what matters', 'A focused stream for education, jobs, health, services, events and community life.'],
                [BadgeCheck, 'Know what to trust', 'Simple labels explain whether information is official, verified, community-submitted or expired.'],
                [Users, 'See who benefits', 'Impact reporting turns a good idea into a transparent programme that supporters can confidently back.'],
              ].map(([Icon, title, body]) => (
                <Card key={title as string} className="group border-border/60 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-warm">
                  <CardContent className="p-7">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-2xl">{title as string}</h3>
                    <p className="leading-relaxed text-muted-foreground">{body as string}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Potential programme partners</p>
                <h2 className="text-3xl md:text-5xl">Sponsor a measurable outcome.</h2>
              </div>
              <p className="max-w-md text-muted-foreground">Support does not buy editorial control. It funds a clearly defined public-benefit programme with transparent reporting.</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {programmes.map(({ icon: Icon, title, description, metric, tone }) => (
                <Card key={title} className="overflow-hidden border-border/60 bg-card">
                  <CardHeader>
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></div>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription className="leading-relaxed">{description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 border-t border-border/60 pt-4 text-sm font-medium text-primary">
                      <CircleDollarSign className="h-4 w-4" />
                      Impact we can report: {metric}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl rounded-3xl border border-border/60 bg-card p-6 shadow-elevated md:p-10">
              <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                  <Badge variant="secondary" className="mb-5"><FileCheck2 className="mr-2 h-4 w-4" />Our trust model</Badge>
                  <h2 className="mb-5 text-3xl md:text-5xl">Responsible technology, local accountability.</h2>
                  <p className="leading-relaxed text-muted-foreground">AI helps us organise and explain information faster. People remain responsible for deciding what deserves publication.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {trustSteps.map(([number, title, body]) => (
                    <div key={number} className="flex gap-4">
                      <span className="font-serif text-3xl font-bold text-primary/40">{number}</span>
                      <div><h3 className="mb-1 text-xl">{title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{body}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary py-16 text-primary-foreground md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">Let’s build the pilot</p>
                <h2 className="mb-4 text-3xl md:text-5xl">Help one useful idea reach more towns.</h2>
                <p className="max-w-2xl text-lg leading-relaxed text-primary-foreground/80">We are open to conversations with schools, NGOs, foundations, businesses, town unions and public-interest organisations.</p>
              </div>
              <Button asChild size="lg" variant="secondary" className="group whitespace-nowrap">
                <a href="mailto:araromiobo.heritage@gmail.com?subject=MyTownpedia%20pilot%20partnership">Contact MyTownpedia <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-border/50 py-10">
          <div className="container mx-auto flex flex-col items-start justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row md:items-center">
            <div className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-primary" /> Rooted in Araromi Obo Ekiti, built for communities.</div>
            <Link to="/about" className="font-medium text-primary hover:underline">Learn more about MyTownpedia <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
          </div>
        </section>
      </main>
    </Layout>
  )
}
