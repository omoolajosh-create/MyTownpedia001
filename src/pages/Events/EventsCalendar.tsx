import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { BadgePremium } from '@/components/ui/badge-premium'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Video, Plus, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

interface CommunityEvent {
  id: string
  title: string
  description: string
  event_type: string
  start_date: string
  end_date: string
  location: string | null
  is_virtual: boolean
  cover_image: string | null
  current_attendees: number
  max_attendees: number | null
  has_live_stream: boolean
  is_featured: boolean
}

export default function EventsCalendar() {
  const [events, setEvents] = useState<CommunityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live'>('all')

  useEffect(() => {
    fetchEvents()
  }, [filter])

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('community_events')
        .select('*')
        .eq('is_approved', true)

      if (filter === 'upcoming') {
        query = query.gte('start_date', new Date().toISOString())
      }

      if (filter === 'live') {
        query = query
          .eq('has_live_stream', true)
          .lte('start_date', new Date().toISOString())
          .gte('end_date', new Date().toISOString())
      }

      const { data, error } = await query.order('start_date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, any> = {
      festival: 'premium',
      meeting: 'default',
      ceremony: 'gold',
      workshop: 'secondary',
      celebration: 'glow',
      fundraiser: 'premium',
      other: 'default'
    }
    return colors[type] || 'default'
  }

  return (
    <Layout>
      <SEOHead
        title="Community Calendar"
        description="Stay connected with upcoming community events, festivals, meetings, and live-streamed celebrations in Araromi Obo Ekiti."
      />

      {/* Hero */}
      <section className="py-20 bg-gradient-mesh-warm">
        <div className="container mx-auto px-4 text-center">
          <BadgePremium variant="glow" className="mb-4">
            Live Events
          </BadgePremium>
          <h1 className="text-5xl font-bold mb-6 gradient-text-sunset">
            Community Calendar
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Never miss a moment. Join festivals, ceremonies, and live-streamed events from anywhere in the world.
          </p>
          <Link to="/events/create">
            <Button variant="premium" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Event
            </Button>
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-background/50 backdrop-blur-sm sticky top-0 z-20 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={filter === 'all' ? 'premium' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All Events
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'premium' : 'outline'}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === 'live' ? 'glow' : 'outline'}
              onClick={() => setFilter('live')}
            >
              <Video className="mr-2 h-4 w-4" />
              Live Now
            </Button>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : events.length === 0 ? (
            <Card className="max-w-2xl mx-auto text-center py-12">
              <CardContent>
                <CalendarDays className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">No Events Found</h3>
                <p className="text-muted-foreground mb-8">
                  Be the first to create an event and bring the community together
                </p>
                <Link to="/events/create">
                  <Button variant="premium">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`}>
                  <Card className="hover-float h-full">
                    <div className="relative">
                      {event.cover_image ? (
                        <img
                          src={event.cover_image}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-sunset-bg rounded-t-lg flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-white" />
                        </div>
                      )}
                      {event.is_featured && (
                        <BadgePremium variant="premium" className="absolute top-4 right-4">
                          Featured
                        </BadgePremium>
                      )}
                      {event.has_live_stream && (
                        <BadgePremium variant="glow" className="absolute top-4 left-4">
                          <Video className="h-3 w-3 mr-1" />
                          Live Stream
                        </BadgePremium>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <BadgePremium variant={getEventTypeColor(event.event_type)} className="mb-3">
                        {event.event_type}
                      </BadgePremium>
                      <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(event.start_date), 'MMM dd, yyyy')}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.is_virtual ? 'Virtual Event' : event.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {event.current_attendees} attending
                          {event.max_attendees && ` / ${event.max_attendees} max`}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}
