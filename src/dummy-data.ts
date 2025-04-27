// Users
export const users = [
  {
    id: "1",
    name: "John Admin",
    role: "admin",
    email: "john@school.edu",
  },
  {
    id: "2",
    name: "Sarah Super",
    role: "superadmin",
    email: "sarah@school.edu",
  },
  {
    id: "3",
    name: "Mike Student",
    role: "student",
    email: "mike@school.edu",
  },
  {
    id: "4",
    name: "Lisa Student",
    role: "student",
    email: "lisa@school.edu",
  },
  {
    id: "5",
    name: "David Admin",
    role: "admin",
    email: "david@school.edu",
  },
]

// Equipment items
export const items = [
  {
    id: "1",
    name: "Microscope",
    category: "Science",
    status: "available",
    description: "High-powered microscope for biology lab",
    serialNumber: "MS-2023-001",
    addedBy: "2", // Sarah Super
    addedDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Laptop",
    category: "Technology",
    status: "borrowed",
    description: "Dell XPS 13 laptop",
    serialNumber: "LP-2023-045",
    addedBy: "2", // Sarah Super
    addedDate: "2023-02-10",
  },
  {
    id: "3",
    name: "Projector",
    category: "Technology",
    status: "available",
    description: "Epson HD projector",
    serialNumber: "PJ-2023-012",
    addedBy: "2", // Sarah Super
    addedDate: "2023-01-20",
  },
  {
    id: "4",
    name: "Digital Camera",
    category: "Media",
    status: "pending",
    description: "Canon EOS Rebel T7",
    serialNumber: "DC-2023-033",
    addedBy: "2", // Sarah Super
    addedDate: "2023-03-05",
  },
  {
    id: "5",
    name: "Telescope",
    category: "Science",
    status: "available",
    description: "Celestron StarSense Explorer",
    serialNumber: "TS-2023-007",
    addedBy: "2", // Sarah Super
    addedDate: "2023-02-25",
  },
  {
    id: "6",
    name: "VR Headset",
    category: "Technology",
    status: "borrowed",
    description: "Oculus Quest 2",
    serialNumber: "VR-2023-019",
    addedBy: "2", // Sarah Super
    addedDate: "2023-03-15",
  },
]

// Borrow requests
export const requests = [
  {
    id: "1",
    itemId: "2", // Laptop
    userId: "3", // Mike Student
    requestDate: "2023-04-10",
    status: "approved",
    approvedBy: "1", // John Admin
    approvedDate: "2023-04-11",
    dueDate: "2023-04-25",
    returnDate: null,
    returnNotes: null,
  },
  {
    id: "2",
    itemId: "4", // Digital Camera
    userId: "4", // Lisa Student
    requestDate: "2023-04-15",
    status: "pending",
    approvedBy: null,
    approvedDate: null,
    dueDate: null,
    returnDate: null,
    returnNotes: null,
  },
  {
    id: "3",
    itemId: "6", // VR Headset
    userId: "3", // Mike Student
    requestDate: "2023-04-05",
    status: "approved",
    approvedBy: "5", // David Admin
    approvedDate: "2023-04-06",
    dueDate: "2023-04-20",
    returnDate: null,
    returnNotes: null,
  },
  {
    id: "4",
    itemId: "1", // Microscope
    userId: "4", // Lisa Student
    requestDate: "2023-03-20",
    status: "returned",
    approvedBy: "1", // John Admin
    approvedDate: "2023-03-21",
    dueDate: "2023-04-04",
    returnDate: "2023-04-02",
    returnNotes: "Returned in good condition",
  },
]

// Borrowing history
export const history = [
  {
    id: "1",
    itemId: "1", // Microscope
    userId: "4", // Lisa Student
    borrowDate: "2023-03-21",
    returnDate: "2023-04-02",
    notes: "Returned in good condition",
  },
  {
    id: "2",
    itemId: "3", // Projector
    userId: "3", // Mike Student
    borrowDate: "2023-02-15",
    returnDate: "2023-03-01",
    notes: "Minor scratch on lens cover",
  },
  {
    id: "3",
    itemId: "2", // Laptop
    userId: "4", // Lisa Student
    borrowDate: "2023-01-10",
    returnDate: "2023-01-24",
    notes: "Battery needs replacement",
  },
  {
    id: "4",
    itemId: "5", // Telescope
    userId: "3", // Mike Student
    borrowDate: "2023-02-01",
    returnDate: "2023-02-15",
    notes: "Perfect condition",
  },
]

// Helper function to get item by ID
export function getItemById(id: string) {
  return items.find((item) => item.id === id)
}

// Helper function to get user by ID
export function getUserById(id: string) {
  return users.find((user) => user.id === id)
}

// Helper function to get requests by user ID
export function getRequestsByUserId(userId: string) {
  return requests.filter((request) => request.userId === userId)
}

// Helper function to get requests by item ID
export function getRequestsByItemId(itemId: string) {
  return requests.filter((request) => request.itemId === itemId)
}

// Helper function to get history by item ID
export function getHistoryByItemId(itemId: string) {
  return history.filter((record) => record.itemId === itemId)
}

// Helper function to get history by user ID
export function getHistoryByUserId(userId: string) {
  return history.filter((record) => record.userId === userId)
}
