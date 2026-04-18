import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Eye,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Database,
  AlertTriangle
} from "lucide-react";
import { itemsApi } from "../../api/itemsApi";
import DataTable from "../../components/DataTable"; 
import ItemDetailsModal from "../../components/modals/ItemDetailsModal";
import DeleteModal from "../../components/modals/DeleteModal"; 

const ITEMS_PER_PAGE = 10;

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Stream shelters in real-time
  useEffect(() => {
    const unsubscribe = itemsApi.streamAllItems((data) => {
      setItems(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and Sort Logic
  const processedItems = useMemo(() => {
    let result = [...items];

    // 1. Filter by search query (name or category)
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(lowerQuery) ||
          item.category?.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Sort alphabetically by category, then by name
    result.sort((a, b) => {
      const catA = a.category || "";
      const catB = b.category || "";
      if (catA === catB) {
        return (a.name || "").localeCompare(b.name || "");
      }
      return catA.localeCompare(catB);
    });

    return result;
  }, [items, searchQuery]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(processedItems.length / ITEMS_PER_PAGE));
  const paginatedItems = processedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Action Handlers
  const handleAdd = () => setIsAddingItem(true);
  const handleView = (item) => setSelectedItem(item);
  const handleDelete = (item) => setItemToDelete(item);

  const handleConfirmDelete = async (itemId) => {
    try {
      await itemsApi.deleteItem(itemId);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleSaveItem = async (itemId, payload) => {
    try {
      if (itemId) {
        await itemsApi.updateItem(itemId, payload);
      } else {
        await itemsApi.createItem(payload);
      }
      setSelectedItem(null);
      setIsAddingItem(false);
    } catch (error) {
      console.error("Failed to save item:", error);
      alert("Failed to save item. Please try again.");
    }
  };

  // Table Column Configuration
  const columns = [
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="font-semibold text-gray-800 uppercase tracking-wider text-xs bg-gray-100 px-2.5 py-1 rounded-lg">
          {row.category || "Uncategorized"}
        </span>
      ),
    },
    {
      key: "name",
      label: "Equipment Name",
      render: (row) => <span className="text-gray-800 font-medium">{row.name}</span>,
    },
    {
      key: "quantity",
      label: "Available / Total",
      render: (row) => (
        <div className="flex items-center gap-2 text-sm font-mono whitespace-nowrap">
          <span className={row.quantity_available === 0 ? "text-red-600 font-bold" : "text-gray-800 font-bold"}>
            {row.quantity_available || 0}
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">{row.quantity_total || 0}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const isFunctional = row.status === "FUNCTIONAL";
        return (
          <span className={`flex items-center gap-1.5 w-max px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${
            isFunctional ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {row.status || "UNKNOWN"}
          </span>
        );
      },
    },
    {
      key: "supplier",
      label: "Supplier Details",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">{row.supplier || "N/A"}</span>
          <span className="text-xs text-gray-500 font-mono">{row.supplier_contact}</span>
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
            title="Delete Equipment"
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
            Inventory Management
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Track rescue equipment, resources, and availability status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); 
              }}
              className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-text-primary/20 transition-all"
            />
          </div>

          <div className="hidden sm:block w-px h-8 bg-gray-200 mx-1"></div>

          {/* Add Item Button */}
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 bg-text-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-neutral-800 transition-all shadow-md active:scale-95 outline-none focus:ring-2 focus:ring-text-primary/20 w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Table Component */}
      <DataTable
        columns={columns}
        data={paginatedItems}
        loading={isLoading}
        emptyMessage={
          searchQuery
            ? `No equipment matches "${searchQuery}".`
            : "No inventory found. Click 'Add Item' to record equipment."
        }
        keyField="id"
      />

      {/* Pagination Controls */}
      {!isLoading && processedItems.length > 0 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">
            Showing{" "}
            <span className="font-bold text-gray-800">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-gray-800">
              {Math.min(currentPage * ITEMS_PER_PAGE, processedItems.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-gray-800">
              {processedItems.length}
            </span>{" "}
            items
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
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Item Modal (Add/Edit) */}
      {(selectedItem || isAddingItem) && (
        <ItemDetailsModal
          item={selectedItem || {}}
          onClose={() => {
            setSelectedItem(null);
            setIsAddingItem(false);
          }}
          onSave={handleSaveItem}
        />
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <DeleteModal
          title="Delete Equipment?"
          itemName={itemToDelete.name}
          itemId={itemToDelete.id}
          extraDetails={[
            { label: "Category", value: itemToDelete.category },
            { label: "Stock", value: `${itemToDelete.quantity_available} available` },
          ]}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default InventoryPage;