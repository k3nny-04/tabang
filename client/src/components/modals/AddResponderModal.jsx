import { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";

const AddResponderModal = ({ onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
    specialization: "",
    teamId: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        role: "RESPONDER"
      });
      // The parent component handles closing the modal on success
    } catch (err) {
      console.error("Failed to create responder:", err);
      // Display Firebase error message (or fallback)
      setError(err.message || "Failed to create responder. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <h2 className="text-lg font-bold text-text-primary">Add Responder</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto p-6">
          
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              <AlertCircle size={16} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600 uppercase">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600 uppercase">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-xs font-bold text-gray-600 uppercase">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-xs font-bold text-gray-600 uppercase">Contact Number</label>
            <input
              type="tel"
              name="contactNo"
              required
              value={formData.contactNo}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600 uppercase">Specialization</label>
              <input
                type="text"
                name="specialization"
                placeholder="e.g., Medical"
                required
                value={formData.specialization}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600 uppercase">Team ID</label>
              <input
                type="text"
                name="teamId"
                placeholder="e.g., ALPHA"
                value={formData.teamId}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600 uppercase">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-600 uppercase">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-text-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-text-secondary active:scale-95 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Create Responder"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddResponderModal;