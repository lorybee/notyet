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
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileSettingsFormProps {
  userId: string;
  onDisplayNameUpdate?: (name: string) => void;
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

export const ProfileSettingsForm = ({ userId, onDisplayNameUpdate }: ProfileSettingsFormProps) => {
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState({ displayName: "", city: "", industry: "" });
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
        const loadedData = {
          displayName: data.display_name || "",
          city: data.city || "",
          industry: data.industry || ""
        };
        setDisplayName(loadedData.displayName);
        setCity(loadedData.city);
        setIndustry(loadedData.industry);
        setOriginalData(loadedData);
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
    setJustSaved(false);
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

      const newData = {
        displayName: displayName.trim(),
        city,
        industry
      };
      setOriginalData(newData);
      setHasChanges(false);
      setJustSaved(true);

      // Notify parent component of display name update
      if (onDisplayNameUpdate) {
        onDisplayNameUpdate(displayName.trim());
      }

      toast({
        title: "Profile updated",
        description: "Your profile settings have been saved successfully.",
      });

      // Hide success message after 5 seconds
      setTimeout(() => setJustSaved(false), 5000);
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

  // Check for changes
  useEffect(() => {
    const changed = 
      displayName !== originalData.displayName ||
      city !== originalData.city ||
      industry !== originalData.industry;
    setHasChanges(changed);
    if (changed) setJustSaved(false);
  }, [displayName, city, industry, originalData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {justSaved && (
        <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Profile saved successfully! Your changes have been applied.
          </AlertDescription>
        </Alert>
      )}

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
        <Button onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {hasChanges ? "Save Changes" : "No Changes"}
            </>
          )}
        </Button>
        {!hasChanges && !justSaved && originalData.city && (
          <p className="text-sm text-muted-foreground flex items-center">
            All changes saved
          </p>
        )}
      </div>
    </div>
  );
};
