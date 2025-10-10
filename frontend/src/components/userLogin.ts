import { arktypeResolver } from "@hookform/resolvers/arktype/src/arktype.js";
import { type } from "arktype";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, type NavigateFunction } from "react-router";

export const userLogin = () => {

  const home: NavigateFunction = useNavigate();

  const [isLoggingIn, setLoggingIn] = useState(false);

  const User = type({

    email: "string.email",
    password: "string >= 6",

  });

  type userType = typeof User.infer;

  const form = useForm<userType>({

    resolver: arktypeResolver(User)

  });

  const handleUserLogin = async (date: userType): Promise<void> => {

    setLoggingIn(true);

    try {

      const res: Response = await fetch("/api/login", {

        method: "POST",
        headers: {

          "Content-Type": "application/json",

        },
        body: JSON.stringify(date),

      });

      if (res.status !== 201) {

        const errorData = await res.json();
        toast.error(errorData.message || "An error occurred during login");
        throw new Error(`Error during login: ${res.statusText}`);

      };

      toast.success("Logged in");

      return home("/home");

    } catch (error: unknown) {

      console.log("Error during login: ", error);
      toast.error("An unexpected error occurred");

    } finally {

      setLoggingIn(false);

    };

  };

  return {

    form,
    isLoggingIn,
    handleUserLogin,

  };

};
