
// Authentication related functions

// Mock user data for demo purposes
const mockUsers = [
  {
    id: "user1",
    email: "demo@example.com",
    password: "password123",
    displayName: "Demo User",
    createdAt: "2023-01-01T00:00:00.000Z",
  },
];

// Current user state (in-memory for demo purposes)
let currentUser = null;

// Export login, register and logout functions
// We need to declare them first to avoid circular reference errors
const login = (email, password) => {
  // Implementation follows later
};

const register = (email, password, displayName) => {
  // Implementation follows later
};

const logout = () => {
  // Implementation follows later
};

// Check if user is authenticated
export function isAuthenticated() {
  const userJson = localStorage.getItem("currentUser");
  return userJson !== null && userJson !== undefined;
}

// Get current user data
export function getCurrentUser() {
  try {
    const userJson = localStorage.getItem("currentUser");
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

// Export the functions (implementation follows)
export { login, register, logout };

// Login function implementation
export function loginImpl(email, password) {
  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    // Don't store password in localStorage
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
    currentUser = userWithoutPassword;
    return { success: true, user: userWithoutPassword };
  }

  return { success: false, error: "Invalid email or password" };
}

// Register function implementation
export function registerImpl(email, password, displayName) {
  const userExists = mockUsers.find((u) => u.email === email);

  if (userExists) {
    return { success: false, error: "Email already in use" };
  }

  const newUser = {
    id: `user${mockUsers.length + 1}`,
    email,
    password,
    displayName: displayName || email.split("@")[0],
    createdAt: new Date().toISOString(),
  };

  mockUsers.push(newUser);

  // Don't store password in localStorage
  const { password: _, ...userWithoutPassword } = newUser;
  localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
  currentUser = userWithoutPassword;

  return { success: true, user: userWithoutPassword };
}

// Logout function implementation
export function logoutImpl() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  return { success: true };
}

// Now implement the actual exported functions
login.implementation = loginImpl;
register.implementation = registerImpl;
logout.implementation = logoutImpl;
