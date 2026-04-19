import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Building2, MapPin, Mail, Phone, Globe, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Partner {
  id: string;
  name: string;
  type: string;
  description: string;
  logo_url: string;
  location: string;
  contact_email: string;
  contact_phone: string;
  website: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string;
}

export default function PartnerDetail() {
  const { id } = useParams();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPartner();
      fetchEvents();
    }
  }, [id]);

  const fetchPartner = async () => {
    try {
      const { data, error } = await supabase
        .from('community_partners')
        .select('*')
        .eq('id', id)
        .eq('is_approved', true)
        .single();

      if (error) throw error;
      setPartner(data);
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

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_events')
        .select('*')
        .eq('partner_id', id)
        .eq('is_approved', true)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
    }
  };

  if (loading || !partner) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center">Loading partner details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start gap-6">
                {partner.logo_url && (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-6 h-6 text-primary" />
                    <CardTitle className="text-3xl">{partner.name}</CardTitle>
                  </div>
                  <Badge className="mb-4">{partner.type}</Badge>
                  <p className="text-muted-foreground">{partner.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {partner.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{partner.location}</span>
                </div>
              )}
              {partner.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${partner.contact_email}`} className="hover:underline">
                    {partner.contact_email}
                  </a>
                </div>
              )}
              {partner.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${partner.contact_phone}`} className="hover:underline">
                    {partner.contact_phone}
                  </a>
                </div>
              )}
              {partner.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {partner.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No upcoming events</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      {event.image_url && (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(event.event_date), 'PPP')}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{event.description}</p>
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
