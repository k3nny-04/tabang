export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "VERIFIED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "IN PROGRESS":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "RESOLVED":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};