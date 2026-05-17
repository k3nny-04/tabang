import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Eye,
  Trash2,
  Map,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { sheltersApi } from "../../api/sheltersApi";
import DataTable from "../../components/DataTable";
import { Edit2, Check, X, Loader2 } from "lucide-react";
import ShelterDetailsModal from "../../components/modals/ShelterDetailsModal";
import DeleteModal from "../../components/modals/DeleteModal";

const ITEMS_PER_PAGE = 10;

const SheltersPage = () => {
  const [shelters, setShelters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedShelter, setSelectedShelter] = useState(null);
  const [shelterToDelete, setShelterToDelete] = useState(null);
  const [isAddingShelter, setIsAddingShelter] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Stream shelters in real-time
  useEffect(() => {
    const unsubscribe = sheltersApi.streamAllShelters((data) => {
      setShelters(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and Sort Logic
  const processedShelters = useMemo(() => {
    let result = [...shelters];

    // Filter by search query (name or barangay)
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (shelter) =>
          shelter.name?.toLowerCase().includes(lowerQuery) ||
          shelter.barangay?.toLowerCase().includes(lowerQuery),
      );
    }

    // Sort alphabetically by barangay
    result.sort((a, b) => {
      const brgyA = a.barangay || "";
      const brgyB = b.barangay || "";
      return brgyA.localeCompare(brgyB);
    });

    return result;
  }, [shelters, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(processedShelters.length / ITEMS_PER_PAGE);
  const paginatedShelters = processedShelters.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Action Handlers
  const handleAdd = () => {
    setIsAddingShelter(true);
  };

  const handleView = (shelter) => {
    setSelectedShelter(shelter);
  };

  const handleDelete = (shelter) => {
    setShelterToDelete(shelter);
  };

  const handleConfirmDelete = async (shelterId) => {
    try {
      await sheltersApi.deleteShelter(shelterId);
      setShelterToDelete(null);
    } catch (error) {
      console.error("Failed to delete shelter:", error);
      alert("Failed to delete shelter. Please try again.");
    }
  };

  const handleUpdateCapacity = async (shelterId, newCapacity) => {
    try {
      await sheltersApi.updateShelter(shelterId, {
        currentCapacity: newCapacity,
      });
    } catch (error) {
      console.error("Failed to update shelter capacity:", error);
      alert("Failed to update shelter capacity. Please try again.");
    }
  };

  const handleSaveShelter = async (shelterId, payload) => {
    try {
      if (shelterId) {
        // Edit mode
        await sheltersApi.updateShelter(shelterId, payload);
      } else {
        // Add mode
        await sheltersApi.createShelter(payload);
      }
      setSelectedShelter(null);
      setIsAddingShelter(false);
    } catch (error) {
      console.error("Failed to save shelter:", error);
      alert("Failed to save shelter. Please try again.");
    }
  };

  // Table Column Configuration
  const columns = [
    {
      key: "barangay",
      label: "Barangay",
      render: (row) => (
        <span className="font-semibold text-gray-800">{row.barangay}</span>
      ),
    },
    {
      key: "name",
      label: "Shelter Name",
      render: (row) => <span className="text-gray-700">{row.name}</span>,
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (row) => (
        <CapacityCell shelter={row} onUpdateCapacity={handleUpdateCapacity} />
      ),
    },
    {
      key: "manager",
      label: "Manager",
      render: (row) => (
        <span className="text-sm text-gray-600">{row.manager || "N/A"}</span>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (row) => (
        <span className="text-sm text-gray-600">{row.contact || "N/A"}</span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (row) => (
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <span>
            {row.location?.lat?.toFixed(4)}, {row.location?.lng?.toFixed(4)}
          </span>
          <button
            onClick={() => {
              console.log("View on map:", row.location);
            }}
            title="Pinpoint on Map"
            className="p-1 bg-gray-100 hover:text-text-primary hover:bg-gray-100 text-gray-500 rounded-md transition-colors"
          >
            <MapPin size={14} />
          </button>
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleView(row)}
            title="View Details"
            className="p-2 text-gray-400 hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            title="Delete Shelter"
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Headers */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-wide">
            Shelters Management
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Manage evacuation centers, capacities, and staff.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or barangay..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); 
              }}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-text-primary/20 transition-all"
            />
          </div>

          <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1"></div>

          {/* Add Shelter Button */}
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 bg-text-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-neutral-800 transition-all shadow-md active:scale-95 outline-none focus:ring-2 focus:ring-text-primary/20 w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>Add Shelter</span>
          </button>
        </div>
      </div>

      {/* Table Component */}
      <DataTable
        columns={columns}
        data={paginatedShelters}
        loading={isLoading}
        emptyMessage={
          searchQuery
            ? `No shelters match "${searchQuery}".`
            : "No shelters found. Click 'Add Shelter' to create one."
        }
        keyField="id"
      />

      {/* Pagination Controls */}
      {!isLoading && processedShelters.length > 0 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">
            Showing{" "}
            <span className="font-bold text-gray-800">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-gray-800">
              {Math.min(currentPage * ITEMS_PER_PAGE, processedShelters.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-gray-800">
              {processedShelters.length}
            </span>{" "}
            shelters
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 text-sm font-semibold text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Show Modal if editing OR adding */}
      {(selectedShelter || isAddingShelter) && (
        <ShelterDetailsModal
          shelter={selectedShelter || {}}
          onClose={() => {
            setSelectedShelter(null);
            setIsAddingShelter(false);
          }}
          onSave={handleSaveShelter}
        />
      )}

      {shelterToDelete && (
        <DeleteModal
          title="Delete Shelter?"
          itemName={shelterToDelete.name}
          itemId={shelterToDelete.id}
          extraDetails={[
            { label: "Location", value: shelterToDelete.barangay },
            {
              label: "Capacity",
              value: `${shelterToDelete.currentCapacity}/${shelterToDelete.maxCapacity}`,
            },
          ]}
          onClose={() => setShelterToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

const CapacityCell = ({ shelter, onUpdateCapacity }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(shelter.currentCapacity || 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const newValue = parseInt(inputValue, 10);

    // Validation: prevent saving if invalid or unchanged
    if (isNaN(newValue) || newValue < 0) return;
    if (newValue === shelter.currentCapacity) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateCapacity(shelter.id, newValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update capacity:", error);
      alert("Failed to update capacity. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setInputValue(shelter.currentCapacity || 0);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 font-mono text-sm">
        <input
          type="number"
          min="0"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-16 px-2 py-1 border border-text-primary rounded-md outline-none focus:ring-2 focus:ring-text-primary/20 text-gray-800"
          disabled={isSaving}
        />
        <span className="text-gray-400">/ {shelter.maxCapacity || 0}</span>

        {isSaving ? (
          <Loader2 size={16} className="animate-spin text-text-primary ml-1" />
        ) : (
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 text-sm font-mono text-gray-600 whitespace-nowrap">
      <div className="flex items-center">
        <span
          className={
            shelter.currentCapacity >= shelter.maxCapacity
              ? "text-red-600 font-bold"
              : "text-gray-800 font-bold"
          }
        >
          {shelter.currentCapacity || 0}
        </span>
        <span className="mx-1.5 text-gray-300">/</span>
        <span>{shelter.maxCapacity || 0}</span>
      </div>

      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-text-primary hover:bg-gray-100 rounded-md transition-all"
        title="Edit Capacity"
      >
        <Edit2 size={14} />
      </button>
    </div>
  );
};

export default SheltersPage;
