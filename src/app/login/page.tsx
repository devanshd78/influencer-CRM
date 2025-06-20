// src/components/AuthPage.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  FormEvent,
  ReactNode,
} from "react";
import { get, post } from "@/lib/api";
import Select from "react-select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FloatingLabelInput } from "@/components/common/FloatingLabelInput";

type Tab = "login" | "signup";
type Role = "brand" | "influencer";

interface Country {
  _id: string;
  countryName: string;
  callingCode: string;
  countryCode: string;
  flag: string;
}

interface CountryOption {
  value: string;
  label: string;
  country: Country;
}

// Build react-select options
const buildCountryOptions = (countries: Country[]): CountryOption[] =>
  countries.map((c) => ({
    value: c.countryCode,
    label: `${c.flag} ${c.countryName} (${c.callingCode})`,
    country: c,
  }));

const filterByCountryName = (
  option: { data: CountryOption },
  rawInput: string
) => {
  const input = rawInput.toLowerCase().trim();
  const { country } = option.data;
  return (
    country.countryName.toLowerCase().includes(input) ||
    country.countryCode.toLowerCase().includes(input) ||
    country.callingCode.includes(input.replace(/^\+/, ""))
  );
};

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [role, setRole] = useState<Role>("brand");
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await get<Country[]>("/country/getall");
        setCountries(data);
      } catch {
        console.error("Failed to fetch countries");
      }
    })();
  }, []);

  const roleBtnClass = useCallback(
    (current: Role) =>
      `w-1/2 py-2 text-sm font-medium text-center transition border rounded-md ${role === current
        ? "bg-[#ef2f5b] text-white border-[#ef2f5b]"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`,
    [role]
  );

  const FormComponent = useMemo(() => {
    if (activeTab === "login" && role === "brand") return BrandLoginForm;
    if (activeTab === "login" && role === "influencer")
      return InfluencerLoginForm;
    if (activeTab === "signup" && role === "brand")
      return (p: SignupProps) => <BrandSignupForm {...p} countries={countries} />;
    return (p: SignupProps) => (
      <InfluencerSignupForm {...p} countries={countries} />
    );
  }, [activeTab, role, countries]);

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#fff5f7] to-[#ffe8ed] flex-col justify-center px-16 h-screen sticky top-0">
        <h1 className="text-4xl font-extrabold text-[#ef2f5b] mb-2">
          ShareMitra Business Growth
        </h1>
        <p className="text-lg text-gray-700">Grow better with influencers</p>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex mb-6 rounded-full overflow-hidden border border-gray-200">
            {["login", "signup"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`flex-1 py-2 text-sm font-medium transition ${activeTab === tab
                  ? "bg-white text-[#ef2f5b]"
                  : "bg-transparent text-gray-600 hover:text-[#ef2f5b]"
                  }`}
              >
                {tab === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Dynamic Form */}
          <FormComponent setActiveTab={setActiveTab} countries={countries} />

          {/* Role Switch */}
          <div className="flex space-x-4 mt-8">
            <button
              className={roleBtnClass("brand")}
              onClick={() => setRole("brand")}
            >
              Continue with Brand
            </button>
            <button
              className={roleBtnClass("influencer")}
              onClick={() => setRole("influencer")}
            >
              Continue with Influencer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   LOGIN FORMS
   ----------------------------------------------------------------------*/
interface LoginFormProps {
  setActiveTab: (tab: Tab) => void;
}

function BrandLoginForm({ setActiveTab }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return Swal.fire("Error", "Email and password are required", "error");
    }
    setIsSubmitting(true);
    try {
      const data = await post<{ token: string; brandId: string }>(
        "/brand/login",
        { email, password }
      );
      localStorage.setItem("token", data.token);
      localStorage.setItem("brandId", data.brandId);
      Swal.fire("Success", "Logged in", "success");
      router.push("/brand/dashboard");
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Log in as Brand
      </h2>
      <FloatingLabelInput
        id="brandLoginEmail"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <FloatingLabelInput
        id="brandLoginPwd"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button
        type="submit"
        variant="default"
        className="w-full bg-[#ef2f5b] text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging In…" : "Log In as Brand"}
      </Button>
    </form>
  );
}

