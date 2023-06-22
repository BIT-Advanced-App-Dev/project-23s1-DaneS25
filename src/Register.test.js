import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
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
  registerWithEmailAndPassword: jest.fn(),
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

describe("Register component", () => {
  it("should handle registration correctly", async () => {
    // Set mock values for Firebase imports used in useEffect
    jest.spyOn(require("./firebase"), "auth").mockReturnValue({});

    // Set mock implementation for useAuthState
    useAuthState.mockReturnValue([null, false]);

    // Render the Register component within a MemoryRouter
    const { getByTestId, queryByTestId } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Set mock implementation for registerWithEmailAndPassword
    firebaseutils.registerWithEmailAndPassword.mockResolvedValue();

    const nameInput = getByTestId("name-input");
    const emailInput = getByTestId("email-input");
    const passwordInput = getByTestId("password-input");
    const registerButton = queryByTestId("register-button"); // Use queryByTestId here

    fireEvent.change(nameInput, {
      target: { value: "John Doe" },
    });
    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "testpass" },
    });
    fireEvent.click(registerButton); // Use registerButton variable here

    await waitFor(() => {
      expect(firebaseutils.registerWithEmailAndPassword).toHaveBeenCalledWith(
        "John Doe",
        "test@example.com",
        "testpass"
      );
    });
  });
});
