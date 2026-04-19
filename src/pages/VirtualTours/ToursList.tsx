import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { BadgePremium } from '@/components/ui/badge-premium'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Eye, Compass, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

interface VirtualTour {
  id: string
  title: string
  description: string
  cover_image: string | null
  duration_minutes: number | null
  difficulty: string | null
  total_views: number
  is_featured: boolean
}

export default function ToursList() {
  const [tours, setTours] = useState<VirtualTour[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTours()
  }, [])

  const fetchTours = async () => {
    try {
      const { data, error } = await supabase
        .from('virtual_tours')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('total_views', { ascending: false })

      if (error) throw error
      setTours(data || [])
    } catch (error) {
      console.error('Error fetching tours:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string | null) => {
    if (!difficulty) return 'default'
    const colors: Record<string, any> = {
      easy: 'default',
      moderate: 'gold',
      challenging: 'premium'
    }
    return colors[difficulty] || 'default'
  }

  return (
    <Layout>
      <SEOHead
        title="Virtual Town Tours"
        description="Explore Araromi Obo Ekiti through immersive virtual tours. Experience the town's landmarks, culture, and heritage from anywhere."
      />

      {/* Hero */}
      <section className="py-20 bg-gradient-mesh-warm">
        <div className="container mx-auto px-4 text-center">
          <BadgePremium variant="premium" className="mb-4">
            Virtual Reality
          </BadgePremium>
          <h1 className="text-5xl font-bold mb-6 gradient-text-sunset">
            Virtual Town Tours
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience Araromi Obo like never before. Take immersive 360° tours of landmarks, cultural sites, and hidden gems.
          </p>
          <Link to="/virtual-tours/create">
            <Button variant="premium" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Virtual Tour
            </Button>
          </Link>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : tours.length === 0 ? (
            <Card className="max-w-2xl mx-auto text-center py-12">
              <CardContent>
                <Compass className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">No Tours Available Yet</h3>
                <p className="text-muted-foreground mb-8">
                  Be the first to create a virtual tour and showcase the beauty of our heritage
                </p>
                <Link to="/virtual-tours/create">
                  <Button variant="premium">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Tour
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((tour) => (
                <Link key={tour.id} to={`/virtual-tours/${tour.id}`}>
                  <Card className="hover-float h-full">
                    <div className="relative">
                      {tour.cover_image ? (
                        <img
                          src={tour.cover_image}
                          alt={tour.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-mesh-warm rounded-t-lg flex items-center justify-center">
                          <Compass className="h-16 w-16 text-heritage-gold" />
                        </div>
                      )}
                      {tour.is_featured && (
                        <BadgePremium variant="premium" className="absolute top-4 right-4">
                          Featured
                        </BadgePremium>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-3">{tour.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {tour.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          {tour.duration_minutes && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {tour.duration_minutes} min
                            </div>
                          )}
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {tour.total_views}
                          </div>
                        </div>
                        {tour.difficulty && (
                          <BadgePremium variant={getDifficultyColor(tour.difficulty)}>
                            {tour.difficulty}
                          </BadgePremium>
                        )}
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
