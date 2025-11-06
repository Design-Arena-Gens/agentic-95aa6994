"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";

type FormState = {
  employeeName: string;
  ebNumber: string;
  department: string;
  loanAmount: string;
  loanReason: string;
  customReason: string;
  mobileNumber: string;
};

const fixedDetails = {
  to: "The Labour Officer",
  company: "Anglo India Jute & Textile Industries Pvt. Ltd.",
  address: "West Ghoshpara Road, Jagaddal, North 24 Parganas",
  subject: "Request for Non-Refundable Loan Withdrawal against PF",
};

export default function Home() {
  const [form, setForm] = useState<FormState>({
    employeeName: "",
    ebNumber: "",
    department: "",
    loanAmount: "",
    loanReason: "House Construction",
    customReason: "",
    mobileNumber: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  const reasonText = useMemo(() => {
    if (form.loanReason === "Other") {
      return form.customReason.trim() || "Personal Reasons";
    }
    return form.loanReason;
  }, [form.customReason, form.loanReason]);

  const formattedAmount = useMemo(() => {
    const amountNumber = Number(form.loanAmount.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return form.loanAmount;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amountNumber);
  }, [form.loanAmount]);

  const currentDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  const handleInputChange = (key: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({
        ...prev,
        [key]: event.target.value,
      }));
    };

  const downloadPdf = async () => {
    if (!letterRef.current) {
      return;
    }
    setIsGenerating(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(letterRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const padding = 40;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const maxWidth = pageWidth - padding * 2;
      const maxHeight = pageHeight - padding * 2;

      let renderWidth = maxWidth;
      let renderHeight = (canvas.height * renderWidth) / canvas.width;

      if (renderHeight > maxHeight) {
        renderHeight = maxHeight;
        renderWidth = (canvas.width * renderHeight) / canvas.height;
      }

      const offsetX = (pageWidth - renderWidth) / 2;

      pdf.addImage(
        imgData,
        "PNG",
        offsetX,
        padding,
        renderWidth,
        renderHeight,
        undefined,
        "FAST"
      );
      pdf.save(`PF-Loan-Application-${form.employeeName || "Employee"}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 lg:flex-row">
        <section className="w-full rounded-xl bg-white p-8 shadow-sm lg:w-[360px]">
          <h1 className="text-2xl font-semibold text-slate-900">
            PF Loan Application Generator
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter the employee details to draft a ready-to-submit non-refundable
            PF loan application letter.
          </p>
          <form className="mt-6 flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Employee Name
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                placeholder="e.g. Riya Sen"
                value={form.employeeName}
                onChange={handleInputChange("employeeName")}
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              EB Number
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                placeholder="e.g. EB12345"
                value={form.ebNumber}
                onChange={handleInputChange("ebNumber")}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Department &amp; Designation
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                placeholder="e.g. Finance Executive"
                value={form.department}
                onChange={handleInputChange("department")}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Loan Amount
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                placeholder="e.g. 100000"
                value={form.loanAmount}
                onChange={handleInputChange("loanAmount")}
                inputMode="numeric"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Loan Reason
              <select
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                value={form.loanReason}
                onChange={handleInputChange("loanReason")}
              >
                <option>House Construction</option>
                <option>Medical Treatment</option>
                <option>Children&apos;s Education</option>
                <option>Daughter&apos;s marriage expenses</option>
                <option>Other</option>
              </select>
            </label>
            {form.loanReason === "Other" && (
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Specify Reason
                <input
                  className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                  placeholder="Describe the purpose"
                  value={form.customReason}
                  onChange={handleInputChange("customReason")}
                />
              </label>
            )}
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Mobile Number
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                placeholder="e.g. 9876543210"
                value={form.mobileNumber}
                onChange={handleInputChange("mobileNumber")}
                inputMode="numeric"
              />
            </label>
            <button
              type="button"
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              onClick={downloadPdf}
              disabled={isGenerating}
            >
              {isGenerating ? "Preparing PDF..." : "Download PDF"}
            </button>
          </form>
        </section>

        <section className="w-full grow rounded-xl bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">
                {fixedDetails.company}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                Non-Refundable PF Loan Withdrawal
              </h2>
            </div>
            <span className="text-sm font-medium text-slate-500">{currentDate}</span>
          </div>

          <div ref={letterRef} className="mt-6 space-y-6 text-[15px] leading-relaxed text-slate-800">
            <div className="space-y-1">
              <p>{fixedDetails.to}</p>
              <p>{fixedDetails.company}</p>
              <p>{fixedDetails.address}</p>
            </div>

            <div>
              <p className="font-semibold">Subject: {fixedDetails.subject}</p>
            </div>

            <div className="space-y-4">
              <p>Respected Sir/Madam,</p>
              <p>
                I, <span className="font-medium">{form.employeeName || "[Employee Name]"}</span>, EB No. {form.ebNumber || "[EB Number]"}, presently working as {form.department || "[Department & Designation]"} at {fixedDetails.company}, respectfully request the sanction of a non-refundable withdrawal against my Provident Fund account.
              </p>
              <p>
                I seek to withdraw an amount of <span className="font-medium">{formattedAmount || "[Loan Amount]"}</span> in order to meet expenses related to {reasonText || "[Purpose]"}. The requirement is both urgent and essential, and the PF withdrawal will provide the necessary financial support.
              </p>
              <p>
                I confirm that I have not availed a similar withdrawal for the same purpose in the recent past and undertake to furnish any additional documents that may be required to process my request.
              </p>
              <p>
                You are kindly requested to process my application at the earliest. Should you need any clarification, I am reachable at {form.mobileNumber || "[Mobile Number]"}.
              </p>
              <p>
                Thank you for your consideration.
              </p>
            </div>

            <div className="space-y-1 pt-4">
              <p>Yours sincerely,</p>
              <p className="font-medium">{form.employeeName || "[Employee Name]"}</p>
              <p>EB No. {form.ebNumber || "[EB Number]"}</p>
              <p>Mobile: {form.mobileNumber || "[Mobile Number]"}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
