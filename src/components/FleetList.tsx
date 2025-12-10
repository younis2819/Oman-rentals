import { createClient } from "@/utils/supabase/server";
import CarCard from "./CarCard";
import { Car } from "@/types";

type FleetListProps = {
  tenantId: string;
  brandColor: string;
  domain: string;
  searchParams?: {
    transmission?: string;
    category?: string;
  };
};

export default async function FleetList({
  tenantId,
  brandColor,
  domain,
  searchParams,
}: FleetListProps) {
  // 👇 FIX: Added 'await'
  const supabase = await createClient();

  const transmission = searchParams?.transmission;
  const category = searchParams?.category;

  // 1. Build the base query
  let query = supabase
    .from("fleet")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("daily_rate_omr", { ascending: true });

  // 2. Apply filters
  if (transmission) {
    query = query.eq("transmission", transmission);
  }

  if (category) {
    query = query.contains("features", [category]);
  }

  // 3. Run the query
  const { data: fleet, error } = await query;

  if (error) {
    console.error("Error fetching fleet:", error);
    return (
      <div className="p-4 text-red-500 text-center">
        Unable to load vehicles.
      </div>
    );
  }

  // 4. Handle Empty State
  if (!fleet || fleet.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl m-4 border border-dashed border-gray-200">
        <p>No vehicles match your filters.</p>
      </div>
    );
  }

  // 5. Render the Grid
  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-gray-800">Available Fleet</h2>
        <span className="text-sm text-gray-500">
          {fleet.length} vehicle{fleet.length === 1 ? "" : "s"}
        </span>
      </div>

      {fleet.map((car: any) => (
        <CarCard
          key={car.id}
          car={car as Car}
          // 👇 FIX: Removed 'primaryColor' AND 'domain'
        />
      ))}
    </div>
  );
}