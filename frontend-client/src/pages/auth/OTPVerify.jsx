import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell";
import { authApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const OTP_LENGTH = 6;

export default function OTPVerify() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { completeAuth } = useAuth();
  const userId = state?.userId;
  const phone = state?.phone;

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!userId) navigate("/signup", { replace: true });
  }, [userId, navigate]);

  const handleChange = (i, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[i] = value.slice(-1);
    setDigits(next);
    if (value && i < OTP_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== OTP_LENGTH) {
      setError("Enter all 6 digits.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp({ user_id: userId, otp });
      completeAuth(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await authApi.resendOtp({ user_id: userId });
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Step 2 of 2"
      title="Verify your phone"
      subtitle={phone ? `Enter the 6-digit code sent to ${phone}.` : "Enter the 6-digit code sent to your phone."}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-13 py-3 text-center rounded-lg bg-ink border border-border text-text font-mono text-lg outline-none focus:border-amber transition-colors"
            />
          ))}
        </div>

        {error && <p className="text-coral text-sm">{error}</p>}
        {resent && <p className="text-mint text-sm">A new code has been sent.</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-amber text-ink font-medium hover:bg-amber-dim transition-colors disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify and continue"}
        </button>
      </form>

      <button
        onClick={handleResend}
        disabled={resending}
        className="w-full text-center text-sm text-text-muted hover:text-amber mt-5 transition-colors disabled:opacity-60"
      >
        {resending ? "Resending…" : "Didn't get a code? Resend"}
      </button>
    </AuthShell>
  );
}
