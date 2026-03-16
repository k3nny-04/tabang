import { useState } from "react";
import {
  MapPin,
  AlertTriangle,
  Package,
  Flame,
  Info,
  Trash2,
  Camera,
  Plus as PlusIcon,
  Minus,
  ChevronDown,
} from "lucide-react";
import { useLocationContext } from "../providers/useLocationContext";
import { reportsApi } from "../api/reportsApi";
import { useAuthContext } from "../providers/useAuthContext";
import { uploadToCloudinary } from "../utils/upload";

const REPORT_TABS = [
  { type: "RESCUE", label: "Rescue", icon: AlertTriangle },
  { type: "SUPPLY", label: "Supply", icon: Package },
  { type: "INCIDENT", label: "Incident", icon: Flame },
];

const ReportForm = ({ onSuccess }) => {
  const { pinnedLocation, pinnedAddress } = useLocationContext();
  const { user } = useAuthContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    reportType: "RESCUE",
    description: "",
    priority: 3,
    supplies: [],
    photo: null,
    numberOfPeople: 0,
  });

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateSupply = (index, field, value) => {
    const updated = [...form.supplies];
    updated[index][field] = value;
    update("supplies", updated);
  };

  const removeSupply = (index) => {
    update(
      "supplies",
      form.supplies.filter((_, i) => i !== index)
    );
  };

  const addSupply = () => {
    update("supplies", [...form.supplies, { item: "", quantity: 1 }]);
  };

  const handleReset = () => {
    setForm({
      reportType: "RESCUE",
      description: "",
      priority: 3,
      supplies: [],
      photo: null,
      numberOfPeople: 0,
    });
  };

  const handleSubmit = async () => {
    if (!pinnedLocation) return alert("No pinned location");
    if (!form.description.trim())
      return alert("Description is required");

    if (form.reportType === "SUPPLY" && form.supplies.length === 0) {
      return alert("Add at least one supply item");
    }
    
    try {
      setIsSubmitting(true);

      let photoUrl = null;
      if(form.photo) {
        photoUrl = await uploadToCloudinary(form.photo);
      }

      const base = {
        createdBy: user.uid,
        reportType: form.reportType,
        description: form.description,
        location: pinnedLocation,
        prioLevel:
          form.reportType === "RESCUE" ? 1 : form.priority,
        status: "PENDING",
      };

      let payload = base;

      if (form.reportType === "SUPPLY") {
        payload = { ...base, supplies: form.supplies };
      } else if (form.reportType === "RESCUE") {
        payload = {
          ...base,
          numberOfPeople: form.numberOfPeople,
          photo: photoUrl
        };
      } else if (form.reportType === "INCIDENT") {
        payload = {
          ...base,
          photo: photoUrl
        };
      }

      console.log("Submitting report", payload);
      await reportsApi.createReport(payload);
      alert("Report submitted successfully!");
      
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
    
    handleReset();
    if(onSuccess) onSuccess();
  };

  return (
    <form className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto pr-2">

        {/* Tabs */}
        <div className="ml-0.5 mt-1 grid grid-cols-3 gap-2">
          {REPORT_TABS.map((tab) => {
            const active = form.reportType === tab.type;
            const IconComponent = tab.icon;

            return (
              <button
                key={tab.type}
                type="button"
                onClick={() => update("reportType", tab.type)}
                className={`flex flex-col items-center rounded-xl border px-2 py-3 text-xs transition
                  ${
                    active
                      ? "border-text-primary text-text-primary bg-surface ring-2 ring-text-primary"
                      : "border-border-light text-text-muted"
                  }`}
              >
                <IconComponent size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Location */}
        <div>
          <label className="mb-1 flex items-center gap-1 text-sm font-medium text-text-primary">
            Location
            <button
              type="button"
              onClick={() =>
                alert("Move the pin on the map to change location")
              }
            >
              <Info size={14} className="text-text-muted" />
            </button>
          </label>

          <div className="flex items-center gap-2 rounded-lg border border-border-light bg-bg-secondary px-3 py-2 text-sm text-text-muted">
            <MapPin size={16} />
            {pinnedLocation
              ? pinnedAddress
              : "No pinned location"}
          </div>
        </div>

        {/* Priority */}
        {form.reportType !== "RESCUE" ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Priority
            </label>
            <div className="relative">
              <select
                value={form.priority}
                onChange={(e) =>
                  update("priority", Number(e.target.value))
                }
                className="w-full appearance-none rounded-lg border border-border-light bg-surface px-3 py-3 pr-10 text-sm text-text-primary focus:border-text-secondary focus:outline-none"
              >
                <option value={1}>Urgent</option>
                <option value={2}>High</option>
                <option value={3}>Medium</option>
                <option value={4}>Low</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-text-muted"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-600">
            Priority is automatically set to <strong>Urgent</strong> for rescue
            reports.
          </div>
        )}

        {/* Number of People */}
        {form.reportType === "RESCUE" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Number of People to be Rescued
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  update(
                    "numberOfPeople",
                    Math.max(0, form.numberOfPeople - 1)
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-light bg-surface text-text-primary active:scale-95"
              >
                <Minus size={20} />
              </button>

              <input
                type="number"
                min="0"
                value={form.numberOfPeople}
                onChange={(e) =>
                  update(
                    "numberOfPeople",
                    Math.max(0, Number(e.target.value))
                  )
                }
                className="flex-1 rounded-lg border border-border-light bg-surface px-3 py-2 text-center text-sm text-text-primary"
              />

              <button
                type="button"
                onClick={() =>
                  update(
                    "numberOfPeople",
                    form.numberOfPeople + 1
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-light bg-surface text-text-primary active:scale-95"
              >
                <PlusIcon size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-primary">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              update("description", e.target.value)
            }
            placeholder={
              form.reportType === "RESCUE"
                ? "Briefly describe the situation in your place (Hanggang saan na ang baha, may natumbang poste, etc.)"
                : "Provide additional details about the report"
            }
            className="w-full rounded-lg border border-border-light bg-surface px-3 py-2 text-sm text-text-primary focus:border-text-secondary focus:outline-none"
          />
        </div>

        {/* Supplies */}
        {form.reportType === "SUPPLY" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Supplies Needed
            </label>

            {form.supplies.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-border-light bg-surface px-2 py-1 text-sm"
                  placeholder="Item"
                  value={s.item}
                  onChange={(e) =>
                    updateSupply(i, "item", e.target.value)
                  }
                />

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateSupply(
                        i,
                        "quantity",
                        Math.max(1, s.quantity - 1)
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded border border-border-light bg-surface active:scale-95"
                  >
                    <Minus size={16} />
                  </button>

                  <input
                    type="number"
                    min={1}
                    value={s.quantity}
                    onChange={(e) =>
                      updateSupply(
                        i,
                        "quantity",
                        Math.max(1, Number(e.target.value))
                      )
                    }
                    className="w-10 rounded border border-border-light bg-surface px-0 py-1 text-center text-sm"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updateSupply(i, "quantity", s.quantity + 1)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded border border-border-light bg-surface active:scale-95"
                  >
                    <PlusIcon size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeSupply(i)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-light bg-surface text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addSupply}
              className="mt-1 text-sm text-text-primary hover:text-text-secondary"
            >
              + Add supply
            </button>
          </div>
        )}

        {/* Photo */}
        {form.reportType !== "SUPPLY" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Photo (optional)
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-text-primary bg-bg-secondary px-4 py-6 transition hover:opacity-80">
              <Camera size={32} className="mb-2 text-text-primary" />

              <span className="text-sm font-medium text-text-primary">
                {form.photo ? form.photo.name : "Tap to take a photo"}
              </span>

              <span className="mt-1 text-xs text-text-muted">
                or upload from gallery
              </span>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  update(
                    "photo",
                    e.target.files ? e.target.files[0] : null
                  )
                }
              />
            </label>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="shrink-0 border-t border-border-light pt-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-xl bg-text-primary py-3 text-sm font-semibold text-bg-primary shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </form>
  );
};

export default ReportForm;