function InfluencerLoginForm({ setActiveTab }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return Swal.fire("Error", "Email and password are required", "error");
    }
    setIsSubmitting(true);
    try {
      const data = await post<{ token: string; influencerId: string; categoryId: string }>(
        "/influencer/login",
        { email, password }
      );
      localStorage.setItem("token", data.token);
      localStorage.setItem("influencerId", data.influencerId);
      localStorage.setItem("categoryId", data.categoryId);
      Swal.fire("Success", "Logged in", "success");
      router.push("/influencer/dashboard");
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Log in as Influencer
      </h2>
      <FloatingLabelInput
        id="infLoginEmail"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <FloatingLabelInput
        id="infLoginPwd"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button
        type="submit"
        variant="default"
        className="w-full bg-[#ef2f5b] text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging In…" : "Log In as Influencer"}
      </Button>
    </form>
  );
}

/* -------------------------------------------------------------------------
   SIGN-UP FORMS
   ----------------------------------------------------------------------*/
interface SignupProps {
  setActiveTab: (tab: Tab) => void;
  countries: Country[];
}

function BrandSignupForm({ setActiveTab, countries }: SignupProps) {
  const [brandName, setBrandName] = useState("");
  const [brandEmail, setBrandEmail] = useState("");
  const [brandPhone, setBrandPhone] = useState("");
  const [brandPassword, setBrandPassword] = useState("");
  const [brandConfirmPwd, setBrandConfirmPwd] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
    null
  );
  const [selectedCode, setSelectedCode] = useState<CountryOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countryOptions = useMemo(
    () => buildCountryOptions(countries),
    [countries]
  );
  const codeOptions = useMemo(
    () =>
      countries.map((c) => ({
        value: c.callingCode,
        label: `${c.callingCode}`,
        country: c,
      })),
    [countries]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !brandName ||
      !brandEmail ||
      !brandPhone ||
      !brandPassword ||
      !brandConfirmPwd ||
      !selectedCountry ||
      !selectedCode
    ) {
      return Swal.fire("Error", "All fields are required", "error");
    }
    if (brandPassword !== brandConfirmPwd) {
      return Swal.fire("Error", "Passwords must match", "error");
    }
    setIsSubmitting(true);
    try {
      await post("/brand/register", {
        name: brandName,
        email: brandEmail,
        phone: brandPhone,
        password: brandPassword,
        countryId: selectedCountry.country._id,
        callingId: selectedCode.country._id,
      });
      Swal.fire("Success", "Brand signed up", "success");
      setActiveTab("login");
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Brand Sign Up
      </h2>
      <FloatingLabelInput
        id="brandName"
        label="Brand Name"
        type="text"
        value={brandName}
        onChange={(e) => setBrandName(e.target.value)}
        required
      />

      <FloatingLabelInput
        id="brandEmail"
        label="Email"
        type="email"
        value={brandEmail}
        onChange={(e) => setBrandEmail(e.target.value)}
        required
      />

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="brandCode" className="text-sm text-gray-700 mb-1">
            Country Code
          </Label>
          <Select
            inputId="brandCode"
            options={codeOptions}
            placeholder="Code"
            value={selectedCode}
            onChange={(opt) => setSelectedCode(opt as CountryOption)}
            filterOption={filterByCountryName}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#F9FAFB",
                borderColor: "#E5E7EB",
              }),
            }}
            required
          />
        </div>
        <FloatingLabelInput
          id="brandPhone"
          label="Phone Number"
          type="tel"
          value={brandPhone}
          onChange={(e) => setBrandPhone(e.target.value)}
          required
        />
      </div>

      <FloatingLabelInput
        id="brandPassword"
        label="Password"
        type="password"
        value={brandPassword}
        onChange={(e) => setBrandPassword(e.target.value)}
        required
      />

      <FloatingLabelInput
        id="brandConfirmPwd"
        label="Confirm Password"
        type="password"
        value={brandConfirmPwd}
        onChange={(e) => setBrandConfirmPwd(e.target.value)}
        required
      />

      <Select
        inputId="brandCountry"
        options={countryOptions}
        placeholder="Select Country"
        value={selectedCountry}
        onChange={(opt) => setSelectedCountry(opt as CountryOption)}
        filterOption={filterByCountryName}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "#F9FAFB",
            borderColor: "#E5E7EB",
          }),
        }}
        className="mt-4"
        required
      />

      <Button
        type="submit"
        variant="default"
        className="w-full bg-[#ef2f5b] text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing Up…" : "Sign Up as Brand"}
      </Button>
    </form>
  );
}

