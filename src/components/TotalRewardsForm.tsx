import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

interface TotalRewardsFormProps {
  onSubmitSuccess?: () => void;
}

export const TotalRewardsForm = ({ onSubmitSuccess }: TotalRewardsFormProps = {}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [needsDisplayName, setNeedsDisplayName] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobFamily: "",
    experienceLevel: "" as Database['public']['Enums']['experience_level_enum'] | "",
    companySize: "" as Database['public']['Enums']['company_size_enum'] | "",
    industry: "",
    country: "Romania",
    city: "",
    contractType: null as Database['public']['Enums']['contract_type_enum'] | null,
    schedule: null as Database['public']['Enums']['schedule_enum'] | null,
    workModel: null as Database['public']['Enums']['work_model_enum'] | null,
    grossSalary: "",
    netSalary: "",
    tenureYears: "",
    paidLeaveDays: "",
    hasMealVouchers: false,
    mealVouchersValue: "",
    hasHealthInsurance: false,
    hasLifeInsurance: false,
  });

  // Load existing user data on mount and when component remounts
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if user has a profile with display name
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, anonymous_compensation_id")
          .eq("user_id", user.id)
          .single();

        if (!profile?.display_name) {
          setNeedsDisplayName(true);
          setIsLoadingData(false);
          return;
        }

        setDisplayName(profile.display_name);

        // Load compensation data using anonymous ID
        if (profile.anonymous_compensation_id) {
          const { data: existingComp } = await supabase
            .from("compensation_data")
            .select("*")
            .eq("anonymous_id", profile.anonymous_compensation_id)
            .maybeSingle();

          if (existingComp) {
            setFormData({
              jobTitle: existingComp.job_title || "",
              jobFamily: "", // Not stored in DB yet
              experienceLevel: existingComp.experience_level || "",
              companySize: existingComp.company_size || "",
              industry: existingComp.industry || "",
              country: existingComp.country || "Romania",
              city: existingComp.city || "",
              contractType: existingComp.contract_type || null,
              schedule: existingComp.schedule || null,
              workModel: existingComp.work_model || null,
              grossSalary: existingComp.gross_salary?.toString() || "",
              netSalary: existingComp.net_salary?.toString() || "",
              tenureYears: existingComp.tenure_years?.toString() || "",
              paidLeaveDays: existingComp.paid_leave_days?.toString() || "",
              hasMealVouchers: existingComp.has_meal_vouchers || false,
              mealVouchersValue: existingComp.meal_vouchers_value?.toString() || "",
              hasHealthInsurance: existingComp.has_health_insurance || false,
              hasLifeInsurance: existingComp.has_life_insurance || false,
            });
          }
        }
      } catch (error) {
        console.error("Error loading existing data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadExistingData();
  }, []); // Keep empty array - component will remount with new key

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.companySize || !formData.experienceLevel || !formData.jobTitle || 
          !formData.industry || !formData.city || !formData.grossSalary || !formData.netSalary) {
        throw new Error("Please fill in all required fields");
      }

      // Validate company size is one of the allowed values
      const validCompanySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];
      if (!validCompanySizes.includes(formData.companySize)) {
        throw new Error("Invalid company size selected");
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to submit compensation data");
      }

      // If display name is needed, save it first
      if (needsDisplayName) {
        if (!displayName.trim()) {
          throw new Error("Please enter a display name");
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ display_name: displayName.trim() })
          .eq("user_id", user.id);

        if (profileError) {
          if (profileError.code === '23505') { // Unique constraint violation
            throw new Error("This display name is already taken. Please choose another one.");
          }
          throw profileError;
        }

        setNeedsDisplayName(false);
      }

      // Get user's anonymous compensation ID from profile
      const { data: profile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("anonymous_compensation_id, display_name")
        .eq("user_id", user.id)
        .single();

      if (profileFetchError) throw profileFetchError;
      if (!profile?.anonymous_compensation_id) {
        throw new Error("Anonymous ID not found. Please try again.");
      }

      // Check if user already has compensation data
      const { data: existingData } = await supabase
        .from("compensation_data")
        .select("id")
        .eq("anonymous_id", profile.anonymous_compensation_id)
        .maybeSingle();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from("compensation_data")
          .update({
            job_title: formData.jobTitle,
            experience_level: formData.experienceLevel,
            company_size: formData.companySize,
            industry: formData.industry,
            city: formData.city,
            country: formData.country,
            contract_type: formData.contractType,
            schedule: formData.schedule,
            work_model: formData.workModel,
            gross_salary: parseFloat(formData.grossSalary),
            net_salary: parseFloat(formData.netSalary),
            tenure_years: formData.tenureYears ? parseInt(formData.tenureYears) : null,
            paid_leave_days: formData.paidLeaveDays ? parseInt(formData.paidLeaveDays) : null,
            has_meal_vouchers: formData.hasMealVouchers,
            meal_vouchers_value: formData.mealVouchersValue ? parseFloat(formData.mealVouchersValue) : null,
            has_health_insurance: formData.hasHealthInsurance,
            has_life_insurance: formData.hasLifeInsurance,
          })
          .eq("id", existingData.id);

        if (error) throw error;
      } else {
        // Insert new record with anonymous ID
        const { error } = await supabase.from("compensation_data").insert([{
          anonymous_id: profile.anonymous_compensation_id,
          job_title: formData.jobTitle,
          experience_level: formData.experienceLevel,
          company_size: formData.companySize,
          industry: formData.industry,
          city: formData.city,
          country: formData.country,
          contract_type: formData.contractType,
          schedule: formData.schedule,
          work_model: formData.workModel,
          gross_salary: parseFloat(formData.grossSalary),
          net_salary: parseFloat(formData.netSalary),
          tenure_years: formData.tenureYears ? parseInt(formData.tenureYears) : null,
          paid_leave_days: formData.paidLeaveDays ? parseInt(formData.paidLeaveDays) : null,
          has_meal_vouchers: formData.hasMealVouchers,
          meal_vouchers_value: formData.mealVouchersValue ? parseFloat(formData.mealVouchersValue) : null,
          has_health_insurance: formData.hasHealthInsurance,
          has_life_insurance: formData.hasLifeInsurance,
        }]);

        if (error) throw error;
      }

      // Update user's profile with city and industry
      await supabase
        .from("profiles")
        .update({
          city: formData.city,
          industry: formData.industry,
        })
        .eq("user_id", user.id);

      toast({
        title: "Success!",
        description: existingData 
          ? "Your compensation data has been updated." 
          : `Your data has been submitted anonymously as "${profile.display_name}"`,
      });

      // Navigate to benchmarks tab after short delay
      if (onSubmitSuccess) {
        setTimeout(() => {
          onSubmitSuccess();
        }, 1500);
      }

      // Keep form populated after successful submit - don't reset
    } catch (error: any) {
      console.error("Error submitting compensation data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading your data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {needsDisplayName && (
        <Card className="p-6 border-primary">
          <h3 className="text-lg font-semibold mb-2">Choose Your Display Name</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This name will be used to identify your compensation data anonymously. 
            Your email address will never be linked to your submitted data.
          </p>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. TechPro2024"
              required
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              This must be unique and cannot be changed later
            </p>
          </div>
        </Card>
      )}

      {displayName && !needsDisplayName && (
        <Card className="p-4 bg-muted/50">
          <p className="text-sm">
            <span className="text-muted-foreground">Submitting as:</span>{" "}
            <span className="font-semibold">{displayName}</span>
          </p>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Job Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              placeholder="e.g. Software Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobFamily">Job Family *</Label>
            <Select
              value={formData.jobFamily}
              onValueChange={(value) => setFormData({ ...formData, jobFamily: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job family" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="HR">Human Resources</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="Customer Success">Customer Success</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceLevel">Experience Level *</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value) => setFormData({ ...formData, experienceLevel: value as Database['public']['Enums']['experience_level_enum'] })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entry Level (0-2 years)">Entry Level (0-2 years)</SelectItem>
                <SelectItem value="Junior (2-5 years)">Junior (2-5 years)</SelectItem>
                <SelectItem value="Mid-Level (5-10 years)">Mid-Level (5-10 years)</SelectItem>
                <SelectItem value="Senior (10+ years)">Senior (10+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => setFormData({ ...formData, industry: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IT">IT & Software</SelectItem>
                <SelectItem value="Finance">Finance & Banking</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companySize">Company Size *</Label>
            <Select
              value={formData.companySize}
              onValueChange={(value) => setFormData({ ...formData, companySize: value as Database['public']['Enums']['company_size_enum'] })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="500+">500+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData({ ...formData, country: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Romania">Romania</SelectItem>
                <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                <SelectItem value="Poland">Poland</SelectItem>
                <SelectItem value="Hungary">Hungary</SelectItem>
                <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => setFormData({ ...formData, city: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bucharest">Bucharest</SelectItem>
                <SelectItem value="Cluj-Napoca">Cluj-Napoca</SelectItem>
                <SelectItem value="Timișoara">Timișoara</SelectItem>
                <SelectItem value="Iași">Iași</SelectItem>
                <SelectItem value="Brașov">Brașov</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractType">Contract Type *</Label>
            <Select
              value={formData.contractType || ""}
              onValueChange={(value) => setFormData({ ...formData, contractType: value as Database['public']['Enums']['contract_type_enum'] })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contract type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workModel">Work Model</Label>
            <Select
              value={formData.workModel || ""}
              onValueChange={(value) => setFormData({ ...formData, workModel: value as Database['public']['Enums']['work_model_enum'] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select work model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="On-site">On-site</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Compensation</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grossSalary">Gross Salary (RON/month) *</Label>
            <Input
              id="grossSalary"
              type="number"
              value={formData.grossSalary}
              onChange={(e) => {
                const grossValue = e.target.value;
                const netValue = grossValue ? (parseFloat(grossValue) * 0.585).toFixed(2) : "";
                setFormData({ ...formData, grossSalary: grossValue, netSalary: netValue });
              }}
              placeholder="e.g. 10000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="netSalary">Net Salary (RON/month) *</Label>
            <Input
              id="netSalary"
              type="number"
              value={formData.netSalary}
              onChange={(e) => {
                const netValue = e.target.value;
                const grossValue = netValue ? (parseFloat(netValue) / 0.585).toFixed(2) : "";
                setFormData({ ...formData, netSalary: netValue, grossSalary: grossValue });
              }}
              placeholder="e.g. 6000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenureYears">Years at Current Company</Label>
            <Input
              id="tenureYears"
              type="number"
              value={formData.tenureYears}
              onChange={(e) => setFormData({ ...formData, tenureYears: e.target.value })}
              placeholder="e.g. 3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidLeaveDays">Paid Leave Days/Year</Label>
            <Input
              id="paidLeaveDays"
              type="number"
              value={formData.paidLeaveDays}
              onChange={(e) => setFormData({ ...formData, paidLeaveDays: e.target.value })}
              placeholder="e.g. 25"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Benefits</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="hasMealVouchers">Meal Vouchers</Label>
            <Switch
              id="hasMealVouchers"
              checked={formData.hasMealVouchers}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, hasMealVouchers: checked })
              }
            />
          </div>

          {formData.hasMealVouchers && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="mealVouchersValue">Daily Value (RON)</Label>
              <Input
                id="mealVouchersValue"
                type="number"
                value={formData.mealVouchersValue}
                onChange={(e) => setFormData({ ...formData, mealVouchersValue: e.target.value })}
                placeholder="e.g. 20"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="hasHealthInsurance">Health Insurance</Label>
            <Switch
              id="hasHealthInsurance"
              checked={formData.hasHealthInsurance}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, hasHealthInsurance: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="hasLifeInsurance">Life Insurance</Label>
            <Switch
              id="hasLifeInsurance"
              checked={formData.hasLifeInsurance}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, hasLifeInsurance: checked })
              }
            />
          </div>
        </div>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Submit Anonymously"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        Your data is anonymized and encrypted. We never link submissions to user accounts.
      </p>
    </form>
  );
};
