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
import Select, { MultiValue, SingleValue } from "react-select";
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

interface Option {
  value: string;
  label: string;
}

const buildCountryOptions = (countries: Country[]): CountryOption[] =>
  countries.map((c) => ({
    value: c.countryCode,
    label: `${c.flag} ${c.countryName}`,
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
  const [resetToken, setResetToken] = useState<string | null>(null);

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
          ? "/brand/resetotp"
          : "/influencer/sendOtp";
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
      const endpoint = role === "brand" ? "/brand/resetVerify" : "/influencer/verifyOtp";
      const res = await post(endpoint, { email, otp });

      // API sample:
      // { "message": "OTP verified", "resetToken": "<JWT>" }
      const resetTokenFromRes =
        res?.resetToken ??
        res?.data?.resetToken ??
        (typeof res === "object" && "resetToken" in res ? (res as any).resetToken : null);

      if (!resetTokenFromRes) {
        throw new Error("Verification succeeded but no resetToken returned.");
      }
      setResetToken(resetTokenFromRes);

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
  }

  const resetPassword = async () => {
    if (!newPwd || !confirmPwd) {
      toast({ icon: "error", title: "All fields are required" });
      return;
    }
    if (newPwd !== confirmPwd) {
      toast({ icon: "error", title: "Passwords must match" });
      return;
    }
    if (!resetToken) {
      toast({ icon: "error", title: "Verification expired. Please verify OTP again." });
      return;
    }

    setLoading(true);
    try {
      const endpoint = role === "brand" ? "/brand/updatePassword" : "/influencer/updatePassword";
      // If API needs email too, include it.
      await post(endpoint, { resetToken, newPassword: newPwd, confirmPassword: confirmPwd });
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
                className="
                  px-4 py-2 rounded-md
                  bg-gradient-to-r from-[#FFA135] to-[#FF7236]
                  text-white font-bold text-lg
                  transition-all duration-200 transform
                  hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E]
                  hover:scale-105
                "
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
                className="
                  px-4 py-2 rounded-md
                  bg-gradient-to-r from-[#FFA135] to-[#FF7236]
                  text-white font-bold text-lg
                  transition-all duration-200 transform
                  hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E]
                  hover:scale-105
                "
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
              className="mb-5"
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
                className="
                  px-4 py-2 rounded-md
                  bg-gradient-to-r from-[#FFA135] to-[#FF7236]
                  text-white font-bold text-lg
                  transition-all duration-200 transform
                  hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E]
                  hover:scale-105
                "
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
        Login as Brand
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
          className="
            text-sm
            bg-gradient-to-r from-[#FFA135] to-[#FF7236]
            bg-clip-text text-transparent
            hover:underline
          "
          onClick={onForgot}
        >
          Forgot password?
        </button>
      </div>
      <Button
        type="submit"
        className="
          w-full
          bg-gradient-to-r from-[#FFA135] to-[#FF7236]
          text-white font-bold text-lg
          transition-all duration-200 transform
          hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E]
          hover:scale-105
        "
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in…" : "Login"}
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
        Login as Influencer
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
          className="
            text-sm
            bg-gradient-to-r from-[#FFA135] to-[#FF7236]
            bg-clip-text text-transparent
            hover:underline
          "
          onClick={onForgot}
        >
          Forgot password?
        </button>
      </div>
      <Button
        type="submit"
        className="
          w-full
          bg-gradient-to-r from-[#FFA135] to-[#FF7236]
          text-white font-bold text-lg
          transition-all duration-200 transform
          hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E]
          hover:scale-105
        "
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging In…" : "Login"}
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

  const [brandName, setBrandName] = useState("");
  const [brandPhone, setBrandPhone] = useState("");
  const [brandPassword, setBrandPassword] = useState("");
  const [brandConfirmPwd, setBrandConfirmPwd] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedCode, setSelectedCode] = useState<CountryOption | null>(null);

  const countryOptions = useMemo(() => buildCountryOptions(countries), [countries]);
  const codeOptions: CountryOption[] = useMemo(() => {
    const opts = countries.map((c) => ({
      value: c.callingCode, // submit the dial code
      label: `${c.callingCode}`, // what user sees
      country: c,
    }));

    // Move US to top (if present)
    const usIdx = opts.findIndex((o) => o.country.countryCode === "US");
    if (usIdx > -1) {
      const [us] = opts.splice(usIdx, 1);
      opts.unshift(us);
    }
    return opts;
  }, [countries]);

  const sendOtp = async () => {
    if (!brandEmail) {
      toast({ icon: "error", title: "Email is required" });
      return;
    }
    setIsSubmitting(true);
    try {
      await post("/brand/requestOtp", { email: brandEmail });
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
      await post("/brand/verifyOtp", { email: brandEmail, otp });
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
        phone: brandPhone,
        email: brandEmail,
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
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Brand Sign up
        </h2>
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
          className="
            w-full
            bg-gradient-to-r from-[#FFA135] to-[#FF7236]
            text-white font-bold text-lg
            transition-all duration-200 transform
            hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E]
            hover:scale-105
          "
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
          id="brandOtp"
          label="OTP Code"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <Button
          onClick={verifyOtp}
          className="
            w-full
            bg-gradient-to-r from-[#FFA135] to-[#FF7236]
            text-white font-bold text-lg
            transition-all duration-200 transform
            hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E]
            hover:scale-105
          "
          disabled={isVerifying}
        >
          {isVerifying ? "Verifying…" : "Verify OTP"}
        </Button>
      </div>
    );
  }

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
        className="
          w-full
          bg-gradient-to-r from-[#FFA135] to-[#FF7236]
          text-white font-bold text-lg
          transition-all duration-200 transform
          hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E]
          hover:scale-105
        "
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing up…" : "Sign up"}
      </Button>
    </form>
  );
}

function InfluencerSignupForm({ setActiveTab, countries }: SignupProps) {
  /**
   *  Step management ------------------------------------------------------
   */
  const [step, setStep] = useState<"email" | "otp" | "basic" | "useful">("email");

  /**
   *  Step‑1: Email / OTP ---------------------------------------------------
   */
  const [infEmail, setInfEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  /**
   *  Step‑2: Basic Information --------------------------------------------
   */
  const [infName, setInfName] = useState("");
  const [infPhone, setInfPhone] = useState("");
  const [infPassword, setInfPassword] = useState("");
  const [infBio, setInfBio] = useState("");

  // Gender now numeric → 0 / 1 / 2
  const genderOptions: Option[] = useMemo(() => [
    { value: "0", label: "Male" },
    { value: "1", label: "Female" },
    { value: "2", label: "Other" },
  ], []);
  const [selectedGender, setSelectedGender] = useState<SingleValue<Option>>(null);

  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedCode, setSelectedCode] = useState<CountryOption | null>(null);

  /**
   *  Step‑3: Useful Information -------------------------------------------
   */
  const [interestOptions, setInterestOptions] = useState<Option[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<MultiValue<Option>>([]);
  const [audienceSizeOptions, setAudienceSizeOptions] = useState<{ _id: string; range: string }[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<{ value: string; label: string } | null>(null);

  // Platform list will come from backend
  const [platformOptions, setPlatformOptions] = useState<Option[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<SingleValue<Option>>(null);
  const [otherPlatform, setOtherPlatform] = useState("");

  const [infHandle, setInfHandle] = useState("");
  const [profileLink, setProfileLink] = useState("");
  const [malePercent, setMalePercent] = useState<number | undefined>();
  const [femalePercent, setFemalePercent] = useState<number | undefined>();

  // Age‑range list will come from backend
  const [ageOptions, setAgeOptions] = useState<Option[]>([]);
  const [selectedAgeRange, setSelectedAgeRange] = useState<SingleValue<Option>>(null);

  // at the top of your component
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profileImage) return setPreviewUrl(null);
    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);


  /**
   *  EFFECT: load dynamic lists -------------------------------------------
   */
  useEffect(() => {
    // 🗂️ Load interest categories (existing behaviour)
    get<{ _id: string; name: string }[]>("/interest/getlist").then(arr =>
      setInterestOptions(arr.map(i => ({ value: i._id, label: i.name })))
    );

    get<{ _id: string; range: string }[]>("/audience/getlist").then(setAudienceSizeOptions);

    // 🗂️ Load audience age ranges
    get<{ _id: string; range: string; audienceId: string }[]>("/audienceRange/getall")
      .then(arr =>
        setAgeOptions(
          arr.map(r => ({
            value: r.audienceId,    // <-- send this UUID
            label: r.range,
            _id: r._id,             // keep if you ever need the DB _id
          }))
        )
      );

    // 🗂️ Load platforms
    get<{ _id: string; name: string; platformId: string }[]>("/platform/getall")
      .then(arr =>
        setPlatformOptions(
          arr.map(p => ({
            value: p.platformId,    // <-- send this UUID
            label: p.name,
            _id: p._id,
          }))
        )
      );
  }, []);

  /**
   *  Country / dial‑code memo‑isation -------------------------------------
   */
  const countryOptions = useMemo(() => buildCountryOptions(countries), [countries]);
  const codeOptions = useMemo(() => countries.map(c => ({
    value: c.callingCode,
    label: `${c.callingCode} ${c.flag}`,
    country: c,
  })), [countries]);

  /** ----------------------------------------------------------------------
   *  Helper: common toasts
   */
  const error = (msg: string) => toast({ icon: "error", title: msg });
  const success = (msg: string) => toast({ icon: "success", title: msg });

  /** ----------------------------------------------------------------------
   *  STEP‑1 handlers
   */
  const sendOtp = async () => {
    if (!infEmail) return error("Email is required");

    setIsSubmitting(true);
    try {
      await post("/influencer/request-otp", { email: infEmail });
      success("OTP sent");
      setStep("otp");
    } catch (err: any) {
      error(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return error("OTP is required");

    setIsVerifying(true);
    try {
      await post("/influencer/verify-otp", { email: infEmail, otp });
      success("Email verified");
      setStep("basic");
    } catch (err: any) {
      error(err.response?.data?.message || err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  /** ----------------------------------------------------------------------
   *  STEP‑2 handler (Basic → Useful)
   */
  const nextBasic = (e: FormEvent) => {
    e.preventDefault();

    if (!infName || !infPhone || !infPassword || !selectedGender || !infBio) {
      return error("Complete all basic fields");
    }

    setStep("useful");
  };

  /** ----------------------------------------------------------------------
   *  Final registration handler
   */
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    /** 0) Validate all fields */
    if (!profileImage) return error("Profile image is required");

    // platform
    const chosenPlatform = selectedPlatform?.label || "";
    if (!chosenPlatform) return error("Select a platform");

    // profile link
    if (!profileLink.trim()) return error("Profile link is required");

    // audience ratio guards
    if (malePercent === undefined || femalePercent === undefined) {
      return error("Enter both male and female % values");
    }
    if (malePercent + femalePercent !== 100) {
      return error("Audience ratios must sum to 100%");
    }

    // Age range
    if (!selectedAgeRange) return error("Select audience age range");

    /** 1) Compose payload (FormData for multipart) */
    const fd = new FormData();
    fd.append("profileImage", profileImage);

    fd.append("name", infName);
    fd.append("email", infEmail);
    fd.append("password", infPassword);
    fd.append("phone", infPhone);
    fd.append("socialMedia", infHandle);
    fd.append("gender", String(selectedGender!.value)); // 0 / 1 / 2

    // Platform
    fd.append("platformId", selectedPlatform!.value);
    if (selectedPlatform!.label.toLowerCase() === "other") {
      fd.append("manualPlatformName", otherPlatform.trim());
    }
    // Profile + audience
    fd.append("profileLink", profileLink);
    fd.append("malePercentage", String(malePercent));
    fd.append("femalePercentage", String(femalePercent));

    // Categories (1‑3) – send array as JSON string
    fd.append("categories", JSON.stringify(selectedCategories.map(c => c.value)));
    fd.append("audienceId", selectedAudience?.value || "");

    // Age‑range + legacy audience range (if applicable)
    fd.append("audienceAgeRangeId", selectedAgeRange!.value);
    // If you later add audienceId (count‑range) field, append it here.

    // Location
    fd.append("countryId", selectedCountry?.country._id || "");
    fd.append("callingId", selectedCode?.country._id || "");

    fd.append("bio", infBio);

    /** 2) Submit */




    
    setIsSubmitting(true);
    try {
      await post("/influencer/register", fd);
      success("Influencer signed up!");
      setActiveTab("login");
    } catch (err: any) {
      error(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** ----------------------------------------------------------------------
   *  Step indicator helper
   */
  const steps = [
    { key: "email", label: "Email" },
    { key: "basic", label: "Basic Info" },
    { key: "useful", label: "Details" },
  ] as const;

  const renderStepIndicator = () => {
    // treat “otp” as “email” for the dots
    const indicatorKey = step === "otp" ? "email" : step;
    const currentIndex = steps.findIndex(s => s.key === indicatorKey);

    return (
      <div className="flex items-center justify-center space-x-4 mb-6">
        {steps.map((s, idx) => {
          const active = idx === currentIndex;
          const completed = idx < currentIndex;

          // Only allow clicking between basic <-> useful
          const canToggle =
            (step === "basic" && s.key === "useful") ||
            (step === "useful" && s.key === "basic");

          return (
            <React.Fragment key={s.key}>
              <div
                onClick={() => {
                  if (canToggle) {
                    setStep(s.key as typeof step);
                  }
                }}
                className={`
                flex items-center justify-center
                w-8 h-8 rounded-full text-sm font-medium
                ${active
                    ? "bg-[#FF7236] text-white"
                    : completed
                      ? "bg-[#FFA135] text-white"
                      : "bg-gray-200 text-gray-600"
                  }
                ${canToggle ? "cursor-pointer hover:scale-110" : ""}
              `}
              >
                {idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 ${completed ? "bg-[#FFA135]" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };


  /** ----------------------------------------------------------------------
   *  RENDER: Step‑specific UI
   */
  if (step === "email") {
    return (
      <div className="space-y-6">
        {renderStepIndicator()}
        <h2 className="text-2xl font-semibold text-center">Influencer Sign up</h2>

        <FloatingLabelInput id="infEmail" label="Email" type="email" value={infEmail} onChange={e => setInfEmail(e.target.value)} required />

        <Button onClick={sendOtp} disabled={isSubmitting} className="cursor-pointer w-full bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white font-bold text-lg transition-all duration-200 transform hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E] hover:scale-105">
          {isSubmitting ? "Sending OTP…" : "Send OTP"}
        </Button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-6">
        {renderStepIndicator()}
        <h2 className="text-2xl font-semibold text-center">Verify Your Email</h2>

        <FloatingLabelInput id="infOtp" label="Enter OTP" type="text" value={otp} onChange={e => setOtp(e.target.value)} required />

        <Button onClick={verifyOtp} disabled={isVerifying} className="cursor-pointer w-full bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white font-bold text-lg transition-all duration-200 transform hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E] hover:scale-105">
          {isVerifying ? "Verifying…" : "Verify OTP"}
        </Button>
      </div>
    );
  }

  if (step === "basic") {
    return (
      // … inside if (step === "basic") return ( …

      <form onSubmit={nextBasic} className="space-y-6">
        {renderStepIndicator()}
        <h2 className="text-2xl font-semibold text-center">Basic Information</h2>

        {/* Full Name */}
        <FloatingLabelInput
          id="infName"
          label="Full Name"
          type="text"
          value={infName}
          onChange={e => setInfName(e.target.value)}
          required
        />

        {/* Phone + Code */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 sm:col-span-4 space-y-1">
            <Select
              inputId="infCode"
              options={codeOptions}
              placeholder="Code"
              value={selectedCode}
              onChange={opt => setSelectedCode(opt)}
              styles={{ control: base => ({ ...base, backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }) }}
              required
            />
          </div>
          <div className="col-span-12 sm:col-span-8">
            <FloatingLabelInput
              id="infPhone"
              label="Phone Number"
              type="tel"
              value={infPhone}
              onChange={e => setInfPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password */}
        <FloatingLabelInput
          id="infPassword"
          label="Password"
          type="password"
          value={infPassword}
          onChange={e => setInfPassword(e.target.value)}
          required
        />

        {/* Gender */}
        <div className="space-y-1">
          <label htmlFor="infGender" className="block text-sm font-medium text-gray-700">
            Gender <span className="text-red-500">*</span>
          </label>
          <Select
            inputId="infGender"
            options={genderOptions}
            placeholder="Select Gender"
            value={selectedGender}
            onChange={opt => setSelectedGender(opt)}
            styles={{ control: base => ({ ...base, backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }) }}
            required
          />
        </div>

        {/* Country */}
        <div className="space-y-1">
          <label htmlFor="infCountry" className="block text-sm font-medium text-gray-700">
            Country <span className="text-red-500">*</span>
          </label>
          <Select
            inputId="infCountry"
            options={countryOptions}
            placeholder="Select Country"
            value={selectedCountry}
            onChange={opt => setSelectedCountry(opt)}
            filterOption={filterByCountryName}
            styles={{ control: base => ({ ...base, backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }) }}
            required
          />
        </div>

        {/* Short Bio */}
        <FloatingLabelInput
          id="infBio"
          label="Short Bio"
          type="text"
          value={infBio}
          onChange={e => setInfBio(e.target.value)}
          maxLength={150}
          required
        />

        <Button type="submit" className="cursor-pointer w-full bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white font-bold text-lg transition-all duration-200 transform hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E] hover:scale-105">
          Next
        </Button>
      </form>

    );
  }

  /** -------------------------- USEFUL step ------------------------------ */
  return (
    <form onSubmit={handleRegister} className="space-y-6">
      {renderStepIndicator()}
      <h2 className="text-2xl font-semibold text-center">Additional Details</h2>

      {/* Profile photo uploader */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Profile Image<span className="text-orange-500">*</span>
        </label>

        {/* Image preview */}
        {previewUrl && (
          <div className="w-24 h-24 mx-auto">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full object-cover rounded-full border-2 border-gray-200"
            />
          </div>
        )}

        {/* File input */}
        <label className="relative block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0] || null;
              setProfileImage(file);
            }}
            required
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="
        flex items-center justify-center
        px-4 py-2 border-2 border-dashed border-gray-300
        rounded-lg bg-gray-50 hover:border-orange-400
        hover:bg-white transition
      "
          >
            <span className="text-sm text-gray-600">
              {profileImage ? "Change Image" : "Upload Image"}
            </span>
          </div>
        </label>
      </div>


      {/* Categories */}
      <div className="space-y-2">
        <label htmlFor="infCategories" className="block text-sm font-medium text-gray-700">
          Categories <span className="text-red-500">*</span>
        </label>
        <Select
          inputId="infCategories"
          options={interestOptions}
          placeholder={`Select up to 3 categories (${selectedCategories.length}/3)`}
          isMulti
          value={selectedCategories}
          onChange={opts => setSelectedCategories((opts as MultiValue<Option>).slice(0, 3))}
          closeMenuOnSelect={false}
          classNames={{ multiValue: () => "bg-[#FFA135]/20 text-[#FF7236]" }}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="infPlatform" className="block text-sm font-medium text-gray-700">
          Platform <span className="text-red-500">*</span>
        </label>
        <Select
          inputId="infPlatform"
          options={platformOptions}
          placeholder="Select Platform"
          value={selectedPlatform}
          onChange={opt => setSelectedPlatform(opt)}
          required
        />
      </div>

      {selectedPlatform?.label.toLowerCase() === "other" && (
        <FloatingLabelInput id="otherPlatform" label="Please specify" type="text" value={otherPlatform} onChange={e => setOtherPlatform(e.target.value)} required />
      )}

      <FloatingLabelInput id="infHandle" label="Handle Name" type="text" value={infHandle} onChange={e => setInfHandle(e.target.value)} required />

      <FloatingLabelInput id="infProfileLink" label="Handl Link" type="url" value={profileLink} onChange={e => setProfileLink(e.target.value)} required />


      <Select
        inputId="infAudience"
        options={audienceSizeOptions.map((a) => ({
          value: a._id,
          label: a.range,
        }))}
        placeholder="Select Audience Size"
        value={selectedAudience}
        onChange={(opt) => setSelectedAudience(opt as any)}
        required
      />

      {/* Audience Ratio */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Audience Ratio</label>
        <div className="grid sm:grid-cols-2 gap-6">
          <FloatingLabelInput id="infMalePercent" label="Male (%)" type="number" value={malePercent ?? ""} onChange={e => { const v = e.target.value; setMalePercent(v === "" ? undefined : Number(v)); }} min={0} max={100} required />
          <FloatingLabelInput id="infFemalePercent" label="Female (%)" type="number" value={femalePercent ?? ""} onChange={e => { const v = e.target.value; setFemalePercent(v === "" ? undefined : Number(v)); }} min={0} max={100} required />
        </div>
      </div>

      {/* Age Range */}
      <div className="space-y-2">
        <label htmlFor="infAgeRange" className="block text-sm font-medium text-gray-700">
          Audience Age Range <span className="text-red-500">*</span>
        </label>
        <Select
          inputId="infAgeRange"
          options={ageOptions}
          placeholder="Select Audience Age Range"
          value={selectedAgeRange}
          onChange={opt => setSelectedAgeRange(opt)}
          required
        />
      </div>
      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="cursor-pointer w-full bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white font-bold text-lg transition-all duration-200 transform hover:bg-gradient-to-r hover:from-[#FF8C1A] hover:to-[#FF5C1E] hover:scale-105">
        {isSubmitting ? "Signing up…" : "Sign up"}
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
      `w-1/2 py-2 text-sm font-medium text-center transition border rounded-md ${role !== current
        ? "bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white border-transparent"
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
      <header className="fixed top-0 inset-x-0 bg-white shadow-md py-3 px-6 z-50">
        <div
          className="flex items-center max-w-6xl mx-auto cursor-pointer"
          onClick={() => router.push("/")}
        >
          <img src="/logo.png" alt="CollabGlam logo" className="h-8 w-auto" />
          <span className="ml-3 text-xl font-bold text-gray-800">
            CollabGlam
          </span>
        </div>
      </header>

      <div
        className="
    min-h-screen flex pt-12
    bg-gradient-to-r
      from-[#FF7241]/20
      via-[#FFA135]/40
      to-white
  "
      >

        <div className="hidden lg:flex w-1/2 flex-col justify-center items-center px-16 h-screen sticky top-12">
          {role === "brand" ? (
            <>
              <img
                src="/brand.png"
                alt="Brands uploading campaigns"
                className="mb-8 w-full max-w-xl "
              />
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gray-800 mb-2">
                CollabGlam for Brands
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                Post campaigns to boost brand awareness, drive growth, and
                increase sales.
              </p>
            </>
          ) : (
            <>
              <img
                src="/influencer.png"
                alt="Influencers applying to campaigns"
                className="mb-8 w-full max-w-xl"
              />
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gray-800 mb-2">
                CollabGlam for Influencers
              </h1>
              <p className="text-lg text-gray-700 mb-4">
                Discover and apply to campaigns, then collaborate directly with
                brands—all in one place.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col w-full lg:w-1/2 items-center justify-center px-6 py-12 space-y-8">
          {/* Logo above */}
          <div className="flex items-center justify-center space-x-3">
            <img src="/logo.png" alt="CollabGlam logo" className="h-12" />
            <h1 className="text-2xl font-extrabold text-gray-800">
              CollabGlam
            </h1>
          </div>

          {/* Form card below */}
          <div className="w-full max-w-md space-y-6 bg-white rounded-lg shadow-lg p-8">
            <FormComponent
              setActiveTab={setActiveTab}
              onForgot={() => setShowForgot(true)}
              countries={countries}
            />

            <div className="flex mb-6 rounded-full overflow-hidden border border-gray-200">
              {(["login", "signup"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium transition ${activeTab === tab
                    ? "bg-white bg-clip-text text-transparent bg-gradient-to-r from-[#FFA135] to-[#FF7236]"
                    : "bg-transparent text-gray-600 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#FFA135] hover:to-[#FF7236]"
                    }`}
                >
                  {tab === "login" ? "Login" : "Sign up"}
                </button>
              ))}
            </div>

          </div>
          <div className="flex space-x-4 w-full max-w-md justify-center">
            {
              role === "brand" ? (
                <button
                  className={roleBtnClass("influencer")}
                  onClick={() => setRole("influencer")}
                >
                  Continue as Influencer
                </button>
              ) : (

                <button
                  className={roleBtnClass("brand")}
                  onClick={() => setRole("brand")}
                >
                  Continue as Brand
                </button>
              )
            }
          </div>
        </div>


        {showForgot && (
          <ForgotPasswordModal role={role} onClose={() => setShowForgot(false)} />
        )}
      </div>
    </>
  );
}
