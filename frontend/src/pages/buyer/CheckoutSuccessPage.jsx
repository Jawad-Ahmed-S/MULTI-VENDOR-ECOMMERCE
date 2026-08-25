import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, XCircle, Loader2, AlertTriangle } from "lucide-react";
import api from "../../api/axiosInstance";

const MAX_POLL_ATTEMPTS = 8; // ~ (1.5s * 8) = 12s of polling before giving up
const POLL_INTERVAL_MS = 1500;

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  // status: "loading" | "processing" | "success" | "failed" | "expired" | "error"
  // No session_id at all is known synchronously at render time, so it's
  // derived as the initial state rather than set inside the effect.
  const [status, setStatus] = useState(() => (sessionId ? "loading" : "error"));
  const [order, setOrder] = useState(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!sessionId) return; // already reflected in initial state above

    let cancelled = false;
    let timeoutId;

    const checkSession = async () => {
      try {
        const res = await api.get(`/payment/verify-session/${sessionId}`);
        if (cancelled) return;

        const data = res.data;

        if (data.status === "success") {
          setOrder(data.order);
          setStatus("success");
          return;
        }

        if (data.status === "processing") {
          attemptsRef.current += 1;
          if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
            // Payment succeeded on Stripe's end but our order record still
            // isn't there after several tries. Don't call it a failure —
            // just tell the user honestly and point them at Orders.
            setStatus("delayed");
            return;
          }
          timeoutId = setTimeout(checkSession, POLL_INTERVAL_MS);
          return;
        }

        // "failed" or "expired" come straight from Stripe's payment_status
        setStatus(data.status);
      } catch (err) {
        if (!cancelled) setStatus("error");
        console.log(err)
      }
    };

    checkSession();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [sessionId]);

  if (status === "loading" || status === "processing") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 font-sans">
        <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto border border-border">
          <Loader2 size={32} className="text-brand animate-spin" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display font-semibold text-2xl text-ink">Confirming your payment...</h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            This usually takes just a few seconds. Please don't close this page.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 font-sans">
        <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center mx-auto border border-accent/20">
          <CheckCircle2 size={36} className="text-accent" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display font-semibold text-2xl text-ink">Payment Successful!</h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            Thank you for your payment. Your order has been placed and is currently being processed by our seller network.
          </p>
          {order?._id && (
            <p className="text-[11px] font-mono text-ink-muted bg-surface-muted p-2 rounded border border-border inline-block mt-2">
              Order ID: {order._id}
            </p>
          )}
        </div>
        <div className="flex justify-center gap-3 pt-4">
          <Link to={order?._id ? `/order/${order._id}` : "/orders"}>
            <button className="h-10 px-4 bg-accent text-white text-xs font-medium rounded-md flex items-center gap-2 hover:bg-accent/90 transition-colors cursor-pointer">
              View My Order <ArrowRight size={14} />
            </button>
          </Link>
          <Link to="/products">
            <button className="h-10 px-4 bg-surface border border-border text-ink text-xs font-medium rounded-md hover:bg-surface-muted transition-colors cursor-pointer">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === "delayed") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 font-sans">
        <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto border border-border">
          <AlertTriangle size={32} className="text-ink-muted" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display font-semibold text-2xl text-ink">Payment received, order is still processing</h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            Your card was charged successfully, but it's taking a little longer than usual to finalize your order.
            Check your Orders page in a moment — it should appear shortly. If it doesn't show up within a few
            minutes, please contact support with your session reference below.
          </p>
          <p className="text-[11px] font-mono text-ink-muted bg-surface-muted p-2 rounded border border-border inline-block mt-2">
            Session Ref: {sessionId?.slice(0, 18)}...
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-4">
          <Link to="/orders">
            <button className="h-10 px-4 bg-accent text-white text-xs font-medium rounded-md flex items-center gap-2 hover:bg-accent/90 transition-colors cursor-pointer">
              Check My Orders <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === "failed" || status === "expired") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 font-sans">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-200">
          <XCircle size={36} className="text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display font-semibold text-2xl text-ink">
            {status === "expired" ? "Checkout Session Expired" : "Payment Not Completed"}
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            {status === "expired"
              ? "This checkout link is no longer valid. Please return to checkout and try again."
              : "It looks like your payment didn't go through. No charge was made — you can try again."}
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-4">
          <Link to="/checkout">
            <button className="h-10 px-4 bg-accent text-white text-xs font-medium rounded-md flex items-center gap-2 hover:bg-accent/90 transition-colors cursor-pointer">
              Return to Checkout <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // status === "error" (network issue, missing session_id, etc.)
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 font-sans">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-200">
        <XCircle size={36} className="text-red-500" />
      </div>
      <div className="space-y-2">
        <h1 className="font-display font-semibold text-2xl text-ink">Something Went Wrong</h1>
        <p className="text-xs text-ink-muted leading-relaxed">
          We couldn't confirm your payment status right now. If money was deducted, please check your Orders
          page or contact support — don't retry the payment yet.
        </p>
      </div>
      <div className="flex justify-center gap-3 pt-4">
        <Link to="/orders">
          <button className="h-10 px-4 bg-accent text-white text-xs font-medium rounded-md flex items-center gap-2 hover:bg-accent/90 transition-colors cursor-pointer">
            Check My Orders <ArrowRight size={14} />
          </button>
        </Link>
        <Link to="/products">
          <button className="h-10 px-4 bg-surface border border-border text-ink text-xs font-medium rounded-md hover:bg-surface-muted transition-colors cursor-pointer">
            Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
}