import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Phone, Mail, Users, Trash2, Star, Edit2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Caregiver } from "@shared/schema";

const caregiverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  relationship: z.string().min(1, "Please select a relationship"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email().optional().or(z.literal("")),
  isPrimary: z.number().min(0).max(1).optional(),
});

type CaregiverFormData = z.infer<typeof caregiverSchema>;

export default function Caregivers() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null);
  const { toast } = useToast();

  const { data: caregivers = [], isLoading } = useQuery<Caregiver[]>({
    queryKey: ["/api/caregivers"],
  });

  const form = useForm<CaregiverFormData>({
    resolver: zodResolver(caregiverSchema),
    defaultValues: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
      isPrimary: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CaregiverFormData) => {
      return apiRequest("/api/caregivers", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/caregivers"] });
      toast({
        title: "Caregiver Added",
        description: "The caregiver has been added successfully.",
      });
      setIsFormOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add caregiver. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CaregiverFormData }) => {
      return apiRequest(`/api/caregivers/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/caregivers"] });
      toast({
        title: "Caregiver Updated",
        description: "The caregiver has been updated successfully.",
      });
      setIsFormOpen(false);
      setEditingCaregiver(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update caregiver. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/caregivers/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/caregivers"] });
      toast({
        title: "Caregiver Removed",
        description: "The caregiver has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove caregiver. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CaregiverFormData) => {
    if (editingCaregiver) {
      updateMutation.mutate({ id: editingCaregiver.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (caregiver: Caregiver) => {
    setEditingCaregiver(caregiver);
    form.reset({
      name: caregiver.name,
      relationship: caregiver.relationship,
      phone: caregiver.phone,
      email: caregiver.email || "",
      isPrimary: caregiver.isPrimary,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this caregiver?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingCaregiver(null);
    form.reset();
  };

  const relationshipOptions = [
    "Daughter",
    "Son",
    "Spouse",
    "Partner",
    "Sister",
    "Brother",
    "Friend",
    "Neighbor",
    "Healthcare Aide",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="p-6 pb-4">
          <h1 className="text-[32px] font-bold" data-testid="text-page-title">
            My Caregivers
          </h1>
          <p className="text-[20px] text-muted-foreground mt-1">
            Manage your caregiver contacts
          </p>
        </div>

        <div className="px-6 space-y-6">
          {/* Add New Button */}
          {!isFormOpen && (
            <Button
              onClick={() => setIsFormOpen(true)}
              className="w-full min-h-[64px] text-[22px]"
              data-testid="button-add-caregiver"
            >
              <Plus className="w-8 h-8 mr-2" />
              Add New Caregiver
            </Button>
          )}

          {/* Add/Edit Form */}
          {isFormOpen && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[24px] font-bold">
                  {editingCaregiver ? "Edit Caregiver" : "Add New Caregiver"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  data-testid="button-cancel-form"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[20px]">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John Smith"
                            className="min-h-[56px] text-[20px]"
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[20px]">Relationship</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="min-h-[56px] text-[20px]"
                              data-testid="select-relationship"
                            >
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {relationshipOptions.map((option) => (
                              <SelectItem
                                key={option}
                                value={option}
                                className="text-[20px]"
                              >
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[20px]">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="555-123-4567"
                            className="min-h-[56px] text-[20px]"
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[20px]">
                          Email (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="john@example.com"
                            className="min-h-[56px] text-[20px]"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="flex-1 min-h-[56px] text-[20px]"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-save-caregiver"
                    >
                      {editingCaregiver ? "Update" : "Add"} Caregiver
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1 min-h-[56px] text-[20px]"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </Card>
          )}

          {/* Caregivers List */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-[20px] text-muted-foreground">
                Loading caregivers...
              </p>
            </div>
          ) : caregivers.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-[22px] font-semibold mb-2">No Caregivers Yet</h3>
              <p className="text-[18px] text-muted-foreground">
                Add your first caregiver contact to get started
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {caregivers.map((caregiver) => (
                <Card
                  key={caregiver.id}
                  className="p-6"
                  data-testid={`card-caregiver-${caregiver.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-[22px] font-bold" data-testid="text-caregiver-name">
                          {caregiver.name}
                        </h3>
                        {caregiver.isPrimary === 1 && (
                          <Badge className="bg-primary text-primary-foreground min-h-[32px] px-3 text-[16px]">
                            <Star className="w-4 h-4 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-[18px] text-muted-foreground mb-3">
                        {caregiver.relationship}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[18px]">
                          <Phone className="w-5 h-5 text-primary" />
                          <a
                            href={`tel:${caregiver.phone}`}
                            className="text-primary hover:underline"
                            data-testid="link-phone"
                          >
                            {caregiver.phone}
                          </a>
                        </div>
                        {caregiver.email && (
                          <div className="flex items-center gap-2 text-[18px]">
                            <Mail className="w-5 h-5 text-primary" />
                            <a
                              href={`mailto:${caregiver.email}`}
                              className="text-primary hover:underline"
                              data-testid="link-email"
                            >
                              {caregiver.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(caregiver)}
                        className="min-h-[48px] min-w-[48px]"
                        data-testid="button-edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(caregiver.id)}
                        className="min-h-[48px] min-w-[48px] text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        data-testid="button-delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
