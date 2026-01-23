import { createContext, useEffect, useReducer } from "react";
import axios from "axios";

// Initial State
const INITIAL_STATE = {
    user: JSON.parse(localStorage.getItem("user")) || null,
    isFetching: false,
    error: false,
};

export const AuthContext = createContext(INITIAL_STATE);

const AuthReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN_START":
            return { user: null, isFetching: true, error: false };
        case "LOGIN_SUCCESS":
            return { user: action.payload, isFetching: false, error: false };
        case "LOGIN_FAILURE":
            return { user: null, isFetching: false, error: true };
        case "LOGOUT":
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

    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(state.user));
    }, [state.user]);

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
