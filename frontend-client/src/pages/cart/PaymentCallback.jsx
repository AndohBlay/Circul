import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import { paymentsApi, installmentsApi } from "../../api/payments";

const PENDING_KEY = "circul_pending_payment";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState("verifying"); // verifying | success | failed

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    let pending = null;
    try {
      pending = JSON.parse(localStorage.getItem(PENDING_KEY) || "null");
    } catch {
      pending = null;
    }

    if (!reference) {
      setState("failed");
      return;
    }

    const verify = pending?.type === "installment"
      ? installmentsApi.verifySchedulePayment({ reference, schedule_id: pending.schedule_id })
      : paymentsApi.verifyFull({ reference });

    verify
      .then(() => {
        setState("success");
        localStorage.removeItem(PENDING_KEY);
      })
      .catch(() => setState("failed"));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="mx-auto max-w-md px-5 sm:px-8 py-20 text-center">
        {state === "verifying" && (
          <>
            <Loader2 size={32} className="text-amber animate-spin mx-auto mb-4" />
            <h1 className="font-display text-xl text-text mb-1">Confirming your payment…</h1>
            <p className="text-text-muted text-sm">This will just take a moment.</p>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle2 size={36} className="text-mint mx-auto mb-4" />
            <h1 className="font-display text-2xl text-text mb-1">Payment successful</h1>
            <p className="text-text-muted text-sm mb-6">Your order has been confirmed.</p>
            <Link
              to="/dashboard"
              className="inline-flex px-5 py-2.5 rounded-full bg-amber text-ink text-sm font-medium hover:bg-amber-dim transition-colors"
            >
              Go to dashboard
            </Link>
          </>
        )}

        {state === "failed" && (
          <>
            <XCircle size={36} className="text-coral mx-auto mb-4" />
            <h1 className="font-display text-2xl text-text mb-1">We couldn't confirm that payment</h1>
            <p className="text-text-muted text-sm mb-6">
              If you were charged, it should reflect shortly — otherwise, please try again.
            </p>
            <Link to="/dashboard" className="text-amber text-sm hover:underline">
              Back to dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