function InfluencerSignupForm({ setActiveTab, countries }: SignupProps) {
  const [infName, setInfName] = useState("");
  const [infEmail, setInfEmail] = useState("");
  const [infPhone, setInfPhone] = useState("");
  const [infPassword, setInfPassword] = useState("");
  const [infHandle, setInfHandle] = useState("");
  const [infBio, setInfBio] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
    null
  );
  const [selectedCode, setSelectedCode] = useState<CountryOption | null>(null);
  const [interestOptions, setInterestOptions] = useState<Interest[]>([]);
  const [audienceSizeOptions, setAudienceSizeOptions] = useState<AudienceSizeOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedAudience, setSelectedAudience] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  interface Interest { _id: string; name: string }
  interface AudienceSizeOption { _id: string; range: string }

  useEffect(() => {
    get<Interest[]>("/interest/getlist").then(setInterestOptions);
    get<AudienceSizeOption[]>("/audience/getlist").then(setAudienceSizeOptions);
  }, []);

  const countryOptions = useMemo(() => buildCountryOptions(countries), [countries]);
  const codeOptions = useMemo(
    () => countries.map((c) => ({ value: c.callingCode, label: `${c.callingCode} ${c.flag}`, country: c })),
    [countries]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !infName ||
      !infEmail ||
      !infPhone ||
      !infPassword ||
      !infHandle ||
      !infBio ||
      !selectedCountry ||
      !selectedCode ||
      !selectedCategory ||
      !selectedAudience
    ) {
      return Swal.fire("Error", "All fields are required", "error");
    }
    setIsSubmitting(true);
    try {
      await post("/influencer/register", {
        name: infName,
        email: infEmail,
        password: infPassword,
        phone: infPhone,
        socialMedia: infHandle,
        categoryId: selectedCategory.value,
        audienceId: selectedAudience.value,
        bio: infBio,
        countryId: selectedCountry.country._id,
        callingId: selectedCode.country._id,
      });
      Swal.fire("Success", "Influencer signed up", "success");
      setActiveTab("login");
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Influencer Sign Up
      </h2>
      <FloatingLabelInput
        id="infName"
        label="Name"
        type="text"
        value={infName}
        onChange={(e) => setInfName(e.target.value)}
        required
      />
      <FloatingLabelInput
        id="infEmail"
        label="Email"
        type="email"
        value={infEmail}
        onChange={(e) => setInfEmail(e.target.value)}
        required
      />
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="infCode" className="text-sm text-gray-700 mb-1">
            Code
          </Label>
          <Select
            inputId="infCode"
            options={codeOptions}
            placeholder="Code"
            value={selectedCode}
            onChange={(opt) => setSelectedCode(opt as CountryOption)}
            filterOption={filterByCountryName}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#F9FAFB",
                borderColor: "#E5E7EB",
              }),
            }}
            required
          />
        </div>
        <FloatingLabelInput
          id="infPhone"
          label="Phone Number"
          type="tel"
          value={infPhone}
          onChange={(e) => setInfPhone(e.target.value)}
          required
        />
      </div>
      <FloatingLabelInput
        id="infPassword"
        label="Password"
        type="password"
        value={infPassword}
        onChange={(e) => setInfPassword(e.target.value)}
        required
      />
      <FloatingLabelInput
        id="infHandle"
        label="Social Media Handle"
        type="text"
        value={infHandle}
        onChange={(e) => setInfHandle(e.target.value)}
        required
      />

      <Select
        inputId="infCategory"
        options={interestOptions.map((i) => ({ value: i._id, label: i.name }))}
        placeholder="Select Category"
        value={selectedCategory}
        onChange={(opt) => setSelectedCategory(opt as any)}
        styles={{
          control: (base) => ({ ...base, backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }),
        }}
        className="mt-4"
        required
      />
      <Select
        inputId="infAudience"
        options={audienceSizeOptions.map((a) => ({ value: a._id, label: a.range }))}
        placeholder="Select Audience Size"
        value={selectedAudience}
        onChange={(opt) => setSelectedAudience(opt as any)}
        styles={{
          control: (base) => ({ ...base, backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }),
        }}
        className="mt-4"
        required
      />
      <Select
        inputId="infCountry"
        options={countryOptions}
        placeholder="Select Country"
        value={selectedCountry}
        onChange={(opt) => setSelectedCountry(opt as CountryOption)}
        filterOption={filterByCountryName}
        styles={{
          control: (base) => ({ ...base, backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }),
        }}
        className="mt-4"
        required
      />
      <FloatingLabelInput
        id="infBio"
        label="Short Bio"
        type="text"
        value={infBio}
        onChange={(e) => setInfBio(e.target.value)}
        required
      />

      <Button
        type="submit"
        variant="default"
        className="w-full bg-[#ef2f5b] text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing Up…" : "Sign Up as Influencer"}
      </Button>
    </form>
  );
}
