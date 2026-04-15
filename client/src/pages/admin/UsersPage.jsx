import { useState, useEffect } from "react";
import DataTable from "../../components/DataTable";
import DeleteModal from "../../components/modals/DeleteModal";
import AddResponderModal from "../../components/modals/AddResponderModal";
import { usersApi } from "../../api/usersApi";
import { Users, Shield, Plus, Trash2, Mail, Phone } from "lucide-react";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { deleteApp, initializeApp } from "firebase/app";
import app from "../../firebase-config";

const UsersPage = () => {
  const [activeTab, setActiveTab] = useState("CITIZENS"); // 'CITIZENS' or 'RESPONDERS'
  
  // Data States
  const [citizens, setCitizens] = useState([]);
  const [responders, setResponders] = useState([]);
  const [loadingCitizens, setLoadingCitizens] = useState(true);
  const [loadingResponders, setLoadingResponders] = useState(true);

  // Modal States
  // const [userToDelete, setUserToDelete] = useState(null);
  const [isAddingResponder, setIsAddingResponder] = useState(false);

  // Stream Data on Mount
  useEffect(() => {
    const unsubCitizens = usersApi.streamCitizens((data) => {
      setCitizens(data);
      setLoadingCitizens(false);
    });

    const unsubResponders = usersApi.streamResponders((data) => {
      setResponders(data);
      setLoadingResponders(false);
    });

    return () => {
      if (unsubCitizens) unsubCitizens();
      if (unsubResponders) unsubResponders();
    };
  }, []);

  // Action Handlers
  // const handleDelete = (user) => {
  //   setUserToDelete(user);
  // };

  // const handleConfirmDelete = async (userId) => {
  //   try {
  //     await usersApi.deleteUser(userId);
  //     setUserToDelete(null);
  //   } catch (error) {
  //     console.error("Failed to delete user:", error);
  //     throw error;
  //   }
  // };

const handleSaveResponder = async (responderData) => {
    let secondaryApp;
    try {
      // eslint-disable-next-line no-unused-vars
      const { email, password, confirmPassword, ...firestoreData } = responderData;

      secondaryApp = initializeApp(app.options, `SecondaryApp-${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUid = userCredential.user.uid;

      const payload = {
        ...firestoreData,
        email, 
      };
      
      await usersApi.createUser(newUid, payload);
      setIsAddingResponder(false);
      
    } catch (error) {
      console.error("Error creating responder:", error);
      throw error; 
    } finally {
      // 5. Clean up the secondary app to prevent memory leaks and duplicate app errors
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
    }
  };

  // Shared Columns
  const baseColumns = [
    {
      key: "id",
      label: "User ID",
      render: (row) => (
        <span className="text-xs font-mono text-gray-500" title={row.id}>
          {row.id}
        </span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <span className="font-bold text-gray-800">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      key: "contactInfo",
      label: "Contact Info",
      render: (row) => (
        <div className="flex flex-col gap-1 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <Mail size={12} className="text-gray-400" />
            {row.email || "N/A"}
          </div>
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-gray-400" />
            {row.contactNo || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Joined Date",
      render: (row) => (
        <span className="text-sm text-gray-500 font-medium">
          {row.createdAt 
            ? new Date(row.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
            : "Unknown"}
        </span>
      ),
    }
  ];
  // Specific Columns per role
  const citizenColumns = [
    ...baseColumns,
    // {
    //   key: "actions",
    //   label: "",
    //   render: (row) => (
    //     <div className="flex items-center justify-end">
    //       <button
    //         onClick={() => handleDelete(row)}
    //         title="Delete Citizen"
    //         className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    //       >
    //         <Trash2 size={16} />
    //       </button>
    //     </div>
    //   ),
    // }
  ];

  const responderColumns = [
    baseColumns[0], // Name
    {
      key: "teamDetails",
      label: "Assignment",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-800">{row.specialization || "Unassigned"}</span>
          <span className="text-xs font-mono text-gray-500 mt-0.5">{row.teamId || "No Team"}</span>
        </div>
      ),
    },
    baseColumns[1], // Contact Info
    baseColumns[2], // Joined Date
    // {
    //   key: "actions",
    //   label: "",
    //   render: (row) => (
    //     <div className="flex items-center justify-end">
    //       <button
    //         onClick={() => handleDelete(row)}
    //         title="Delete Responder"
    //         className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    //       >
    //         <Trash2 size={16} />
    //       </button>
    //     </div>
    //   ),
    // }
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-wide">Users Management</h1>
            <p className="text-text-muted text-sm mt-1">Manage platform citizens and responder teams.</p>
          </div>

          {/* Conditional Add Button */}
          {activeTab === "RESPONDERS" && (
             <button
              onClick={() => setIsAddingResponder(true)}
              className="flex items-center justify-center gap-2 bg-text-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-neutral-800 transition-all shadow-md active:scale-95 outline-none focus:ring-2 focus:ring-text-primary/20 w-full sm:w-auto"
            >
              <Plus size={18} />
              <span>Add Responder</span>
            </button>
          )}
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-100">
          <button
            onClick={() => setActiveTab("CITIZENS")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${
              activeTab === "CITIZENS" ? "text-text-primary" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Users size={18} />
            Citizens
            {activeTab === "CITIZENS" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-text-primary rounded-t-full"></span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("RESPONDERS")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all relative ${
              activeTab === "RESPONDERS" ? "text-text-primary" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Shield size={18} />
            Responders
            {activeTab === "RESPONDERS" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-text-primary rounded-t-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Data Table */}
      {activeTab === "CITIZENS" ? (
        <DataTable 
          columns={citizenColumns} 
          data={citizens} 
          loading={loadingCitizens} 
          emptyMessage="No citizens registered yet." 
        />
      ) : (
        <DataTable 
          columns={responderColumns} 
          data={responders} 
          loading={loadingResponders} 
          emptyMessage="No responders found." 
        />
      )}

      {/* Modals */}
      {isAddingResponder && (
        <AddResponderModal 
          onClose={() => setIsAddingResponder(false)} 
          onSave={handleSaveResponder} 
        />
      )}

      {/* {userToDelete && (
        <DeleteModal
          title={`Delete ${userToDelete.role === "RESPONDER" ? "Responder" : "Citizen"}?`}
          itemName={`${userToDelete.firstName} ${userToDelete.lastName}`}
          itemId={userToDelete.id}
          extraDetails={[
            { label: "Role", value: userToDelete.role },
            { label: "Email", value: userToDelete.email || "N/A" }
          ]}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )} */}

    </div>
  );
};

export default UsersPage;