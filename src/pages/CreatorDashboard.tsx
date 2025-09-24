import Navigation from "@/components/Navigation";
import CreatorDashboard from "@/components/CreatorDashboard";

const CreatorDashboardPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <CreatorDashboard />
      </div>
    </div>
  );
};

export default CreatorDashboardPage;
