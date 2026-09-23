import { useMemo, useState, useEffect } from "react";
import { useSearch } from "wouter";
import {
  useListTutors,
  useListSubjects,
  type ListTutorsParams,
} from "@workspace/api-client-react";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TutorCard } from "@/components/tutor-card";

const DAYS = [
  { value: "any", label: "Any day" },
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
];

export default function Tutors() {
  const search = useSearch();
  const initialParams = useMemo(() => {
    const sp = new URLSearchParams(search);
    return {
      subject: sp.get("subject") ?? "all",
    };
  }, [search]);

  const [q, setQ] = useState("");
  const [subject, setSubject] = useState<string>(initialParams.subject);
  const [day, setDay] = useState<string>("any");
  const [sort, setSort] = useState<string>("default");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("any");

  useEffect(() => {
    setSubject(initialParams.subject);
  }, [initialParams.subject]);

  const { data: subjects = [] } = useListSubjects();

  const params: ListTutorsParams = {
    ...(q && { q }),
    ...(subject !== "all" && { subject }),
    ...(day !== "any" && {
      day: day as ListTutorsParams["day"],
    }),
    ...(sort !== "default" && {
      sort: sort as ListTutorsParams["sort"],
    }),
    ...(maxPrice && !Number.isNaN(Number(maxPrice)) && {
      maxPrice: Number(maxPrice),
    }),
    ...(minRating !== "any" && { minRating: Number(minRating) }),
  };

  const { data: tutors = [], isLoading } = useListTutors(params);

  const clearFilters = () => {
    setQ("");
    setSubject("all");
    setDay("any");
    setSort("default");
    setMaxPrice("");
    setMinRating("any");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
          Browse Tutors
        </h1>
        <p className="text-muted-foreground">
          {tutors.length} {tutors.length === 1 ? "tutor" : "tutors"} ready to
          help you learn.
        </p>
      </header>

      <div className="bg-card border border-card-border rounded-lg p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tutors by name, subject, keyword..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-48" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Recommended</SelectItem>
              <SelectItem value="rating">Highest rated</SelectItem>
              <SelectItem value="priceAsc">Price: low to high</SelectItem>
              <SelectItem value="priceDesc">Price: high to low</SelectItem>
              <SelectItem value="experience">Most experienced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger data-testid="select-subject">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.slug} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger data-testid="select-day">
              <SelectValue placeholder="Available day" />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger data-testid="select-rating">
              <SelectValue placeholder="Min rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any rating</SelectItem>
              <SelectItem value="4.5">4.5 and up</SelectItem>
              <SelectItem value="4.8">4.8 and up</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Max $/hr"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            data-testid="input-max-price"
          />
        </div>
        <div className="flex justify-end mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            data-testid="button-clear-filters"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Clear filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-lg" />
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-card-border rounded-lg">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-bold text-lg mb-1">No tutors match your filters</h3>
          <p className="text-muted-foreground mb-4">
            Try widening your search or clearing some filters.
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      )}
    </div>
  );
}
