import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface ProfileSettingsFormProps {
  userId: string;
}

const ROMANIAN_CITIES = [
  "București",
  "Cluj-Napoca",
  "Timișoara",
  "Iași",
  "Constanța",
  "Craiova",
  "Brașov",
  "Galați",
  "Ploiești",
  "Oradea",
  "Brăila",
  "Arad",
  "Pitești",
  "Sibiu",
  "Bacău",
  "Târgu Mureș",
  "Baia Mare",
  "Buzău",
  "Botoșani",
  "Satu Mare",
];

const INDUSTRIES = [
  "Technology / IT",
  "Finance / Banking",
  "Healthcare / Pharma",
  "Manufacturing",
  "Retail / E-commerce",
  "Consulting",
  "Education",
  "Media / Marketing",
  "Construction / Real Estate",
  "Telecommunications",
  "Energy / Utilities",
  "Transportation / Logistics",
  "Hospitality / Tourism",
  "Legal Services",
  "Government / Public Sector",
  "Other",
];

export const ProfileSettingsForm = ({ userId }: ProfileSettingsFormProps) => {
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, city, industry')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDisplayName(data.display_name || "");
        setCity(data.city || "");
        setIndustry(data.industry || "");
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          city: city || null,
          industry: industry || null,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile settings have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name (Optional)</Label>
        <Input
          id="displayName"
          placeholder="Enter your preferred name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          This name will be shown in your personalized welcome message.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Default City</Label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger id="city" className="bg-background">
            <SelectValue placeholder="Select your city" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {ROMANIAN_CITIES.map((cityOption) => (
              <SelectItem key={cityOption} value={cityOption}>
                {cityOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Your default city will be pre-selected in forms.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Default Industry</Label>
        <Select value={industry} onValueChange={setIndustry}>
          <SelectTrigger id="industry" className="bg-background">
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {INDUSTRIES.map((industryOption) => (
              <SelectItem key={industryOption} value={industryOption}>
                {industryOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Your default industry will be pre-selected in forms.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
