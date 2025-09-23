import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Loader } from 'lucide-react';
import { useStore } from '../store/useStore';
import { mockApi } from '../utils/mockApi';

export const EventsList: React.FC = () => {
  const { events, isLoading, setEvents, setLoading } = useStore();

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const eventsData = await mockApi.getEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [setEvents, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-f1-red mx-auto mb-4" size={48} />
          <p className="text-f1-gray">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4 f1-accent">
            F1 Events
          </h1>
          <p className="text-xl text-f1-gray max-w-2xl mx-auto">
            Select your race weekend and experience the pinnacle of motorsport
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {events.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <p className="text-f1-gray text-lg">No events available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface EventCardProps {
  event: any;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => (
  <div className="bg-f1-dark rounded-lg overflow-hidden border border-white/10 hover:border-f1-red/50 transition-all duration-300 group">
    {/* Event Image */}
    <div className="relative h-48 overflow-hidden">
      <img
        src={event.imageUrl}
        alt="F1 Circuit with Aerial Display"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      
      {/* Status badge */}
      <div className="absolute top-4 left-4">
        <span className="bg-success text-white px-3 py-1 rounded-full text-sm font-medium">
          Available
        </span>
      </div>
    </div>

    {/* Event Content */}
    <div className="p-6">
      <h3 className="text-2xl font-display font-semibold text-white mb-3 group-hover:text-f1-red transition-colors">
        {event.name}
      </h3>
      
      <div className="space-y-2 mb-6">
        <div className="flex items-center space-x-3 text-f1-gray">
          <Calendar size={18} className="text-f1-red" />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center space-x-3 text-f1-gray">
          <MapPin size={18} className="text-f1-red" />
          <span>{event.venue}</span>
        </div>
      </div>

      {/* Pricing info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-f1-gray">Starting from</div>
          <div className="text-2xl font-bold text-white">$79</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-f1-gray">Premium seats</div>
          <div className="text-lg font-semibold text-white">$299</div>
        </div>
      </div>

      {/* CTA Button */}
      <Link
        to={`/event/${event.id}`}
        className="w-full bg-f1-red hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 group"
      >
        <span>Select Seats</span>
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </div>
);