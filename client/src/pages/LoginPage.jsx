import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../providers/useAuthContext";

const LoginPage = () => {
const { setupRecaptcha, sendOTP, verifyOTP } = useAuthContext();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone");
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const inputsRef = useRef([]);

  const handleSendOTP = async () => {
    try {
      setLoading(true);

      setupRecaptcha("send-otp-btn");

      await sendOTP(phone);

      setStep("verify");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);

      const code = otp.join("");

      await verifyOTP(code);

      navigate("/map");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">

      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">

        <h1 className="text-xl font-semibold text-center mb-6">
          Phone Login
        </h1>

        {step === "phone" && (
          <>
            <input
              className="w-full border rounded p-2 mb-4"
              placeholder="+639171234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button
              id="send-otp-btn"
              className="w-full bg-indigo-600 text-white py-2 rounded"
              onClick={handleSendOTP}
              disabled={loading}
            >
              Send OTP
            </button>
          </>
        )}

        {step === "verify" && (
          <>
            <p className="text-sm text-center mb-4">
              Enter the 6-digit code
            </p>

            <div className="flex justify-between mb-4">

              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) =>
                    handleChange(e.target.value, index)
                  }
                  className="w-10 h-12 text-center border rounded text-lg"
                />
              ))}

            </div>

            <button
              className="w-full bg-indigo-600 text-white py-2 rounded"
              onClick={handleVerify}
              disabled={loading}
            >
              Verify Code
            </button>
          </>
        )}

        <div id="recaptcha-container"></div>

      </div>

    </div>
  );
}

export default LoginPage