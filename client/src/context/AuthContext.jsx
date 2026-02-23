import { createContext, useEffect, useReducer } from "react";
import axios from "axios";

// Initial State
// Using sessionStorage instead of localStorage so user logs out when closing tab/browser
const INITIAL_STATE = {
    user: JSON.parse(sessionStorage.getItem("user")) || null,
    isFetching: false,
    error: false,
};

export const AuthContext = createContext(INITIAL_STATE);

const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return { user: null, isFetching: true, error: false };
        case "LOGIN_SUCCESS":
            // Store login time when successfully logging in
            sessionStorage.setItem("loginTime", Date.now().toString());
            return { user: action.payload, isFetching: false, error: false };
        case "LOGIN_FAILURE":
            return { user: null, isFetching: false, error: true };
        case "LOGOUT":
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("loginTime");
            return { user: null, isFetching: false, error: false };
        case "UPDATE_BALANCE":
            return {
                ...state,
                user: { ...state.user, balance: action.payload }
            };
        case "UPDATE_USER":
            return {
                ...state,
                user: { ...state.user, ...action.payload }
            };
        default:
            return state;
    }
};

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

    // Sync user state with sessionStorage
    useEffect(() => {
        if (state.user) {
            sessionStorage.setItem("user", JSON.stringify(state.user));
        } else {
            sessionStorage.removeItem("user");
        }
    }, [state.user]);

    // Session Timeout Logic (15 minutes)
    useEffect(() => {
        const checkTimeout = () => {
            const loginTime = sessionStorage.getItem("loginTime");
            if (state.user && loginTime) {
                const currentTime = Date.now();
                const fifteenMinutes = 15 * 60 * 1000;

                if (currentTime - parseInt(loginTime) > fifteenMinutes) {
                    dispatch({ type: "LOGOUT" });
                    window.location.href = "/login"; // Redirect to login
                }
            }
        };

        // Check on mount
        checkTimeout();

        // Check every minute
        const interval = setInterval(checkTimeout, 60000);

        return () => clearInterval(interval);
    }, [state.user, dispatch]);

    // Helper to update balance locally after purchase
    const updateBalance = (newBalance) => {
        dispatch({ type: "UPDATE_BALANCE", payload: newBalance });
    };

    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                isFetching: state.isFetching,
                error: state.error,
                dispatch,
                updateBalance
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
