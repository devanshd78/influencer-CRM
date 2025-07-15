// src/components/AuthPage.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  FormEvent,
} from "react";
import { get, post } from "@/lib/api";
import Select from "react-select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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

// Custom filter for react-select
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

// Toast wrapper around Swal.fire
const toast = (opts: {
  icon: "success" | "error" | "warning" | "info";
  title: string;
  text?: string;
}) =>
  Swal.fire({
    ...opts,
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
  });

interface ForgotModalProps {
  role: Role;
  onClose: () => void;
}

function ForgotPasswordModal({ role, onClose }: ForgotModalProps) {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);

  // Lock scrolling while loading
  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
  }, [loading]);

  const sendOtp = async () => {
    if (!email) {
      toast({ icon: "error", title: "Email is required" });
      return;
    }
    setLoading(true);
    try {
      const endpoint =
        role === "brand"
          ? "/brand/forgot-password/send-otp"
          : "/influencer/forgot-password/send-otp";
      await post(endpoint, { email });
      toast({ icon: "success", title: "OTP sent to your email" });
      setStep("otp");
    } catch (err: any) {
      toast({
        icon: "error",
        title: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      toast({ icon: "error", title: "OTP is required" });
      return;
    }
    setLoading(true);
    try {
      const endpoint =
        role === "brand"
          ? "/brand/forgot-password/verify-otp"
          : "/influencer/forgot-password/verify-otp";
      await post(endpoint, { email, otp });
      toast({ icon: "success", title: "OTP verified" });
      setStep("reset");
    } catch (err: any) {
      toast({
        icon: "error",
        title: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPwd || !confirmPwd) {
      toast({ icon: "error", title: "All fields are required" });
      return;
    }
    if (newPwd !== confirmPwd) {
      toast({ icon: "error", title: "Passwords must match" });
      return;
    }
    setLoading(true);
    try {
      const endpoint =
        role === "brand"
          ? "/brand/forgot-password/reset"
          : "/influencer/forgot-password/reset";
      await post(endpoint, { email, otp, newPassword: newPwd });
      toast({ icon: "success", title: "Password has been reset" });
      onClose();
    } catch (err: any) {
      toast({
        icon: "error",
        title: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {step === "email" && (
          <>
            <h3 className="text-xl font-semibold mb-4 text-center">
              {role === "brand"
                ? "Brand Password Reset"
                : "Influencer Password Reset"}
            </h3>
            <FloatingLabelInput
              id="forgotEmail"
              label="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="mt-6 flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={sendOtp}
                className="px-4 py-2 rounded-md bg-[#ef2f5b] text-white hover:bg-[#d72a52]"
                disabled={loading}
              >
                {loading ? "Sending…" : "Send OTP"}
              </button>
            </div>
          </>
        )}
        {step === "otp" && (
          <>
            <h3 className="text-xl font-semibold mb-4 text-center">
              Verify OTP
            </h3>
            <FloatingLabelInput
              id="forgotOtp"
              label="OTP Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep("email")}
                className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={verifyOtp}
                className="px-4 py-2 rounded-md bg-[#ef2f5b] text-white hover:bg-[#d72a52]"
                disabled={loading}
              >
                {loading ? "Verifying…" : "Verify OTP"}
              </button>
            </div>
          </>
        )}
        {step === "reset" && (
          <>
            <h3 className="text-xl font-semibold mb-4 text-center">
              Set New Password
            </h3>
            <FloatingLabelInput
              id="newPassword"
              label="New Password"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
            />
            <FloatingLabelInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
            />
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep("otp")}
                className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={resetPassword}
                className="px-4 py-2 rounded-md bg-[#ef2f5b] text-white hover:bg-[#d72a52]"
                disabled={loading}
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface LoginFormProps {
  setActiveTab: (tab: Tab) => void;
  onForgot: () => void;
}

function BrandLoginForm({ setActiveTab, onForgot }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        icon: "error",
        title: "Email and password are required",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await post<{ token: string; brandId: string }>(
        "/brand/login",
        { email, password }
      );
      localStorage.setItem("token", data.token);
      localStorage.setItem("brandId", data.brandId);
      toast({ icon: "success", title: "Logged in" });
      router.push("/brand/dashboard");
    } catch (err: any) {
      toast({
        icon: "error",
        title: err.response?.data?.message || err.message,
      });
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
        className="mb-1"
        required
      />
      <div className="text-right">
        <button
          type="button"
          className="text-sm text-[#ef2f5b] hover:underline"
          onClick={onForgot}
        >
          Forgot password?
        </button>
      </div>
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

function InfluencerLoginForm({ setActiveTab, onForgot }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        icon: "error",
        title: "Email and password are required",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await post<{
        token: string;
        influencerId: string;
        categoryId: string;
      }>("/influencer/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("influencerId", data.influencerId);
      localStorage.setItem("categoryId", data.categoryId);
      toast({ icon: "success", title: "Logged in" });
      router.push("/influencer/dashboard");
    } catch (err: any) {
      toast({
        icon: "error",
        title: err.response?.data?.message || err.message,
      });
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
        className="mb-1"
        required
      />
      <div className="text-right">
        <button
          type="button"
          className="text-sm text-[#ef2f5b] hover:underline"
          onClick={onForgot}
        >
          Forgot password?
        </button>
      </div>
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

interface SignupProps {
  setActiveTab: (tab: Tab) => void;
  countries: Country[];
}

function BrandSignupForm({ setActiveTab, countries }: SignupProps) {
  const [step, setStep] = useState<"email" | "otp" | "form">("email");
  const [brandEmail, setBrandEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // final form fields
  const [brandName, setBrandName] = useState("");
  const [brandPhone, setBrandPhone] = useState("");
  const [brandPassword, setBrandPassword] = useState("");
  const [brandConfirmPwd, setBrandConfirmPwd] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedCode, setSelectedCode] = useState<CountryOption | null>(null);

  const countryOptions = useMemo(() => buildCountryOptions(countries), [countries]);
  const codeOptions = useMemo(
    () =>
      countries.map((c) => ({
        value: c.callingCode,
        label: `${c.callingCode}`,
        country: c,
      })),
    [countries]
  );

  const sendOtp = async () => {
    if (!brandEmail) {
      toast({ icon: "error", title: "Email is required" });
      return;
    }
    setIsSubmitting(true);
    try {
      await post("/auth/send-otp", { email: brandEmail });
      toast({ icon: "success", title: "OTP sent to your email" });
      setStep("otp");
    } catch (err: any) {
      toast({
        icon: "error",
        title: err.response?.data?.message || err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      toast({ icon: "error", title: "OTP is required" });
      return;
    }
    setIsVerifying(true);
    try {
      await post("/auth/verify-otp", { email: brandEmail, otp });
      toast({ icon: "success", title: "Email verified" });
      setStep("form");
    } catch (err: any) {
      toast({
        icon: "error",
        title: err.response?.data?.message || err.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !brandName ||
      !brandPhone ||
      !brandPassword ||
      !brandConfirmPwd ||
      !selectedCountry ||
      !selectedCode
    ) {
      toast({ icon: "error", title: "All fields are required" });
      return;
    }
    if (brandPassword !== brandConfirmPwd) {
      toast({ icon: "error", title: "Passwords must match" });
      return;
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
      toast({ icon: "success", title: "Brand signed up" });
      setActiveTab("login");
    } catch (err: any) {
      toast({
        icon: "error",
        title: err.response?.data?.message || err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "email") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Brand Sign Up</h2>
        <FloatingLabelInput
          id="brandEmail"
          label="Email"
          type="email"
          value={brandEmail}
          onChange={(e) => setBrandEmail(e.target.value)}
          required
        />
        <Button
          onClick={sendOtp}
          variant="default"
          className="w-full bg-[#ef2f5b] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending OTP…" : "Send OTP"}
        </Button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Verify Your Email</h2>
        <FloatingLabelInput
          id="brandOtp"
          label="OTP Code"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <Button
          onClick={verifyOtp}
          variant="default"
          className="w-full bg-[#ef2f5b] text-white"
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying…" : "Verify OTP"}
        </Button>
      </div>
    );
  }

  // step === "form"
  return (
    <form onSubmit={handleRegister} className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Complete Brand Profile
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
        id="brandEmailDisabled"
        label="Email"
        type="email"
        value={brandEmail}
        disabled
      />
      <div className="grid sm:grid-cols-2 gap-6">
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
  const [step, setStep] = useState<"email" | "otp" | "form">("email");
  const [infEmail, setInfEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // final form fields
  const [infName, setInfName] = useState("");
  const [infPhone, setInfPhone] = useState("");
  const [infPassword, setInfPassword] = useState("");
  const [infHandle, setInfHandle] = useState("");
  const [infBio, setInfBio] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedCode, setSelectedCode] = useState<CountryOption | null>(null);
  const [interestOptions, setInterestOptions] = useState<{ _id: string; name: string }[]>([]);
  const [audienceSizeOptions, setAudienceSizeOptions] = useState<{ _id: string; range: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{ value: string; label: string } | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    get<{ _id: string; name: string }[]>("/interest/getlist").then(setInterestOptions);
    get<{ _id: string; range: string }[]>("/audience/getlist").then(setAudienceSizeOptions);
  }, []);

  const countryOptions = useMemo(() => buildCountryOptions(countries), [countries]);
  const codeOptions = useMemo(
    () =>
      countries.map((c) => ({
        value: c.callingCode,
        label: `${c.callingCode} ${c.flag}`,
        country: c,
      })),
    [countries]
  );

  const sendOtp = async () => {
    if (!infEmail) {
      toast({ icon: "error", title: "Email is required" });
      return;
    }
    setIsSubmitting(true);
    try {
      await post("/auth/send-otp", { email: infEmail });
      toast({ icon: "success", title: "OTP sent to your email" });
      setStep("otp");
    } catch (err: any) {
      toast({
        icon: "error",
        title: err.response?.data?.message || err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      toast({ icon: "error", title: "OTP is required" });
      return;
    }
    setIsVerifying(true);
    try {
      await post("/auth/verify-otp", { email: infEmail, otp });
      toast({ icon: "success", title: "Email verified" });
      setStep("form");
    } catch (err: any) {
      toast({
        icon: "error",
        title: err.response?.data?.message || err.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !infName ||
      !infPhone ||
      !infPassword ||
      !infHandle ||
      !infBio ||
      !selectedCountry ||
      !selectedCode ||
      !selectedCategory ||
      !selectedAudience
    ) {
      toast({ icon: "error", title: "All fields are required" });
      return;
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
      toast({ icon: "success", title: "Influencer signed up" });
      setActiveTab("login");
    } catch (err: any) {
      toast({
        icon: "error",
        title: err.response?.data?.message || err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "email") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Influencer Sign Up
        </h2>
        <FloatingLabelInput
          id="infEmail"
          label="Email"
          type="email"
          value={infEmail}
          onChange={(e) => setInfEmail(e.target.value)}
          required
        />
        <Button
          onClick={sendOtp}
          variant="default"
          className="w-full bg-[#ef2f5b] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending OTP…" : "Send OTP"}
        </Button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Verify Your Email
        </h2>
        <FloatingLabelInput
          id="infOtp"
          label="OTP Code"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <Button
          onClick={verifyOtp}
          variant="default"
          className="w-full bg-[#ef2f5b] text-white"
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying…" : "Verify OTP"}
        </Button>
      </div>
    );
  }

  // step === "form"
  return (
    <form onSubmit={handleRegister} className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Complete Influencer Profile
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
        id="infEmailDisabled"
        label="Email"
        type="email"
        value={infEmail}
        disabled
      />
      <div className="grid sm:grid-cols-2 gap-6">
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
        options={interestOptions.map((i) => ({
          value: i._id,
          label: i.name,
        }))}
        placeholder="Select Category"
        value={selectedCategory}
        onChange={(opt) => setSelectedCategory(opt as any)}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "#F9FAFB",
            borderColor: "#E5E7EB",
          }),
        }}
        required
      />
      <Select
        inputId="infAudience"
        options={audienceSizeOptions.map((a) => ({
          value: a._id,
          label: a.range,
        }))}
        placeholder="Select Audience Size"
        value={selectedAudience}
        onChange={(opt) => setSelectedAudience(opt as any)}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "#F9FAFB",
            borderColor: "#E5E7EB",
          }),
        }}
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
          control: (base) => ({
            ...base,
            backgroundColor: "#F9FAFB",
            borderColor: "#E5E7EB",
          }),
        }}
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

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [role, setRole] = useState<Role>("brand");
  const [countries, setCountries] = useState<Country[]>([]);
  const [showForgot, setShowForgot] = useState(false);

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
    if (activeTab === "login" && role === "brand")
      return (props: LoginFormProps) => (
        <BrandLoginForm {...props} onForgot={() => setShowForgot(true)} />
      );
    if (activeTab === "login" && role === "influencer")
      return (props: LoginFormProps) => (
        <InfluencerLoginForm {...props} onForgot={() => setShowForgot(true)} />
      );
    if (activeTab === "signup" && role === "brand")
      return (p: SignupProps) => <BrandSignupForm {...p} countries={countries} />;
    return (p: SignupProps) => (
      <InfluencerSignupForm {...p} countries={countries} />
    );
  }, [activeTab, role, countries]);

  return (
    <>
      {/* Topbar */}
      <header className="fixed top-0 inset-x-0 bg-white shadow-md py-3 px-6 z-50">
        <div
          className="flex items-center max-w-6xl mx-auto cursor-pointer"
          onClick={() => router.push("/")}
        >
          <img
            src="/logo.png"
            alt="CollabGlam logo"
            className="h-8 w-auto"
          />
          <span className="ml-3 text-xl font-bold text-gray-800">
            CollabGlam
          </span>
        </div>
      </header>


      <div className="max-h-screen flex pt-12">
        {/* Left graphic panel (only on lg+) */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#fff5f7] to-[#ffe8ed] flex-col justify-center px-16 h-screen sticky top-12">
          {role === "brand" ? (
            <>
              <img
                src="/brand.jpg"
                alt="Brands uploading campaigns"
                className="mb-8 w-full max-w-xl rounded-lg shadow-md"
              />
              <h1 className="text-4xl font-extrabold text-[#ef2f5b] mb-2">
                Collabglam for Brands
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                Upload campaigns to boost brand awareness, drive growth, and increase sales.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>📤 Create & publish targeted campaigns in minutes</li>
                <li>🌟 Expand your reach with curated influencer matches</li>
                <li>💰 Track ROI and conversions in real time</li>
                <li>🔒 Manage all briefs, contracts, and payouts securely</li>
              </ul>
            </>
          ) : (
            <>
              <img
                src="/influencer.jpg"
                alt="Influencers applying to campaigns"
                className="mb-8 w-full max-w-xl rounded-lg shadow-md"
              />
              <h1 className="text-4xl font-extrabold text-[#ef2f5b] mb-2">
                Collabglam for Influencers
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                Discover and apply to campaigns, then collaborate directly with brands—all in one place.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>📝 Browse campaigns tailored to your niche</li>
                <li>✉️ Send applications and negotiate terms instantly</li>
                <li>💬 Message brands and coordinate details seamlessly</li>
                <li>📊 Monitor your application status and earnings</li>
              </ul>
            </>
          )}
        </div>

        {/* Auth form panel */}
        <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-md space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img src="/logo.png" alt="Collabglam logo" className="h-12" />
              <h1 className="text-2xl font-extrabold text-gray-800">Collabglam</h1>
            </div>

            {/* Tabs */}
            <div className="flex mb-6 rounded-full overflow-hidden border border-gray-200">
              {(["login", "signup"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
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
            <FormComponent
              setActiveTab={setActiveTab}
              countries={countries}
              onForgot={() => setShowForgot(true)}
            />

            {/* Role Switch */}
            <div className="flex space-x-4 mt-8">
              <button className={roleBtnClass("brand")} onClick={() => setRole("brand")}>
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

        {/* Forgot Password Modal */}
        {showForgot && <ForgotPasswordModal role={role} onClose={() => setShowForgot(false)} />}
      </div>
    </>
  );
}
