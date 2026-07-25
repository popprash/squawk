import { ThemeProvider } from "./context/ThemeContext";
import { WallpaperProvider } from "./context/WallpaperContext";
import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "@clerk/react";
import PageLoader from "./components/PageLoader";
import {Toaster} from 'react-hot-toast'

import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const { checkAuth, clearAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        checkAuth();
      } else {
        clearAuth();
      }
    }
  }, [isLoaded, isSignedIn, checkAuth, clearAuth]);

  if (!isLoaded || (isSignedIn && isCheckingAuth)) {
    return <PageLoader />;
  }
  return (
    <>
      <ThemeProvider>
        <WallpaperProvider>
          <Routes>
            <Route
              path="/"
              element={
                isSignedIn ? <ChatPage /> : <Navigate to={"/auth"} replace />
              }
            ></Route>
            <Route
              path="/auth"
              element={
                !isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace />
              }
            ></Route>
          </Routes>
          <Toaster/>
        </WallpaperProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
