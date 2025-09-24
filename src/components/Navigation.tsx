import { Button } from "@/components/ui/button";
import {
  Wallet,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Palette,
  Camera,
  Gamepad2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link, useNavigate } from "react-router-dom";
import CreateNFT from "@/components/CreateNFT";
import SearchResults from "@/components/SearchResults";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreateNFT, setShowCreateNFT] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const wallet = useWallet();
  const navigate = useNavigate();

  // Close mobile menu when clicking outside or on a link
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.querySelector("nav");
      if (nav && !nav.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent scrolling when menu is open
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const handleExploreCollections = () => {
    navigate("/collections");
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchResults(true);
      setIsMenuOpen(false);
      setShowMobileSearch(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setShowSearchResults(false);
    }
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setShowMobileSearch(false);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const getWalletAddress = () => {
    if (wallet.publicKey) {
      return `${wallet.publicKey.toString().slice(0, 4)}...${wallet.publicKey
        .toString()
        .slice(-4)}`;
    }
    return "";
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Clickable */}
            <div
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleLogoClick}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-solana rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">
                  S
                </span>
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-solana bg-clip-text text-transparent hidden sm:block">
                Solana Artisan Plaza
              </span>
              <span className="text-lg font-bold bg-gradient-solana bg-clip-text text-transparent sm:hidden">
                SAP
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              <Link
                to="/auctions"
                className="px-3 py-2 text-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all duration-200 text-sm xl:text-base font-medium"
              >
                Auctions
              </Link>

              <Link
                to="/collections"
                className="px-3 py-2 text-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all duration-200 text-sm xl:text-base font-medium"
              >
                Collections
              </Link>

              {/* Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-1 px-3 py-2 text-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-all duration-200 text-sm xl:text-base font-medium">
                    <span>Categories</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Explore Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a
                      href="#digital-art"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Palette className="w-4 h-4" />
                      <span>Digital Art</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href="#collectibles"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span>Collectibles</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href="#photography"
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Photography</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden xl:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search NFTs, collections..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden hover:bg-primary/5"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <Search className="w-4 h-4" />
              </Button>

              {/* Profile Dropdown */}
              {wallet.connected ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt="Profile" />
                        <AvatarFallback className="bg-gradient-solana text-white">
                          {wallet.publicKey
                            ? wallet.publicKey
                                .toString()
                                .slice(0, 2)
                                .toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Connected Wallet
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {getWalletAddress()}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/creator-dashboard"
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Palette className="w-4 h-4" />
                        <span>Creator Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => wallet.disconnect?.()}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:block">
                  <WalletMultiButton className="!bg-transparent !border !border-border hover:!bg-primary/10 !text-xs sm:!text-sm !h-9" />
                </div>
              )}

              <Button
                className="bg-gradient-solana hover:opacity-90 text-xs sm:text-sm px-3 sm:px-4 h-9"
                onClick={() => setShowCreateNFT(true)}
              >
                <span className="hidden sm:inline">Create NFT</span>
                <span className="sm:hidden">Create</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-primary/5"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div className="xl:hidden mt-4 pb-4 border-t border-border/50">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search NFTs, collections..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </form>
            </div>
          )}

          {/* Mobile Menu Overlay */}
          {isMenuOpen && (
            <div className="lg:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-sm z-40">
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col space-y-4">
                  <Link
                    to="/"
                    className="text-foreground hover:text-primary transition-colors py-3 border-b border-border/20 text-lg"
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                  <Link
                    to="/auctions"
                    className="text-foreground hover:text-primary transition-colors py-3 border-b border-border/20 text-lg"
                    onClick={closeMobileMenu}
                  >
                    Auctions
                  </Link>
                  <Link
                    to="/collections"
                    className="text-foreground hover:text-primary transition-colors py-3 border-b border-border/20 text-lg"
                    onClick={closeMobileMenu}
                  >
                    Collections
                  </Link>

                  {/* Mobile Categories */}
                  <div className="py-2">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Categories
                    </div>
                    <div className="space-y-2 pl-4">
                      <a
                        href="#digital-art"
                        className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2 text-base"
                        onClick={closeMobileMenu}
                      >
                        <Palette className="w-4 h-4" />
                        <span>Digital Art</span>
                      </a>
                      <a
                        href="#collectibles"
                        className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2 text-base"
                        onClick={closeMobileMenu}
                      >
                        <Gamepad2 className="w-4 h-4" />
                        <span>Collectibles</span>
                      </a>
                      <a
                        href="#photography"
                        className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2 text-base"
                        onClick={closeMobileMenu}
                      >
                        <Camera className="w-4 h-4" />
                        <span>Photography</span>
                      </a>
                    </div>
                  </div>
                  {wallet.connected && (
                    <>
                      <Link
                        to="/profile"
                        className="text-foreground hover:text-primary transition-colors py-3 border-b border-border/20 text-lg"
                        onClick={closeMobileMenu}
                      >
                        Profile
                      </Link>
                    </>
                  )}

                  {/* Mobile Wallet Button */}
                  <div className="pt-4 sm:hidden">
                    <WalletMultiButton className="!w-full !bg-transparent !border !border-border hover:!bg-primary/10" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Create NFT Modal */}
      {showCreateNFT && <CreateNFT onClose={() => setShowCreateNFT(false)} />}

      {/* Search Results Modal */}
      {showSearchResults && (
        <SearchResults
          query={searchQuery}
          onClose={() => setShowSearchResults(false)}
        />
      )}
    </>
  );
};

export default Navigation;
