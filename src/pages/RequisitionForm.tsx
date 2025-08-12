import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import ItemTable, { Item } from "@/components/requisition/ItemTable";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { db } from "../firebase";
import { 
  doc, 
  setDoc, 
  collection, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  query,
  getDoc 
} from "firebase/firestore";

// Firebase sequence manager
export const getRequisitionBasedSequence = async (dateStr: string): Promise<number> => {
  const prefix = `PR-${dateStr}-`;

  const q = query(
    collection(db, "requisitions"),
    where("jobOrderNo", ">=", prefix),
    where("jobOrderNo", "<", `PR-${dateStr}-\uf8ff`),
    orderBy("jobOrderNo", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return 1;
  }

  const latest = snapshot.docs[0].data().jobOrderNo;
  const parts = latest.split("-");
  const latestSeq = parseInt(parts[2], 10);

  return latestSeq + 1;
};

const RequisitionForm = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [neededDate, setNeededDate] = useState<Date | undefined>();
  const [formData, setFormData] = useState({
    projectName: "",
    jobOrderNo: "",
    jobSiteLocation: "",
    type: "",
  });
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      type: "",
      item: "",
      qty: "",
      unit: "",
      particulars: "",
      remarks: "",
    }
  ]);
  const [approvals, setApprovals] = useState({
    preparedBy: "",
    jobSiteReviewedBy: "",
    jobSiteApprovedBy: "",
    headOfficeReviewedBy: "",
    headOfficeApprovedBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isJobOrderReady, setIsJobOrderReady] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Generate sequential PR/JO number
  useEffect(() => {
    const generateJobOrderNo = async () => {
      if (!date) return;

      try {
        const dateStr = format(date, "yyyyMMdd");
        const sequence = await getRequisitionBasedSequence(dateStr);
        const sequenceStr = sequence.toString().padStart(4, "0");
        const generatedNumber = `PR-${dateStr}-${sequenceStr}`;

        setFormData((prev) => ({
          ...prev,
          jobOrderNo: generatedNumber,
        }));
        setIsJobOrderReady(true);
      } catch (error) {
        console.error("Error generating job order number:", error);
        const fallback = Date.now().toString().slice(-4);
        const dateStr = format(date, "yyyyMMdd");
        setFormData((prev) => ({
          ...prev,
          jobOrderNo: `PR-${dateStr}-${fallback}`,
        }));
        setIsJobOrderReady(true);
      }
    };

    setIsJobOrderReady(false);
    generateJobOrderNo();
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isJobOrderReady) {
      alert("Job order number is still being generated. Please wait.");
      return;
    }
    
    setSubmitError("");
    setShowPrintModal(true);
  };

  const submitToFirebase = async () => {
    setIsSubmitting(true);
    
    try {
      // Check if PR/JO number is unique
      const docId = formData.jobOrderNo.replace(/\//g, '-');
      const docRef = doc(db, "requisitions", docId);
      const docSnap = await getDoc(docRef);

      // PR/JO conflict detection
      if (docSnap.exists()) {
        throw new Error("PR_JO_CONFLICT");
      }

      // Filter out empty items
      const filteredItems = items.filter(item => 
        item.type || item.item || item.qty || item.unit || item.particulars || item.remarks
      );

      // Prepare form data
      const requisitionData = {
        ...formData,
        date: date ? date.toISOString() : null,
        neededDate: neededDate ? neededDate.toISOString() : null,
        items: filteredItems,
        approvals,
        createdAt: new Date().toISOString(),
      };
      
      // Save to Firebase
      await setDoc(docRef, requisitionData);
      
      setSuccess(true);
      resetForm();
      setTimeout(() => setSuccess(false), 3000);
      setShowPrintModal(false); // Close modal on success
    } catch (error: any) {
      console.error("Error submitting requisition:", error);
      
      // Handle specific PR/JO conflict
      if (error.message === "PR_JO_CONFLICT") {
        setSubmitError(
          "PR/JO number is already existing. Please refresh your page to get the latest PR/JO number."
        );
      } else {
        setSubmitError(`Submission failed: ${error.message}`);
        setShowPrintModal(false); // Close modal for other errors
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = () => {
    const newItem: Item = {
      id: `${Date.now()}`,
      type: "",
      item: "",
      qty: "",
      unit: "",
      particulars: "",
      remarks: "",
    };
    setItems([...items, newItem]);
  };

  const handleClearAllItems = () => {
    setItems([
      {
        id: `${Date.now()}`,
        type: "",
        item: "",
        qty: "",
        unit: "",
        particulars: "",
        remarks: "",
      }
    ]);
  };

  const handleDownloadPDF = async () => {
    if (!formRef.current) return;
    setLoading(true);

    try {
      const canvas = await html2canvas(formRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a5");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 5;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio,
      );

      const fileName = `Purchase_Requisition_${formData.jobOrderNo || "Form"}_${format(date || new Date(), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      jobOrderNo: "",
      jobSiteLocation: "",
      type: "",
    });
    setItems([
      {
        id: `${Date.now()}`,
        type: "",
        item: "",
        qty: "",
        unit: "",
        particulars: "",
        remarks: "",
      },
    ]);
    setApprovals({
      preparedBy: "",
      jobSiteReviewedBy: "",
      jobSiteApprovedBy: "",
      headOfficeReviewedBy: "",
      headOfficeApprovedBy: "",
    });
    setDate(new Date());
    setNeededDate(undefined);
  };

  return (
    <div id="print-content" className="container mx-auto py-4 px-2 bg-background max-w-[148mm]">
      {/* Print Confirmation Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="font-bold text-lg mb-4">Confirm Submission</h3>
            
            {/* PR/JO Conflict Error */}
            {submitError.includes("already existing") ? (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                <p className="font-semibold">PR/JO Number Conflict</p>
                <p className="mb-3">{submitError}</p>
                <Button
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page Now
                </Button>
              </div>
            ) : submitError ? (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {submitError}
              </div>
            ) : (
              <p className="mb-4 text-red-600 font-bold">
                ⚠️ IMPORTANT — PLEASE READ BEFORE SUBMITTING ⚠️<br /><br />
                Please print a copy of your requisition form using <strong>Ctrl + P</strong> before submitting.<br />
                The <strong>IT Department will NOT reprint</strong> any document once submitted.<br />
                Double-check all entries — the <strong>PR/JO number must always be unique</strong>.<br />
                Any duplicate or incorrect information is the sole responsibility of the submitter.
              </p>
            )}
            
            <div className="flex justify-end gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSubmitError("");
                  setShowPrintModal(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              {!submitError.includes("already existing") && (
                <Button 
                  onClick={submitToFirebase}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Already Printed, Submit"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <Card className="w-full" ref={formRef}>
        <CardHeader className="bg-white border-b-2 border-black py-3">
          <div className="text-center space-y-1">
            <div className="text-sm font-bold uppercase tracking-wide">
              CITIMAX GROUP INC.
            </div>
            <div className="text-xs">ORE CENTRAL TOWER, FORT BONIFACIO TAGUIG CITY.</div>
            <div className="text-base font-bold uppercase mt-1">
              PURCHASE REQUISITION
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <form onSubmit={handleSubmit}>
            {/* Form Header Fields */}
            <div className="grid grid-cols-12 gap-2 mb-2">
              <div className="col-span-8">
                <div className="flex items-center space-x-1">
                  <Label className="font-semibold min-w-fit text-xs">
                    Company Name:
                  </Label>
                  <div className="flex-1 border-b border-black">
                    <Input
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      className="border-0 border-b border-black rounded-none px-1 py-0 h-5 text-xs"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center space-x-1">
                  <Label className="font-semibold min-w-fit text-xs">Date:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex-1 flex items-center border-b border-black">
                        <Input
                          readOnly
                          value={date ? format(date, "dd-MMM-yyyy") : ""}
                          className="border-0 rounded-none px-1 py-0 h-5 text-xs focus:ring-0 focus:border-black flex-1"
                          placeholder="Select date"
                        />
                        <CalendarIcon className="h-3 w-3 ml-1" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        required
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 mb-2">
              <div className="col-span-6">
                <div className="flex items-center space-x-1">
                  <Label className="font-semibold min-w-fit text-xs">PR/JO No.:</Label>
                  <div className="flex-1 border-b border-black font-semibold">
                    <Input
                      name="jobOrderNo"
                      value={formData.jobOrderNo}
                      onChange={handleInputChange}
                      className="border-0 border-b border-black rounded-none px-1 py-0 h-5 text-xs font-bold focus:ring-0 focus:border-black"
                      placeholder="Auto-generated"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex items-center space-x-1">
                  <Label className="font-semibold min-w-fit text-xs">Needed:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex-1 flex items-center border-b border-black">
                        <Input
                          readOnly
                          value={neededDate ? format(neededDate, "dd-MMM-yyyy") : ""}
                          className="border-0 rounded-none px-1 py-0 h-5 text-xs focus:ring-0 focus:border-black flex-1"
                          placeholder="Select date"
                        />
                        <CalendarIcon className="h-3 w-3 ml-1" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={neededDate}
                        onSelect={setNeededDate}
                        initialFocus
                        required
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-center space-x-1">
                <Label className="font-semibold min-w-fit text-xs">
                  Job Site/Location:
                </Label>
                <div className="flex-1 border-b border-black">
                  <Input
                    name="jobSiteLocation"
                    value={formData.jobSiteLocation}
                    onChange={handleInputChange}
                    className="border-0 border-b border-black rounded-none px-1 py-0 h-5 text-xs focus:ring-0 focus:border-black"
                    placeholder="Enter job site/location"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Items Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Requisition Items</h3>
                <div className="flex gap-1">
                  <Button
                    onClick={handleAddItem}
                    variant="outline"
                    className="flex items-center gap-1 print:hidden px-2 py-1 text-xs"
                    type="button"
                  >
                    <Plus className="h-3 w-3" />
                    Add Item
                  </Button>
                  <Button
                    onClick={handleClearAllItems}
                    variant="destructive"
                    className="flex items-center gap-1 print:hidden px-2 py-1 text-xs"
                    type="button"
                    disabled={items.length === 0}
                  >
                    <Trash className="h-3 w-3" />
                    Clear All
                  </Button>
                </div>
              </div>
              <div className="text-xs">
                <ItemTable 
                  items={items} 
                  onChange={(newItems) => setItems(newItems)} 
                />
              </div>
            </div>

            <Separator className="my-2" />

            {/* Approval Section */}
            <div className="space-y-1">
              <div className="flex w-full">
                <div className="w-3/5 text-center font-semibold text-xs">Job Site</div>
                <div className="w-2/5 text-center font-semibold text-xs">Head Office</div>
              </div>

              <div className="flex w-full border border-black">
                <div className="w-1/5 flex flex-col">
                  <div className="h-6 flex items-center justify-center border-b border-black">
                    <Label className="text-[14px] font-semibold">Prepared By:</Label>
                  </div>
                  <Input
                    value={approvals.preparedBy}
                    onChange={(e) => setApprovals(prev => ({ ...prev, preparedBy: e.target.value }))}
                    className="border-0 rounded-none text-2xs h-8 text-center focus-visible:ring-0"
                    required
                  />
                </div>

                <div className="w-1/5 flex flex-col border-l border-black">
                  <div className="h-6 flex items-center justify-center border-b border-black px-1">
                    <Label className="text-[14px] font-semibold text-center leading-tight">
                      Reviewed By:
                    </Label>
                  </div>

                  <Input
                    value={approvals.jobSiteReviewedBy}
                    onChange={(e) => setApprovals(prev => ({ ...prev, jobSiteReviewedBy: e.target.value }))}
                    className="border-0 rounded-none text-2xs h-8 text-center focus-visible:ring-0"
                  />
                </div>

                <div className="w-1/5 flex flex-col border-l border-black">
                  <div className="h-6 flex items-center justify-center border-b border-black">
                    <Label className="text-[14px]font-semibold">Noted By:</Label>
                  </div>
                  <Input
                    value={approvals.jobSiteApprovedBy}
                    onChange={(e) => setApprovals(prev => ({ ...prev, jobSiteApprovedBy: e.target.value }))}
                    className="border-0 rounded-none text-2xs h-8 text-center focus-visible:ring-0"
                  />
                </div>

                <div className="w-2/5 flex flex-col border-l border-black">
                  <div className="h-6 flex items-center justify-center border-b border-black">
                    <Label className="text-[14px] font-semibold">Approved By:</Label>
                  </div>
                  <Input
                    value={approvals.headOfficeApprovedBy}
                    onChange={(e) => setApprovals(prev => ({ ...prev, headOfficeApprovedBy: e.target.value }))}
                    className="border-0 rounded-none text-2xs h-8 text-center focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="text-2xs text-left mt-1">
                Form No: {formData.jobOrderNo || 'Form No. Missing'}
              </div>
            </div>
            
            {/* Logo Footer - Optimized */}
            <div className="mt-3 flex justify-between items-center gap-0.5">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <div key={num} className="flex-1 flex justify-center">
                  <img
                    src={`/logos/logo${num}.jpg`}
                    alt={`Company Logo ${num}`}
                    className="object-contain h-8 w-auto mx-auto"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end space-x-2 print:hidden">
              <Button 
                variant="outline" 
                type="button"
                disabled={loading || isSubmitting}
                onClick={resetForm}
                className="px-2 py-1 text-xs"
              >
                Reset
              </Button>
              {/* Print Button Added Here */}
              <Button 
                type="button"
                onClick={() => window.print()}
                className="px-2 py-1 text-xs flex items-center gap-1"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button 
                type="submit"
                disabled={loading || !isJobOrderReady || isSubmitting}
                className="px-2 py-1 text-xs"
              >
                {loading ? "Generating..." : "Submit Requisition"}
              </Button>
            </div>

            {success && (
              <div className="mt-2 p-1 bg-green-100 text-green-700 rounded text-xs">
                Requisition submitted! ID: {formData.jobOrderNo}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequisitionForm;