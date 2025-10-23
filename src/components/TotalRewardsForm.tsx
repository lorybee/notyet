import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const TotalRewardsForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    experienceLevel: "",
    companySize: "",
    industry: "",
    city: "",
    contractType: "full-time",
    schedule: "full-time",
    workModel: "hybrid",
    grossSalary: "",
    netSalary: "",
    tenureYears: "",
    paidLeaveDays: "",
    hasMealVouchers: false,
    mealVouchersValue: "",
    hasHealthInsurance: false,
    hasLifeInsurance: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.from("compensation_data").insert({
        job_title: formData.jobTitle,
        experience_level: formData.experienceLevel,
        company_size: formData.companySize,
        industry: formData.industry,
        city: formData.city,
        country: "Romania",
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
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your compensation data has been submitted anonymously.",
      });

      // Reset form
      setFormData({
        jobTitle: "",
        experienceLevel: "",
        companySize: "",
        industry: "",
        city: "",
        contractType: "full-time",
        schedule: "full-time",
        workModel: "hybrid",
        grossSalary: "",
        netSalary: "",
        tenureYears: "",
        paidLeaveDays: "",
        hasMealVouchers: false,
        mealVouchersValue: "",
        hasHealthInsurance: false,
        hasLifeInsurance: false,
      });
    } catch (error) {
      console.error("Error submitting compensation data:", error);
      toast({
        title: "Error",
        description: "Failed to submit data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="experienceLevel">Experience Level *</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid (2-5 years)</SelectItem>
                <SelectItem value="senior">Senior (5-10 years)</SelectItem>
                <SelectItem value="lead">Lead (10+ years)</SelectItem>
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
              onValueChange={(value) => setFormData({ ...formData, companySize: value })}
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
            <Label htmlFor="workModel">Work Model</Label>
            <Select
              value={formData.workModel}
              onValueChange={(value) => setFormData({ ...formData, workModel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
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
              onChange={(e) => setFormData({ ...formData, grossSalary: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, netSalary: e.target.value })}
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
              <Label htmlFor="mealVouchersValue">Monthly Value (RON)</Label>
              <Input
                id="mealVouchersValue"
                type="number"
                value={formData.mealVouchersValue}
                onChange={(e) => setFormData({ ...formData, mealVouchersValue: e.target.value })}
                placeholder="e.g. 400"
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
