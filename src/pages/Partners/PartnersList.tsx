import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Building2, Plus } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  type: string;
  description: string;
  logo_url: string;
  location: string;
}

export default function PartnersList() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('community_partners')
        .select('id, name, type, description, logo_url, location')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      school: 'bg-blue-500',
      church: 'bg-purple-500',
      radio: 'bg-orange-500',
      association: 'bg-green-500',
    };
    return colors[type.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Partners</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Local organizations strengthening our community
            </p>
            {user && (
              <Link to="/partners/submit">
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Register Your Organization
                </Button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading partners...</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No partners registered yet.</p>
              {user && (
                <Link to="/partners/submit">
                  <Button>Be the First Partner</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      {partner.logo_url && (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <Badge className={getTypeColor(partner.type)}>
                        {partner.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{partner.name}</CardTitle>
                    {partner.location && (
                      <CardDescription>{partner.location}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {partner.description}
                    </p>
                    <Link to={`/partners/${partner.id}`}>
                      <Button className="w-full">View Profile</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
