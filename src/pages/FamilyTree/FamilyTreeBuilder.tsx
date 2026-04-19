import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { SEOHead } from '@/components/common/SEOHead'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BadgePremium } from '@/components/ui/badge-premium'
import { Users, Plus, TreePine, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

interface FamilyMember {
  id: string
  full_name: string
  birth_date: string | null
  death_date: string | null
  gender: string | null
  bio: string | null
  profile_photo: string | null
  is_living: boolean
  is_public: boolean
}

export default function FamilyTreeBuilder() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchFamilyMembers()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchFamilyMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching family members:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Users className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Sign in to Build Your Family Tree</h2>
          <p className="text-muted-foreground mb-8">Create and preserve your family's legacy</p>
          <Link to="/login">
            <Button variant="premium" size="lg">Sign In</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <SEOHead
        title="Family Tree Builder"
        description="Build and preserve your family genealogy. Connect with your roots and share your heritage story."
      />

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-heritage-gold/10 via-background to-heritage-sunset/10">
        <div className="container mx-auto px-4 text-center">
          <BadgePremium variant="gold" className="mb-4">Genealogy</BadgePremium>
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Family Tree Builder
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Preserve your family legacy. Build your tree, connect generations, and share your heritage.
          </p>
          <Link to="/family-tree/add-member">
            <Button size="lg" className="bg-heritage-gold hover:bg-heritage-gold-dark text-white">
              <Plus className="mr-2 h-5 w-5" />
              Add Family Member
            </Button>
          </Link>
        </div>
      </section>

      {/* Family Members Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : members.length === 0 ? (
            <Card className="max-w-2xl mx-auto text-center py-12">
              <CardContent>
                <TreePine className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Start Your Family Tree</h3>
                <p className="text-muted-foreground mb-8">
                  Begin preserving your family history by adding your first family member
                </p>
                <Link to="/family-tree/add-member">
                  <Button className="bg-heritage-gold hover:bg-heritage-gold-dark text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Member
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <Card key={member.id} className="hover-float cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        {member.profile_photo ? (
                          <img
                            src={member.profile_photo}
                            alt={member.full_name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-heritage-gold/20 flex items-center justify-center">
                            <User className="h-8 w-8 text-heritage-gold" />
                          </div>
                        )}
                        {!member.is_living && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-muted"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{member.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {member.birth_date && `Born ${new Date(member.birth_date).getFullYear()}`}
                          {member.death_date && ` - ${new Date(member.death_date).getFullYear()}`}
                        </p>
                        {member.is_public && (
                          <BadgePremium variant="outline" className="mt-2 text-xs">
                            Public
                          </BadgePremium>
                        )}
                      </div>
                    </div>
                    {member.bio && (
                      <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                        {member.bio}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}
