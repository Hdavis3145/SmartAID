import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, Calendar, Bell, Heart } from "lucide-react";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
              <Pill className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">SmartAid</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-6">
              Never Miss Your Medication Again
            </h2>
            <p className="text-2xl text-muted-foreground mb-8">
              SmartAid helps you track medications with smart reminders and easy pill scanning
            </p>
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="h-16 px-12 text-2xl"
              data-testid="button-login"
            >
              Log In or Sign Up
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <Pill className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Camera Scanning</CardTitle>
                <CardDescription className="text-xl">
                  Use your camera to identify medications instantly
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Smart Scheduling</CardTitle>
                <CardDescription className="text-xl">
                  Set medication times and track your daily progress
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Refill Reminders</CardTitle>
                <CardDescription className="text-xl">
                  Get notified when it's time to refill your prescriptions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Health Tracking</CardTitle>
                <CardDescription className="text-xl">
                  Log symptoms and side effects after each dose
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-lg text-muted-foreground">
          SmartAid - Your Personal Medication Assistant
        </div>
      </footer>
    </div>
  );
}
