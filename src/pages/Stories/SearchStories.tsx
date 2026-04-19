import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye, Calendar } from 'lucide-react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search/SearchBar'
import { useSearch } from '@/hooks/useSearch'
import { Helmet } from 'react-helmet-async'

export default function SearchStories() {
  const { results, loading, hasSearched, search } = useSearch()

  return (
    <Layout>
      <Helmet>
        <title>Search Stories - MyTownpedia</title>
        <meta name="description" content="Search through our collection of African heritage stories and traditions" />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Search Stories</h1>
            <p className="text-muted-foreground text-lg">
              Discover stories from across our heritage
            </p>
          </div>

          <SearchBar onSearch={search} loading={loading} />

          {hasSearched && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  {results.length} {results.length === 1 ? 'story' : 'stories'} found
                </h2>
              </div>

              {results.length > 0 ? (
                <div className="grid gap-6">
                  {results.map((story) => (
                    <Card key={story.id} className="overflow-hidden hover:shadow-glow transition-all duration-500">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          {story.featured_image_url && (
                            <div className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                              <img
                                src={story.featured_image_url}
                                alt={story.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <Link to={`/stories/${story.id}`} className="group">
                                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                  {story.title}
                                </h3>
                              </Link>
                            </div>
                            
                            <p className="text-muted-foreground mb-4 line-clamp-2">
                              {story.content.substring(0, 200)}...
                            </p>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {story.town && (
                                <Badge variant="secondary">{story.town.name}</Badge>
                              )}
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                <span>{story.view_count || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(story.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <Button variant="ghost" size="sm" asChild className="mt-4 group/btn">
                              <Link to={`/stories/${story.id}`}>
                                Read Story <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground text-lg">
                      No stories found matching your search.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try different keywords or browse all stories.
                    </p>
                    <Button asChild className="mt-6">
                      <Link to="/stories">Browse All Stories</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}