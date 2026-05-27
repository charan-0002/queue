import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Smartphone, ShieldCheck, Activity, Users, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text_main font-body selection:bg-accent/20">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://static.prod-images.emergentagent.com/jobs/8f442c6c-9759-432d-981b-e978b2819e7e/images/1e4a095a1e7f247ee7f4365c5e52c2af9a7d8a5431841c33808c3e1edb563e98.png")' }}
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs tracking-[0.15em] uppercase text-text_muted font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-heatmap_status-low mr-2 animate-pulse"></span>
              Live Hospital Wayfinding
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-primary font-medium mb-6">
              Trust the Process.<br />
              <span className="text-accent">Skip the Waiting Room.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-text_muted mb-10 max-w-2xl leading-relaxed">
              Real-time OPD queue tracking, secure remote check-ins, and live hospital congestion heatmaps. 
              Designed to reduce cognitive load under stress.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-none bg-accent hover:bg-accent-hover text-white font-medium" data-testid="hero-checkin-btn">
                <Link to="/checkin">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Remote Check-In
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-none border-accent text-accent hover:bg-accent hover:text-white" data-testid="hero-heatmap-btn">
                <Link to="/heatmap">
                  <MapPin className="mr-2 h-5 w-5" />
                  View Live Heatmap
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPOSITION (BENTO GRID) ─── */}
      <section className="py-20 px-6 bg-surface_muted">
        <div className="container mx-auto">
          <div className="mb-12 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight text-primary font-medium mb-4">
              A calmer healthcare experience
            </h2>
            <p className="text-text_muted text-lg">
              We replace chaotic waiting rooms with predictable, transparent digital queues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Patient Focused Card (Large) */}
            <div className="md:col-span-8 group relative overflow-hidden bg-surface border border-border">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity group-hover:opacity-60"
                   style={{ backgroundImage: 'url("https://images.pexels.com/photos/26244207/pexels-photo-26244207.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940")' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent"></div>
              
              <div className="relative p-12 h-full flex flex-col justify-center">
                <Activity className="h-8 w-8 text-accent mb-6" />
                <h3 className="text-xl sm:text-2xl font-medium text-primary mb-4">Patient Check-in Flow</h3>
                <p className="text-text_muted mb-8 max-w-md leading-relaxed">
                  Join the queue from home using a simple SMS or WhatsApp message. 
                  Arrive exactly when it's your turn, reducing stress and exposure.
                </p>
                <Button asChild variant="link" className="p-0 h-auto justify-start font-medium" data-testid="patient-learn-more">
                  <Link to="/checkin">
                    Start flow <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Admin Focused Card */}
            <div className="md:col-span-4 bg-primary text-surface p-12 flex flex-col justify-between">
              <div>
                <ShieldCheck className="h-8 w-8 text-surface/80 mb-6" />
                <h3 className="text-xl sm:text-2xl font-medium mb-4">Admin Dashboard</h3>
                <p className="text-surface_muted/80 leading-relaxed">
                  Dense, high-contrast control room for hospital staff. 
                  Manage patient flow with precision.
                </p>
              </div>
              <div className="mt-12">
                <Button asChild variant="outline" className="w-full rounded-none border-surface/30 text-surface hover:bg-surface hover:text-primary" data-testid="admin-login-btn">
                  <Link to="/admin/login">
                    Staff Login
                  </Link>
                </Button>
              </div>
            </div>

            {/* Minor feature cards */}
            <Card className="md:col-span-4 rounded-none border-border">
              <CardHeader className="p-8">
                <MapPin className="h-6 w-6 text-heatmap_status-medium mb-4" />
                <CardTitle className="text-xl">Live Heatmaps</CardTitle>
                <CardDescription className="text-base mt-2">
                  Visualize hospital congestion in real-time before you step out of the door.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="md:col-span-4 rounded-none border-border">
              <CardHeader className="p-8">
                <Clock className="h-6 w-6 text-heatmap_status-low mb-4" />
                <CardTitle className="text-xl">Zero Guesswork</CardTitle>
                <CardDescription className="text-base mt-2">
                  Track your exact position in the queue with down-to-the-minute accuracy.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="md:col-span-4 rounded-none border-border">
              <CardHeader className="p-8">
                <Users className="h-6 w-6 text-primary mb-4" />
                <CardTitle className="text-xl">Digital Wayfinding</CardTitle>
                <CardDescription className="text-base mt-2">
                  Clear, highly legible tracking screens inspired by airport departure boards.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── STAFF PERSPECTIVE ─── */}
      <section className="py-24 px-6 border-t border-border bg-surface">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="text-xs tracking-[0.15em] uppercase text-text_muted font-medium mb-4">
                Hospital Infrastructure
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight text-primary font-medium mb-6">
                Engineered for maximum screen real estate and efficiency.
              </h2>
              <p className="text-text_muted text-lg mb-8 leading-relaxed">
                Our admin tools ditch soft shadows and excessive padding in favor of a 
                dense "Control Room Grid" utilizing 1px solid borders. This allows staff 
                to see exactly what they need at a glance.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-mono text-primary font-medium mb-2">99%</div>
                  <div className="text-sm text-text_muted">Reduction in lobby congestion</div>
                </div>
                <div>
                  <div className="text-3xl font-mono text-primary font-medium mb-2">1px</div>
                  <div className="text-sm text-text_muted">Structured data layout</div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="relative aspect-video border border-border bg-surface_muted overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-80"
                     style={{ backgroundImage: 'url("https://images.pexels.com/photos/33812023/pexels-photo-33812023.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940")' }}>
                </div>
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                {/* Mock UI Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-surface/95 backdrop-blur p-6 border border-border flex justify-between items-center">
                  <div>
                    <div className="text-xs tracking-wider uppercase text-text_muted font-medium mb-1">Queue Status</div>
                    <div className="text-xl font-heading text-primary font-medium">Cardiology OPD</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-mono text-heatmap_status-low font-medium">Normal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-primary text-surface py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-heading text-xl font-medium tracking-wide">
            DocQueue
          </div>
          <div className="text-sm text-surface_muted/60">
            &copy; 2026 DocQueue Healthcare Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
