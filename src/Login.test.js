import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { useAuthState } from "react-firebase-hooks/auth";
import * as firebaseutils from "./firebaseutils";

// Mock the necessary dependencies
jest.mock("./firebase", () => ({
  auth: jest.fn(),
  db: jest.fn(),
}));
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
}));
jest.mock("./firebaseutils", () => ({
  logInWithEmailAndPassword: jest.fn(),
}));
jest.mock("react-toastify", () => ({
  ToastContainer: jest.fn(),
  toast: {
    error: jest.fn(),
  },
}));
jest.mock("react-firebase-hooks/auth", () => ({
  useAuthState: jest.fn(),
}));

describe("Login component", () => {
  it("should handle login correctly", async () => {
    // Set mock values for Firebase imports used in useEffect
    jest.spyOn(require("./firebase"), "auth").mockReturnValue({});

    // Set mock implementation for useAuthState
    useAuthState.mockReturnValue([null, false]);

    // Render the Login component within a MemoryRouter
    const { getByTestId, queryByTestId } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Set mock implementation for logInWithEmailAndPassword
    firebaseutils.logInWithEmailAndPassword.mockResolvedValue();

    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");
    const loginButton = queryByTestId("login-button"); // Use queryByTestId here

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "testpass" },
    });
    fireEvent.click(loginButton); // Use loginButton variable here

    await waitFor(() => {
      expect(firebaseutils.logInWithEmailAndPassword).toHaveBeenCalledWith(
        "test@example.com",
        "testpass"
      );
    });
  });
});
