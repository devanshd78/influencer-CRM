/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api, { post } from "@/lib/api";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FloatingLabelInput } from "@/components/common/FloatingLabelInput";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  HiOutlineCalendar,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiSearch,
} from "react-icons/hi";
import { Input } from "@headlessui/react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Gradient constants for table header and row hover
const TABLE_GRADIENT_FROM = "#FFA135";
const TABLE_GRADIENT_TO = "#FF7236";

interface Influencer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  socialMedia: string;
  categoryName: string;
  audienceRange: string;
  createdAt: string;
  callingcode: string;
  influencerId: string;
  isAssigned: number;
  isAccepted: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function AppliedInfluencersPage() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("id");
  const campaignName = searchParams.get("name");
  const router = useRouter();

  const GRADIENT_FROM = "#FFA135";
  const GRADIENT_TO = "#FF7236";

  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [applicantCount, setApplicantCount] = useState(0);
  const [isContracted, setIsContracted] = useState<number>(0);
  const [contractId, setContractId] = useState<string | null>(null);
  const [isAccepted, setIsAccepted] = useState<number>(0);

  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE_OPTIONS[0],
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE_OPTIONS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Influencer>("createdAt");
  const [sortOrder, setSortOrder] = useState<1 | 0>(1);

  // Contract modal state
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedInf, setSelectedInf] = useState<Influencer | null>(null);
  const [contractForm, setContractForm] = useState({
    effectiveDate: new Date().toISOString().slice(0, 10),
    brandName: "",
    influencerName: "",
    deliverable: "",
    feeAmount: "",
    paymentMethod: "",
    paymentTerms: "",
    startDate: "",
    endDate: "",
  });
  const [pdfUrl, setPdfUrl] = useState<string>("");

  // Milestone modal state
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    amount: "",
    description: "",
  });

  const handleAddMilestone = (inf: Influencer) => {
    setSelectedInf(inf);
    setMilestoneForm({ title: "", amount: "", description: "" });
    setShowMilestoneModal(true);
  };

  const handleSaveMilestone = async () => {
    if (!selectedInf) return;
    try {
      await post("milestone/create", {
        influencerId: selectedInf.influencerId,
        campaignId,
        milestoneTitle: milestoneForm.title,
        amount: milestoneForm.amount,
        milestoneDescription: milestoneForm.description,
        brandId: localStorage.getItem("brandId"),
      });
      Swal.fire("Added!", "Milestone has been added.", "success");
      setShowMilestoneModal(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add milestone.", "error");
    }
  };

  const openContractModal = (inf: Influencer) => {
    setSelectedInf(inf);
    setContractForm({
      effectiveDate: new Date().toISOString().slice(0, 10),
      brandName: "",
      influencerName: inf.name,
      deliverable: "",
      feeAmount: "",
      paymentMethod: "",
      paymentTerms: "",
      startDate: "",
      endDate: "",
    });
    setPdfUrl("");
    setShowContractModal(true);
  };

  const handleGeneratePreview = async () => {
    if (!selectedInf) return;
    try {
      const payload = {
        brandId: localStorage.getItem("brandId"),
        campaignId,
        influencerId: selectedInf.influencerId,
        effectiveDate: contractForm.effectiveDate,
        deliverableDescription: contractForm.deliverable,
        feeAmount: contractForm.feeAmount,
        term: {
          paymentMethod: contractForm.paymentMethod,
          paymentTerms: Number(contractForm.paymentTerms),
        },
        type: 0,
      };

      const response = await api.post("/contract/sendContract", payload, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      setPdfUrl(url);
      window.open(url, "_blank");
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to generate preview.", "error");
    }
  };

  const handleSendContract = async () => {
    if (!selectedInf) return;
    try {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      await post("/contract/sendContract", {
        brandId: localStorage.getItem("brandId"),
        campaignId,
        influencerId: selectedInf.influencerId,
        effectiveDate: contractForm.effectiveDate,
        deliverableDescription: contractForm.deliverable,
        feeAmount: contractForm.feeAmount,
        term: {
          paymentMethod: contractForm.paymentMethod,
          paymentTerms: Number(contractForm.paymentTerms),
        },
        type: 1,
      });
      Swal.fire("Sent!", "Contract sent to influencer.", "success");
      setShowContractModal(false);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.message || "Failed to send contract.", "error");
    }
  };

  const handleViewDetails = (inf: Influencer) => {
    router.push(`/brand/influencers/${inf._id}`);
  };

  // Fetch applicants
  useEffect(() => {
    if (!campaignId) {
      setError("No campaign selected.");
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const {
          meta: m,
          influencers: list,
          applicantCount: cnt,
          isAccepted,
          isContracted,
          contractId,
        } = await post<{
          meta: Meta;
          influencers: Influencer[];
          applicantCount: number;
          isAccepted: number;
          isContracted: number;
          contractId: string | null;
        }>("apply/list", {
          campaignId,
          page,
          limit,
          search: searchTerm.trim(),
          sortField,
          sortOrder,
        });
        setInfluencers(list);
        setApplicantCount(cnt);
        setIsAccepted(isAccepted);
        setIsContracted(isContracted);
        setContractId(contractId);
        setMeta(m);
      } catch {
        setError("Failed to load applicants.");
      } finally {
        setLoading(false);
      }
    })();
  }, [campaignId, page, limit, searchTerm, sortField, sortOrder]);

  // Sorting
  const toggleSort = (field: keyof Influencer) => {
    setPage(1);
    if (sortField === field) setSortOrder((o) => (o === 1 ? 0 : 1));
    else {
      setSortField(field);
      setSortOrder(1);
    }
  };
  const SortIndicator = ({ field }: { field: keyof Influencer }) =>
    sortField === field ? (
      sortOrder === 1 ? (
        <HiOutlineChevronDown className="inline ml-1 w-4 h-4" />
      ) : (
        <HiOutlineChevronUp className="inline ml-1 w-4 h-4" />
      )
    ) : null;

  // Render rows with gradient hover
  const rows = useMemo(
    () =>
      influencers.map((inf, idx) => (
        <TableRow
          key={inf._id}
          className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} transition-colors`}
          style={{ backgroundImage: "" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundImage = `linear-gradient(to right, ${TABLE_GRADIENT_FROM}11, ${TABLE_GRADIENT_TO}11)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundImage = "";
          }}
        >
          <TableCell>
            {inf.name}
          </TableCell>
          <TableCell>
            {inf.socialMedia}
          </TableCell>
          <TableCell>
            <Badge variant="secondary" className="capitalize">
              {inf.categoryName}
            </Badge>
          </TableCell>
          <TableCell>{inf.audienceRange}</TableCell>
          {/* <TableCell>
            <a
              href={`mailto:${inf.email}`}
              onClick={(e) => e.stopPropagation()}
              className="text-primary underline-offset-2 hover:underline"
            >
              {inf.email}
            </a>
          </TableCell>
          <TableCell>{`${inf.callingcode} ${inf.phone}`}</TableCell> */}
          <TableCell className="whitespace-nowrap">
            <HiOutlineCalendar className="inline mr-1" />
            {new Date(inf.createdAt).toLocaleDateString()}
          </TableCell>
          <TableCell className="text-center">
            {inf.isAccepted === 1 ? (
              <p>Working</p>
            ) : inf.isAssigned === 1 ? (
              <p>Pending</p>
            ) : (
              <p>Applied</p>
            )}
          </TableCell>
          {/* <TableCell className="flex space-x-2 justify-center">
            <Button
              size="sm"
              variant="outline"
              className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white hover:bg-gradient-to-r hover:from-[#FF7236] hover:to-[#FFA135] shadow-none cursor-pointer"
              onClick={() => handleViewDetails(inf)}
            >
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-gradient-to-r from-[#FF8C00] via-[#FF5E7E] to-[#D12E53] text-white cursor-pointer hover:bg-gradient-to-r hover:from-[#FF5E7E] hover:to-[#D12E53]"
              onClick={() => router.push('/brand/messages')}
            >
              Message
            </Button>
            {isContracted === 0 && (
              <Button
                size="sm"
                variant="outline"
                className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                onClick={() => openContractModal(inf)}
              >
                Send Contract
              </Button>
            )}
            {!!inf.isAccepted && (
              <Button
                size="sm"
                variant="outline"
                className="border-blue-600 text-blue-700 hover:bg-blue-50 cursor-pointer"
                onClick={() => handleAddMilestone(inf)}
              >
                Add Milestone
              </Button>
            )}
          </TableCell> */}
        </TableRow>
      )),
    [influencers, isAccepted, isContracted]
  );

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between p-4 rounded-md">
        <h1 className="text-3xl font-bold text-gray-800">
          Campaign: {campaignName || "Unknown Campaign"}
        </h1>

        <Button
          size="sm"
          variant="outline"
          className="bg-white text-gray-800 hover:bg-gray-100"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </header>

      <div className="mb-6 max-w-md">
        <div className="relative">
          <HiSearch
            className="absolute inset-y-0 left-3 my-auto text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton rows={limit} />
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <div className="bg-white rounded-md shadow-sm overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader
              className="text-white"
              style={{
                backgroundImage: `linear-gradient(to right, ${TABLE_GRADIENT_FROM}, ${TABLE_GRADIENT_TO})`,
              }}
            >
              <TableRow>
                <TableHead
                  onClick={() => toggleSort("name")}
                  className="cursor-pointer select-none font-semibold"
                >
                  {applicantCount} Influencer Applied<SortIndicator field="name" />
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("categoryName")}
                  className="cursor-pointer select-none font-semibold"
                >
                  Social Hanlde <SortIndicator field="categoryName" />
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("categoryName")}
                  className="cursor-pointer select-none font-semibold"
                >
                  Category <SortIndicator field="categoryName" />
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("audienceRange")}
                  className="cursor-pointer select-none font-semibold"
                >
                  Audience <SortIndicator field="audienceRange" />
                </TableHead>
                {/* <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Contact</TableHead> */}
                <TableHead
                  onClick={() => toggleSort("createdAt")}
                  className="cursor-pointer select-none"
                >
                  Date <SortIndicator field="createdAt" />
                </TableHead>
                <TableHead onClick={() => toggleSort("createdAt")}
                  className="cursor-pointer select-none">
                  Status
                </TableHead>
                {/* <TableHead className="text-center">Actions</TableHead> */}
              </TableRow>
            </TableHeader>

            <TableBody>
              {influencers.length > 0 ? (
                rows
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No influencers match criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center md:justify-end items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            <HiChevronLeft />
          </Button>
          <span className="text-sm">
            Page <strong>{page}</strong> of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page === meta.totalPages}
            onClick={() =>
              setPage((p) => Math.min(p + 1, meta.totalPages))
            }
          >
            <HiChevronRight />
          </Button>
        </div>
      )}

      {showContractModal && selectedInf && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50">
          <div className="max-w-xl bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-auto border-2 border-transparent rounded-md" style={{
            // the “1” is the border-image slice
            borderImage: `linear-gradient(to right, ${GRADIENT_FROM}, ${GRADIENT_TO}) 1`
          }}>
            {!pdfUrl ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Add Contract Fields</h2>
                <div className="space-y-4">
                  <FloatingLabelInput
                    id="effectiveDate"
                    label="Effective Date"
                    type="date"
                    value={contractForm.effectiveDate}
                    onChange={e => setContractForm(f => ({ ...f, effectiveDate: e.target.value }))}
                  />
                  <FloatingLabelInput
                    id="brandName"
                    label="Brand Legal Name"
                    value={contractForm.brandName}
                    onChange={e => setContractForm(f => ({ ...f, brandName: e.target.value }))}
                  />
                  <FloatingLabelInput
                    id="influencerName"
                    label="Beand Address"
                    value={contractForm.influencerName}
                    onChange={e => setContractForm(f => ({ ...f, influencerName: e.target.value }))}
                  />
                  <FloatingLabelInput
                    id="influencerName"
                    label="Influencer Legal Name"
                    value={contractForm.influencerName}
                    onChange={e => setContractForm(f => ({ ...f, influencerName: e.target.value }))}
                  />
                  <FloatingLabelInput
                    id="influencerName"
                    label="Influencer Address"
                    value={contractForm.influencerName}
                    onChange={e => setContractForm(f => ({ ...f, influencerName: e.target.value }))}
                  />
                  <FloatingLabelInput
                    id="influencerName"
                    label="Influencer Handle"
                    value={contractForm.influencerName}
                    onChange={e => setContractForm(f => ({ ...f, influencerName: e.target.value }))}
                  />
                  {/* <FloatingLabelInput
                    id="deliverable"
                    label="Contract Deliverable Terms"
                    value={contractForm.deliverable}
                    onChange={e => setContractForm(f => ({ ...f, deliverable: e.target.value }))}
                  /> */}
                  <FloatingLabelInput
                    id="feeAmount"
                    label="Budget (USD)"
                    value={contractForm.feeAmount}
                    onChange={e => setContractForm(f => ({ ...f, feeAmount: e.target.value }))}
                  />
                  {/* <FloatingLabelInput
                    id="paymentMethod"
                    label="Payment Method"
                    value={contractForm.paymentMethod}
                    onChange={e => setContractForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  /> */}
                  <div className="space-y-1">
                    <Label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700">
                      Contract Deliverable Terms
                    </Label>

                    <Textarea
                      id="paymentTerms"
                      rows={4}
                      value={contractForm.paymentTerms}
                      onChange={e =>
                        setContractForm(f => ({ ...f, paymentTerms: e.target.value }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                      focus:border-[#FFA135] focus:ring focus:ring-[#FFA135]/50 max-h-[200px]"
                      placeholder="e.g. 5 deliverables over 30 days, with final report"
                    />
                  </div>
                  
                </div>
                <div className="mt-6 flex justify-between space-x-2">
                  <Button onClick={handleGeneratePreview} className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white hover:bg-gradient-to-r hover:from-[#FF7236] hover:to-[#FFA135] shadow-none cursor-pointer">
                    Upload Contract
                  </Button>
                  <Button variant="outline" onClick={() => setShowContractModal(false)}>Cancel</Button>
                  <Button onClick={handleGeneratePreview} className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white hover:bg-gradient-to-r hover:from-[#FF7236] hover:to-[#FFA135] shadow-none cursor-pointer">
                    Generate Preview
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Contract Preview</h2>
                <iframe src={pdfUrl} className="w-full h-[60vh] rounded-md border" title="PDF Preview" />
                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => { URL.revokeObjectURL(pdfUrl); setPdfUrl(""); }}>
                    Back
                  </Button>
                  <Button onClick={handleSendContract} className="bg-gradient-to-r from-[#FFA135] to-[#FF7236] text-white hover:bg-gradient-to-r hover:from-[#FF7236] hover:to-[#FFA135] shadow-none cursor-pointer">
                    Send Contract
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showMilestoneModal && selectedInf && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Add Milestone</h2>
            <div className="space-y-4">
              <FloatingLabelInput
                id="milestoneTitle"
                label="Milestone Title"
                value={milestoneForm.title}
                onChange={e => setMilestoneForm(f => ({ ...f, title: e.target.value }))}
              />
              <FloatingLabelInput
                id="milestoneAmount"
                label="Amount"
                value={milestoneForm.amount}
                onChange={e => setMilestoneForm(f => ({ ...f, amount: e.target.value }))}
              />
              <FloatingLabelInput
                id="milestoneDesc"
                label="Milestone Description"
                value={milestoneForm.description}
                onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMilestoneModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMilestone} className="bg-green-600 text-white hover:bg-green-700">
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const LoadingSkeleton = ({
  rows,
  mobile,
}: {
  rows: number;
  mobile?: boolean;
}) => (
  <div className={`p-6 space-y-2 ${mobile ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : ""}`}>
    {Array(rows)
      .fill(0)
      .map((_, i) => (
        <Skeleton
          key={i}
          className={mobile ? "h-28 w-full rounded-md" : "h-12 w-full rounded-md"}
        />
      ))}
  </div>
);

const ErrorMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="p-6 text-center text-destructive">{children}</p>
);

