import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { BadgePremium } from '@/components/ui/badge-premium'
import { Calendar, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

interface TimelineEvent {
  id: string
  title: string
  description: string
  event_date: string
  event_year: number
  category: string
  featured_image: string | null
  media_gallery: any
}

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'foundation', label: 'Foundation' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'development', label: 'Development' },
    { value: 'celebration', label: 'Celebration' },
    { value: 'milestone', label: 'Milestone' }
  ]

  useEffect(() => {
    fetchEvents()
  }, [selectedCategory])

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('timeline_events')
        .select('*')
        .eq('is_approved', true)
        .order('event_year', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching timeline events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      foundation: 'premium',
      leadership: 'gold',
      cultural: 'glow',
      development: 'default',
      celebration: 'secondary',
      milestone: 'premium'
    }
    return colors[category] || 'default'
  }

  return (
    <Layout>
      <SEOHead
        title="Heritage Timeline"
        description="Explore the rich history of Araromi Obo Ekiti through an interactive timeline of significant events spanning over 200 years"
      />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-mesh-warm overflow-hidden">
        <div className="absolute inset-0 bg-texture-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <BadgePremium variant="gold" className="mb-4">
              Interactive Timeline
            </BadgePremium>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text-sunset">
              Heritage Timeline
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Journey through over 200 years of history, culture, and milestones
            </p>
            <Link to="/heritage/timeline/submit">
              <Button variant="premium" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Submit Historical Event
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-background/50 backdrop-blur-sm sticky top-0 z-20 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-premium text-white shadow-premium'
                    : 'bg-card text-foreground hover:shadow-warm'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">No events found for this category</p>
            </div>
          ) : (
            <div className="relative max-w-5xl mx-auto">
              {/* Timeline Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-sunset"></div>

              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={`relative mb-16 ${
                    index % 2 === 0 ? 'md:ml-auto md:pl-12' : 'md:mr-auto md:pr-12'
                  } md:w-1/2`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-auto md:right-[-25px] top-8 w-4 h-4 rounded-full bg-heritage-gold shadow-glow"></div>

                  <Card className="hover-float">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <BadgePremium variant={getCategoryColor(event.category) as any} className="mb-2">
                            {event.category}
                          </BadgePremium>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            {event.event_year}
                          </div>
                        </div>
                      </div>

                      {event.featured_image && (
                        <img
                          src={event.featured_image}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}

                      <h3 className="text-2xl font-bold mb-3">{event.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{event.description}</p>

                      {event.media_gallery && Array.isArray(event.media_gallery) && event.media_gallery.length > 0 && (
                        <div className="mt-4 flex gap-2">
                          {event.media_gallery.slice(0, 3).map((media: any, idx: number) => (
                            <img
                              key={idx}
                              src={media.url}
                              alt=""
                              className="w-20 h-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}
