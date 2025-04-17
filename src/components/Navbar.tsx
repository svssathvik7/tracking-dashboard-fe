"use client";

import { LogOut, Plus, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import AddTruckModal from "./AddTruckModal";
import api from "../utils/api";

interface NavbarProps {
  userName?: string;
  userRole?: string;
  onAddTruck?: () => void;
}

export default function Navbar({
  userName,
  userRole,
  onAddTruck,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddTruckModalOpen, setIsAddTruckModalOpen] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const handleNoAuth = () => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      navigate("/login");
    }
  };

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = (await api.get("/health")).data;
        setIsBackendReady(response.status === true);
        console.log("Backend health check result:", response.status);
        handleNoAuth();
      } catch (error) {
        console.error("Backend health check failed:", error);
        setIsBackendReady(false);
      }
    };

    checkBackendHealth();
  }, []);

  if (!isBackendReady) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
        <p className="text-lg font-medium text-gray-900">
          Our backend is spinning up, please wait
        </p>
      </div>
    );
  }

  return (
    <nav className="z-50 fixed top-0 left-0 right-0 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold tracking-tight text-primary">
            SP
          </h1>

          <div className="md:hidden">
            <Button
              className="text-white"
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div
            className={cn(
              "md:flex items-center gap-4",
              isMobileMenuOpen
                ? "absolute top-full left-0 right-0 bg-white border-b p-4 flex flex-col space-y-2"
                : "hidden"
            )}
          >
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors duration-200 hover:text-primary",
                isActive("/") ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/track"
              className={cn(
                "text-sm font-medium transition-colors duration-200 hover:text-primary",
                isActive("/track") ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tracking
            </Link>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 md:gap-4">
          {userName && (
            <span className="hidden md:inline-block text-sm text-muted-foreground">
              Welcome, <span className="font-medium">{userName}</span>
            </span>
          )}

          <Button
            onClick={() => setIsAddTruckModalOpen(true)}
            className="flex items-center gap-1 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Truck
          </Button>
          <AddTruckModal
            isOpen={isAddTruckModalOpen}
            onClose={() => setIsAddTruckModalOpen(false)}
          />

          <Button
            variant="destructive"
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
