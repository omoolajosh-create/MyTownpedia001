import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Users, MapPin, Heart, Calendar, DollarSign, Eye, Sparkles, History, Clock, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, Story, Town } from '@/lib/supabase'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { ScrollReveal } from '@/components/common/ScrollReveal'
import { StatsCounter } from '@/components/home/StatsCounter'
import { useStats } from '@/hooks/useStats'

export default function Home() {
  const [featuredStories, setFeaturedStories] = useState<Story[]>([])
  const [featuredTowns, setFeaturedTowns] = useState<Town[]>([])
  const [loading, setLoading] = useState(true)
  const { stats, loading: statsLoading } = useStats()

  useEffect(() => {
    fetchFeaturedContent()
  }, [])

  const fetchFeaturedContent = async () => {
    try {
      const [storiesResponse, townsResponse] = await Promise.all([
        supabase
          .from('stories')
          .select(`
            *,
            author:profiles(full_name),
            town:towns(name, slug)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('towns')
          .select('*')
          .eq('is_featured', true)
          .limit(3),
      ])

      if (storiesResponse.data) setFeaturedStories(storiesResponse.data)
      if (townsResponse.data) setFeaturedTowns(townsResponse.data)
    } catch (error) {
      console.error('Error fetching featured content:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Layout>
      <SEOHead
        title="MyTownpedia – African Town Stories"
        description="Discover and share African town stories, traditions, and heritage. Preserve community memories, explore time capsules, and connect with your roots."
        type="website"
      />

      {/* Hero Section - Professional & Clean */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
        
        {/* Subtle accent orb */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-heritage-gold/5 rounded-full blur-[100px]" />
        
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Origin Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/5 border border-primary/10 animate-fade-in">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Proudly Rooted in Araromi Obo Ekiti</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-[1.1] animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Giving Voice to Every Town,
              <span className="block mt-2 text-primary">From Araromi Obo to Ado-Ekiti</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Born from the need to give recognition to hidden gems like <span className="font-semibold text-foreground">Araromi Obo Ekiti</span>, we are building a digital archive that preserves the stories, traditions, and heritage of African communities.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button asChild size="lg" className="text-base group shadow-lg hover:shadow-xl transition-shadow">
                <Link to="/towns">
                  Explore Towns
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/stories">Read Stories</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="text-base hidden md:flex">
                <Link to="/install">
                  <Download className="mr-2 h-4 w-4" />
                  Install App
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-foreground font-serif">
                  {statsLoading ? (
                    <div className="h-12 w-20 mx-auto bg-muted animate-pulse rounded" />
                  ) : (
                    <StatsCounter end={stats.storiesCount} />
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Stories Shared</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-foreground font-serif">
                  {statsLoading ? (
                    <div className="h-12 w-20 mx-auto bg-muted animate-pulse rounded" />
                  ) : (
                    <StatsCounter end={stats.townsCount} />
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Towns Connected</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-foreground font-serif">
                  {statsLoading ? (
                    <div className="h-12 w-20 mx-auto bg-muted animate-pulse rounded" />
                  ) : (
                    <StatsCounter end={stats.membersCount} />
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Community Members</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-foreground font-serif">
                  {statsLoading ? (
                    <div className="h-12 w-20 mx-auto bg-muted animate-pulse rounded" />
                  ) : (
                    <StatsCounter end={stats.oldestYear} suffix="+" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Years of Heritage</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Time Capsule Feature */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-5xl mx-auto">
              <Card className="overflow-hidden border-border/50 shadow-lg">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-12 space-y-6 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 w-fit">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">New Feature</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
                      Digital Time Capsules
                    </h2>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      Seal your memories, stories, and messages for the future. Create time capsules that unlock on special dates, preserving your heritage for generations.
                    </p>
                    
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">Lock messages until meaningful future dates</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Heart className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">Share with family or the entire community</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">Become part of our heritage archive</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button asChild size="default">
                        <Link to="/time-capsule">
                          Explore Capsules
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="default">
                        <Link to="/auth">Get Started</Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative bg-primary p-8 md:p-12 flex items-center justify-center min-h-[350px]">
                    <div className="relative z-10 text-center space-y-6">
                      <div className="w-24 h-24 mx-auto bg-primary-foreground/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Clock className="h-12 w-12 text-primary-foreground" />
                      </div>
                      <div className="text-primary-foreground space-y-1">
                        <p className="text-2xl font-bold">Seal Today</p>
                        <p className="text-base opacity-80">Reveal Tomorrow</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Towns */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-primary uppercase tracking-wide">Our Communities</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-3 mb-4">Featured Towns</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Explore the rich tapestry of communities that make up our heritage
              </p>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {featuredTowns.map((town, index) => (
              <ScrollReveal key={town.id} delay={index * 100}>
                <Link
                  to={`/towns/${town.slug}`}
                  className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all hover:shadow-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                    {town.featured_image_url ? (
                      <img
                        src={town.featured_image_url}
                        alt={town.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-serif font-bold group-hover:text-primary transition-colors">
                      {town.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {town.description}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                      {town.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{town.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{town.view_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-primary uppercase tracking-wide">Community Voices</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-3 mb-4">Recent Stories</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Voices from our community sharing their experiences and memories
              </p>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-[16/9] bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {featuredStories.map((story, index) => (
              <ScrollReveal key={story.id} delay={index * 100}>
                <Link
                  to={`/stories/${story.id}`}
                  className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all hover:shadow-lg"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-muted relative">
                    {story.featured_image_url ? (
                      <>
                        <img
                          src={story.featured_image_url}
                          alt={story.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="text-xs">
                            {story.story_type}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-serif font-bold group-hover:text-primary transition-colors line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {story.content.substring(0, 120)}...
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-[10px] font-medium text-primary">
                            {story.author?.full_name?.[0] || 'A'}
                          </span>
                        </span>
                        <span>{story.author?.full_name || 'Anonymous'}</span>
                      </div>
                      <span className="text-muted-foreground/50">·</span>
                      <span>{formatDate(story.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* Community Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-primary uppercase tracking-wide">Explore More</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-3 mb-4">Community Features</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Discover the many ways to connect with your heritage
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <ScrollReveal delay={0}>
              <Link
                to="/heritage/timeline"
                className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-all hover:shadow-lg text-center space-y-4"
              >
                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all">
                  <History className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-serif font-bold group-hover:text-primary transition-colors">Heritage Timeline</h3>
                <p className="text-sm text-muted-foreground">
                  Journey through historical milestones
                </p>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Link
                to="/events"
                className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-all hover:shadow-lg text-center space-y-4"
              >
                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all">
                  <Calendar className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-serif font-bold group-hover:text-primary transition-colors">Events</h3>
                <p className="text-sm text-muted-foreground">
                  Join cultural celebrations
                </p>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Link
                to="/crowdfunding"
                className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-all hover:shadow-lg text-center space-y-4"
              >
                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all">
                  <Heart className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-serif font-bold group-hover:text-primary transition-colors">Crowdfunding</h3>
                <p className="text-sm text-muted-foreground">
                  Support heritage projects
                </p>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Link
                to="/partners"
                className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-all hover:shadow-lg text-center space-y-4"
              >
                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all">
                  <Users className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-serif font-bold group-hover:text-primary transition-colors">Partners</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with organizations
                </p>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground">
                Share Your Story
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
                Every story matters. Add your voice to our collective memory and help preserve our rich cultural heritage for generations.
              </p>
              <Button asChild size="lg" variant="secondary" className="text-base group shadow-lg">
                <Link to="/submit">
                  Submit Your Story
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  )
}