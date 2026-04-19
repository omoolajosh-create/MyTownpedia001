import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Users, Calendar, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase, Town } from '@/lib/supabase'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'

export default function TownsList() {
  const [towns, setTowns] = useState<Town[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTowns()
  }, [])

  const fetchTowns = async () => {
    try {
      const { data, error } = await supabase
        .from('towns')
        .select('*')
        .order('name')

      if (error) throw error
      setTowns(data || [])
    } catch (error) {
      console.error('Error fetching towns:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTowns = towns.filter(town =>
    town.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    town.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    town.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <SEOHead
        title="Explore African Towns"
        description="Discover the rich history, culture, and stories of African communities. Explore towns across Africa and learn their heritage."
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Towns</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the rich history, culture, and stories of African communities
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search towns by name, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Towns Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTowns.map((town) => (
                <Card key={town.id} className="overflow-hidden group hover:shadow-warm transition-all duration-300">
                  <div className="h-48 bg-gradient-earth relative overflow-hidden">
                    {town.featured_image_url ? (
                      <img 
                        src={town.featured_image_url} 
                        alt={town.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-16 w-16 text-heritage-earth/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-semibold text-lg">{town.name}</h3>
                      <p className="text-sm text-white/80 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {town.location}
                      </p>
                    </div>
                    {town.is_featured && (
                      <Badge className="absolute top-4 right-4 bg-heritage-gold text-heritage-earth">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {town.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {town.population && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{town.population.toLocaleString()} people</span>
                        </div>
                      )}
                      {town.founded_year && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Founded in {town.founded_year}</span>
                        </div>
                      )}
                    </div>

                    <Button asChild className="w-full">
                      <Link to={`/towns/${town.slug}`}>
                        Explore {town.name} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTowns.length === 0 && !loading && (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Towns Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? `No towns match your search for "${searchTerm}"`
                    : 'No towns have been added yet.'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}