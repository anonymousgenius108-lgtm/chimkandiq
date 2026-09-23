import { useListFeaturedTutors, useListSubjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Star, ArrowRight, BookOpen, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featuredTutors, isLoading: isLoadingTutors } = useListFeaturedTutors();
  const { data: subjects, isLoading: isLoadingSubjects } = useListSubjects();

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 max-w-3xl leading-tight">
            Find the perfect study partner.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl">
            Expert tutors from top universities ready to help you master any subject. Book a session today and elevate your learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/tutors" className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-8 text-sm font-medium text-accent-foreground shadow transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Browse All Tutors
            </Link>
            <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-md border border-primary-foreground/20 bg-transparent px-8 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl font-bold text-foreground">Top-Rated Tutors</h2>
          <Link href="/tutors" className="text-primary hover:text-primary/80 font-medium flex items-center gap-1">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingTutors ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTutors?.map(tutor => (
              <Link key={tutor.id} href={`/tutors/${tutor.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-border/50 overflow-hidden group">
                  <div className="h-32 bg-secondary relative">
                    <img 
                      src={tutor.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${tutor.name}`} 
                      alt={tutor.name}
                      className="absolute -bottom-10 left-6 w-20 h-20 rounded-full border-4 border-card object-cover bg-muted"
                    />
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-sm font-medium flex items-center gap-1 text-foreground">
                      <Star className="w-3 h-3 fill-accent text-accent" /> {tutor.rating.toFixed(1)}
                    </div>
                  </div>
                  <CardContent className="pt-14 pb-6 px-6">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{tutor.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{tutor.headline}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{tutor.subjects.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{tutor.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <span className="font-bold text-foreground">${tutor.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/hr</span></span>
                      <span className="text-xs text-muted-foreground">{tutor.reviewCount} reviews</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Browse by Subject */}
      <section className="max-w-5xl mx-auto px-6 py-16 bg-secondary/30 rounded-3xl mb-16">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-8 text-center">Browse by Subject</h2>
        
        {isLoadingSubjects ? (
          <div className="flex flex-wrap justify-center gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-10 w-32 rounded-full" />)}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {subjects?.map(subject => (
              <Link key={subject.slug} href={`/tutors?subject=${subject.slug}`}>
                <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-background border border-border shadow-sm text-sm font-medium hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  {subject.name} <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{subject.tutorCount}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
