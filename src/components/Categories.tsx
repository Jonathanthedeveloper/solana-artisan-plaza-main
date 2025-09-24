import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Palette, Camera, Gamepad2 } from "lucide-react";
import digitalArtImage from "@/assets/digital-art.jpg";
import collectiblesImage from "@/assets/collectibles.jpg";
import photographyImage from "@/assets/photography.jpg";

const Categories = () => {
  const categories = [
    {
      id: "digital-art",
      title: "Digital Art",
      description:
        "Explore unique digital masterpieces from talented artists worldwide",
      image: digitalArtImage,
      icon: Palette,
      color: "from-purple-500 to-pink-500",
      stats: "12.5K Items",
    },
    {
      id: "collectibles",
      title: "Collectibles",
      description:
        "Rare and exclusive collectible NFTs with proven authenticity",
      image: collectiblesImage,
      icon: Gamepad2,
      color: "from-blue-500 to-cyan-500",
      stats: "8.3K Items",
    },
    {
      id: "photography",
      title: "Photography",
      description:
        "Stunning photography from professional and emerging photographers",
      image: photographyImage,
      icon: Camera,
      color: "from-green-500 to-emerald-500",
      stats: "5.7K Items",
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    // This will be connected to the backend routing
    console.log(`Navigating to ${categoryId} section`);
    document.getElementById(categoryId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="categories"
      className="py-20 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-solana bg-clip-text text-transparent">
              Explore Categories
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover unique digital assets across our curated categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className="group nft-card cursor-pointer border-0 overflow-hidden"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
                  />

                  {/* Category Icon */}
                  <div className="absolute top-4 right-4">
                    <div className="glass-card p-3 rounded-full">
                      <IconComponent className="w-6 h-6 text-foreground" />
                    </div>
                  </div>

                  {/* Stats Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="glass-card px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-foreground">
                        {category.stats}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <Button
                    variant="ghost"
                    className="group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(category.id);
                    }}
                  >
                    Explore Collection
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
