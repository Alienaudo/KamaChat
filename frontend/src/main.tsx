import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { LoginPage } from './pages/Login/LoginPage';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { SignupPage } from './pages/Signup/SignupPage';
import { Toaster } from 'react-hot-toast';

const router = createBrowserRouter([

    {
        path: "/",
        element: <><h1>OK</h1></>
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/signup",
        element: <SignupPage />,
    }

]);

createRoot(document.getElementById('root')!).render(

    <StrictMode>

        <RouterProvider router={router} />

        <Toaster />

    </StrictMode>

);
