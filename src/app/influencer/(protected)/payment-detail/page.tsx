"use client";

import React, { useEffect, useState, useCallback } from "react";
import { post } from "@/lib/api"; // assumes same helper as rest of app
import Swal from "sweetalert2";
import {
    HiPlus,
    HiOutlineTrash,
    HiPencil,
    HiCheckCircle,
    HiXCircle,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// ----------------- Types -----------------
export interface BankInfo {
    accountHolder: string;
    accountNumber: string;
    ifsc?: string;
    swift?: string;
    bankName: string;
    branch?: string;
    country?: string;
}

export interface PaypalInfo {
    email: string;
    paypalId?: string;
}

export interface PaymentMethod {
    paymentId: string;
    type: 0 | 1; // 0 PayPal, 1 Bank
    bank?: BankInfo;
    paypal?: PaypalInfo;
    isDefault: boolean;
}

interface ViewResponse {
    influencerId: string;
    type: 0 | 1;
    paymentMethods: PaymentMethod[];
}

// --------------- Helpers -----------------
const toast = (icon: "success" | "error", title: string, text?: string) =>
    Swal.fire({ icon, title, text, timer: 1400, showConfirmButton: false, timerProgressBar: true });

const confirmDelete = async () => {
    const res = await Swal.fire({
        title: "Delete this payment method?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true,
    });
    return res.isConfirmed;
};
const mask = (val = "", keep = 4) => (val.length <= keep ? val : "*".repeat(val.length - keep) + val.slice(-keep));

// --------------- Page --------------------
export default function InfluencerPaymentMethodsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<PaymentMethod | null>(null);

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const influencerId =
                typeof window !== "undefined" ? localStorage.getItem("influencerId") : null;
            if (!influencerId) throw new Error("No influencerId found in localStorage");

            // get both types, merge
            const [banks, paypals] = await Promise.all([
                post<ViewResponse>("/influencer/viewPaymentByType", { influencerId, type: 1 }),
                post<ViewResponse>("/influencer/viewPaymentByType", { influencerId, type: 0 }),
            ]);

            const combined = [...banks.paymentMethods, ...paypals.paymentMethods];
            setMethods(combined);
        } catch (e: any) {
            setError(e.message || "Failed to load payment methods");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const onDelete = async (paymentId: string) => {
        try {
            if (!(await confirmDelete())) return;

            const influencerId =
                typeof window !== "undefined" ? localStorage.getItem("influencerId") : null;
            if (!influencerId) throw new Error("No influencerId found in localStorage");

            await post("/influencer/deletePaymentMethod", { paymentId, influencerId });
            toast("success", "Deleted");
            fetchAll();
        } catch (e: any) {
            toast("error", "Delete failed", e.message);
        }
    };

    const onSubmit = async (data: FormState) => {
        try {
            const influencerId =
                typeof window !== "undefined" ? localStorage.getItem("influencerId") : null;
            if (!influencerId) throw new Error("No influencerId found in localStorage");

            const endpoint = editing ? "/influencer/updatePaymentMethod" : "/influencer/addPaymentMethod";

            const payload: any = {
                influencerId, // backend gets from token too, but safe
                type: data.type,
                isDefault: data.isDefault,
                paymentId: editing?.paymentId,
            };

            if (data.type === 1) payload.bank = data.bank;
            else payload.paypal = data.paypal;

            await post(endpoint, payload);
            toast("success", editing ? "Updated" : "Added");
            setShowForm(false);
            setEditing(null);
            fetchAll();
        } catch (e: any) {
            toast("error", "Save failed", e.message);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Payment Methods</h1>
                <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-gradient-to-r from-[#FFBF00] to-[#FFDB58] text-gray-800"> <HiPlus className="mr-2" /> Add Method </Button>
            </div>

            {loading ? (
                <p>Loading…</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : methods.length === 0 ? (
                <EmptyState onAdd={() => { setEditing(null); setShowForm(true); }} />
            ) : (
                <MethodList
                    methods={methods}
                    onEdit={(m) => { setEditing(m); setShowForm(true); }}
                    onDelete={onDelete}
                />
            )}

            {showForm && (
                <PaymentForm
                    initial={editing}
                    onCancel={() => { setShowForm(false); setEditing(null); }}
                    onSubmit={onSubmit}
                />
            )}
        </div>
    );
}

// ---------------- Components -----------------
function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <Card className="max-w-md mx-auto text-center bg-white">
            <CardHeader>
                <CardTitle>No payment methods yet</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600 mb-4">Add a PayPal or Bank account to receive payouts.</p>
                <Button onClick={onAdd} className="bg-gradient-to-r from-[#FFBF00] to-[#FFDB58] text-gray-800">Add Payment Method</Button>
            </CardContent>
        </Card>
    );
}

function MethodList({ methods, onEdit, onDelete }: {
    methods: PaymentMethod[];
    onEdit: (m: PaymentMethod) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {methods.map((m) => (
                <Card key={m.paymentId} className="relative bg-white">
                    {m.isDefault && (
                        <span className="absolute right-3 top-3 inline-flex items-center text-xs font-semibold text-green-700">
                            <HiCheckCircle className="mr-1" /> Default
                        </span>
                    )}
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <span>{m.type === 1 ? "Bank" : "PayPal"}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {m.type === 1 && m.bank ? (
                            <>
                                <Row label="Account Holder" value={m.bank.accountHolder} />
                                <Row label="Account #" value={mask(m.bank.accountNumber)} />
                                {m.bank.bankName && <Row label="Bank" value={m.bank.bankName} />}
                                {m.bank.branch && <Row label="Branch" value={m.bank.branch} />}
                                {m.bank.country && <Row label="Country" value={m.bank.country} />}
                                {m.bank.ifsc && <Row label="IFSC" value={m.bank.ifsc} />}
                                {m.bank.swift && <Row label="SWIFT" value={m.bank.swift} />}
                            </>
                        ) : m.paypal ? (
                            <>
                                <Row label="Email" value={m.paypal.email} />
                                {m.paypal.paypalId && <Row label="PayPal ID" value={m.paypal.paypalId} />}
                            </>
                        ) : null}

                        <div className="flex justify-end space-x-2 pt-2">
                            <Button variant="outline" size="icon" onClick={() => onEdit(m)}>
                                <HiPencil />
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-white text-red-500"
                                size="icon"
                                onClick={() => onDelete(m.paymentId)}
                            >
                                <HiOutlineTrash />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="ml-2 font-medium text-gray-800 break-all">{value}</span>
        </div>
    );
}

// ---------------- Form -----------------
interface FormState {
    paymentId?: string;
    type: 0 | 1;
    isDefault: boolean;
    bank: BankInfo;
    paypal: PaypalInfo;
}

function PaymentForm({
    initial,
    onCancel,
    onSubmit,
}: {
    initial: PaymentMethod | null;
    onCancel: () => void;
    onSubmit: (data: FormState) => Promise<void> | void;
}) {
    const [type, setType] = useState<0 | 1>(initial?.type ?? 0);
    const [isDefault, setIsDefault] = useState<boolean>(initial?.isDefault ?? false);
    const [bank, setBank] = useState<BankInfo>({
        accountHolder: initial?.bank?.accountHolder ?? "",
        accountNumber: initial?.bank?.accountNumber ?? "",
        ifsc: initial?.bank?.ifsc ?? "",
        swift: initial?.bank?.swift ?? "",
        bankName: initial?.bank?.bankName ?? "",
        branch: initial?.bank?.branch ?? "",
        country: initial?.bank?.country ?? "",
    });
    const [paypal, setPaypal] = useState<PaypalInfo>({
        email: initial?.paypal?.email ?? "",
        paypalId: initial?.paypal?.paypalId ?? "",
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const validate = (): string | null => {
        if (type === 1) {
            if (!bank.accountHolder.trim()) return "Account holder is required";
            if (!bank.accountNumber.trim()) return "Account number is required";
            if (!bank.bankName.trim()) return "Bank name is required";
        } else {
            if (!paypal.email.trim()) return "PayPal email is required";
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const v = validate();
        if (v) {
            setErr(v);
            return;
        }
        setErr(null);
        setSaving(true);
        try {
            await onSubmit({
                paymentId: initial?.paymentId,
                type,
                isDefault,
                bank,
                paypal,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{initial ? "Edit" : "Add"} Payment Method</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={String(type)} onValueChange={(v) => setType(Number(v) as 0 | 1)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="0">PayPal</SelectItem>
                                <SelectItem value="1">Bank</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {type === 1 ? (
                        <BankFields bank={bank} setBank={setBank} />
                    ) : (
                        <PaypalFields paypal={paypal} setPaypal={setPaypal} />
                    )}

                    <div className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm border border-gray-200">
                        <Checkbox
                            checked={isDefault}
                            onCheckedChange={(checked) => setIsDefault(checked === true)}
                        />
                        <Label className="cursor-pointer text-sm text-gray-900">Make default</Label>
                    </div>


                    {err && (
                        <p className="text-sm text-red-600 flex items-center">
                            <HiXCircle className="mr-1" /> {err}
                        </p>
                    )}

                    <div className="flex justify-end space-x-3 pt-2">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving} className="bg-gradient-to-r from-[#FFBF00] to-[#FFDB58] text-gray-800">
                            {saving ? "Saving..." : initial ? "Update" : "Add"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function BankFields({ bank, setBank }: { bank: BankInfo; setBank: (b: BankInfo) => void }) {
    const update = (key: keyof BankInfo, val: string) => setBank({ ...bank, [key]: val });
    return (
        <div className="grid gap-3">
            <TextField label="Account Holder" value={bank.accountHolder} onChange={(v) => update("accountHolder", v)} required />
            <TextField label="Account Number" value={bank.accountNumber} onChange={(v) => update("accountNumber", v)} required />
            <TextField label="Bank Name" value={bank.bankName} onChange={(v) => update("bankName", v)} required />
            <TextField label="Branch" value={bank.branch ?? ""} onChange={(v) => update("branch", v)} />
            <TextField label="Country" value={bank.country ?? ""} onChange={(v) => update("country", v)} />
            <TextField label="IFSC" value={bank.ifsc ?? ""} onChange={(v) => update("ifsc", v)} />
            <TextField label="SWIFT" value={bank.swift ?? ""} onChange={(v) => update("swift", v)} />
        </div>
    );
}

function PaypalFields({ paypal, setPaypal }: { paypal: PaypalInfo; setPaypal: (p: PaypalInfo) => void }) {
    const update = (key: keyof PaypalInfo, val: string) => setPaypal({ ...paypal, [key]: val });
    return (
        <div className="grid gap-3">
            <TextField label="Email" value={paypal.email} onChange={(v) => update("email", v)} required />
            <TextField label="PayPal ID" value={paypal.paypalId ?? ""} onChange={(v) => update("paypalId", v)} />
        </div>
    );
}

function TextField({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
    return (
        <div className="space-y-1">
            <Label>
                {label}
                {required && <span className="text-red-500"> *</span>}
            </Label>
            <Input value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
    );
}
