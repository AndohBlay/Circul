import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";
import { ordersApi } from "../../api/orders";
import { paymentsApi, installmentsApi } from "../../api/payments";

const PENDING_KEY = "circul_pending_payment";
const FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
];

export default function Checkout() {
  const { items, totalPrice, clear } = useCart();
  const navigate = useNavigate();

  const [paymentType, setPaymentType] = useState("full");
  const [totalInstallments, setTotalInstallments] = useState(3);
  const [downPayment, setDownPayment] = useState(Math.round(totalPrice * 0.3));
  const [frequency, setFrequency] = useState("monthly");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const remaining = Math.max(0, totalPrice - downPayment);
  const perInstallment =
    totalInstallments > 1 ? (remaining / (totalInstallments - 1)).toFixed(2) : "0.00";

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // 1. Create the order from the cart
      const { data: orderData } = await ordersApi.create({
        payment_type: paymentType,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      const orderId = orderData.order.id;

      if (paymentType === "full") {
        // 2a. Initialize full payment
        const { data } = await paymentsApi.initializeFull({ order_id: orderId });
        localStorage.setItem(
          PENDING_KEY,
          JSON.stringify({ type: "full", order_id: orderId, reference: data.reference })
        );
        clear();
        window.location.href = data.payment_url;
        return;
      }

      // 2b. Create the installment plan, then initialize the down payment
      const { data: planData } = await installmentsApi.createPlan({
        order_id: orderId,
        total_installments: Number(totalInstallments),
        down_payment: Number(downPayment),
        frequency,
      });
      const firstSchedule = planData.plan.schedules[0];

      const { data: payData } = await installmentsApi.initializeSchedulePayment(firstSchedule.id);
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({
          type: "installment",
          order_id: orderId,
          schedule_id: firstSchedule.id,
          reference: payData.reference,
        })
      );
      clear();
      window.location.href = payData.payment_url;
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't start checkout. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <div className="mx-auto max-w-xl px-5 sm:px-8 py-12">
        <p className="font-mono text-xs tracking-widest text-amber uppercase mb-2">Checkout</p>
        <h1 className="font-display text-3xl font-semibold text-text mb-8">Checkout</h1>

        <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
          <div className="divide-y divide-border">
            {items.map((i) => (
              <div key={i.product_id} className="flex justify-between py-2 text-sm">
                <span className="text-text-muted">
                  {i.name} <span className="text-text-faint">× {i.quantity}</span>
                </span>
                <span className="font-mono text-text">GHS {(i.price * i.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-3 mt-2 border-t border-border">
            <span className="text-text font-medium">Total</span>
            <span className="font-mono text-amber text-lg">GHS {totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handlePay} className="space-y-6">
          <div>
            <span className="font-body text-sm text-text-muted mb-2 block">How do you want to pay?</span>
            <div className="grid grid-cols-2 gap-3">
              <PaymentTypeOption
                label="Pay in full"
                active={paymentType === "full"}
                onClick={() => setPaymentType("full")}
              />
              <PaymentTypeOption
                label="Installments"
                active={paymentType === "installment"}
                onClick={() => setPaymentType("installment")}
              />
            </div>
          </div>

          {paymentType === "installment" && (
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
              <div>
                <label className="font-body text-sm text-text-muted mb-1.5 block">
                  Number of installments
                </label>
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={totalInstallments}
                  onChange={(e) => setTotalInstallments(e.target.value)}
                  className="w-full rounded-lg bg-ink border border-border px-4 py-2.5 text-text font-mono text-sm outline-none focus:border-amber transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-sm text-text-muted mb-1.5 block">
                  Down payment (GHS)
                </label>
                <input
                  type="number"
                  min={0}
                  max={totalPrice}
                  step="0.01"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className="w-full rounded-lg bg-ink border border-border px-4 py-2.5 text-text font-mono text-sm outline-none focus:border-amber transition-colors"
                />
              </div>
              <div>
                <label className="font-body text-sm text-text-muted mb-1.5 block">Frequency</label>
                <div className="grid grid-cols-2 gap-3">
                  {FREQUENCIES.map((f) => (
                    <PaymentTypeOption
                      key={f.value}
                      label={f.label}
                      active={frequency === f.value}
                      onClick={() => setFrequency(f.value)}
                    />
                  ))}
                </div>
              </div>
              <p className="text-text-muted text-xs font-mono">
                ≈ GHS {perInstallment} × {Math.max(0, totalInstallments - 1)} after your down payment
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm px-3 py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-amber text-ink font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
          >
            {submitting ? "Setting up payment…" : "Click to pay"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PaymentTypeOption({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
        active ? "border-amber bg-amber/10 text-amber" : "border-border text-text-muted hover:text-text"
      }`}
    >
      {label}
    </button>
  );
}
