import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { signupSchema, loginSchema, type Signup, type Login } from "@shared/schema";

export default function AuthPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("login");

  const loginForm = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<Signup>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "patient",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: Login) => {
      const res = await apiRequest("POST", "/api/login", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: Signup) => {
      const res = await apiRequest("POST", "/api/signup", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "Failed to create account",
      });
    },
  });

  const onLogin = (data: Login) => {
    loginMutation.mutate(data);
  };

  const onSignup = (data: Signup) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b" data-testid="header-auth">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary" data-testid="logo-container">
              <Pill className="w-6 h-6 text-primary-foreground" data-testid="icon-logo" />
            </div>
            <h1 className="text-3xl font-bold" data-testid="text-app-name">SmartAid</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="container max-w-md">
          <Card data-testid="card-auth">
            <CardHeader>
              <CardTitle className="text-3xl text-center" data-testid="text-auth-title">Welcome to SmartAid</CardTitle>
              <CardDescription className="text-xl text-center" data-testid="text-auth-description">
                Your Personal Medication Assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 h-14" data-testid="tabs-auth">
                  <TabsTrigger value="login" className="text-xl" data-testid="tab-login">
                    Log In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="text-xl" data-testid="tab-signup">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" data-testid="content-login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6 mt-6">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl">Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="your@email.com"
                                className="h-14 text-xl"
                                data-testid="input-login-email"
                              />
                            </FormControl>
                            <FormMessage data-testid="error-login-email" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl">Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
                                className="h-14 text-xl"
                                data-testid="input-login-password"
                              />
                            </FormControl>
                            <FormMessage data-testid="error-login-password" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-16 text-2xl"
                        disabled={loginMutation.isPending}
                        data-testid="button-login-submit"
                      >
                        {loginMutation.isPending ? "Logging in..." : "Log In"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="signup" data-testid="content-signup">
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-6 mt-6">
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl">Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="your@email.com"
                                className="h-14 text-xl"
                                data-testid="input-signup-email"
                              />
                            </FormControl>
                            <FormMessage data-testid="error-signup-email" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl">Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
                                className="h-14 text-xl"
                                data-testid="input-signup-password"
                              />
                            </FormControl>
                            <FormDescription className="text-base">At least 8 characters</FormDescription>
                            <FormMessage data-testid="error-signup-password" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl">Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                placeholder="••••••••"
                                className="h-14 text-xl"
                                data-testid="input-signup-confirm-password"
                              />
                            </FormControl>
                            <FormMessage data-testid="error-signup-confirm-password" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signupForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl">First Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="John"
                                className="h-14 text-xl"
                                data-testid="input-signup-firstname"
                              />
                            </FormControl>
                            <FormMessage data-testid="error-signup-firstname" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signupForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl">Last Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Doe"
                                className="h-14 text-xl"
                                data-testid="input-signup-lastname"
                              />
                            </FormControl>
                            <FormMessage data-testid="error-signup-lastname" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signupForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl">I am a</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14 text-xl" data-testid="select-signup-role">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="patient" className="text-xl" data-testid="option-role-patient">Patient</SelectItem>
                                <SelectItem value="caregiver" className="text-xl" data-testid="option-role-caregiver">Caregiver</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage data-testid="error-signup-role" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-16 text-2xl"
                        disabled={signupMutation.isPending}
                        data-testid="button-signup-submit"
                      >
                        {signupMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-8" data-testid="footer-auth">
        <div className="container mx-auto px-4 text-center text-lg text-muted-foreground" data-testid="text-footer">
          SmartAid - Your Personal Medication Assistant
        </div>
      </footer>
    </div>
  );
}
