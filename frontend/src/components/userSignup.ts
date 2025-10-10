import { arktypeResolver } from "@hookform/resolvers/arktype/src/arktype.js";
import { type Traversal, type } from "arktype";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, type NavigateFunction } from "react-router";

export const userSignup = () => {

  const login: NavigateFunction = useNavigate();

  const [isSubmitting, setSubmitting] = useState(false);

  const User = type({

    name: "3 < string.alphanumeric < 15",
    nick: "3 < string.alphanumeric < 15",
    email: "string.email",
    birthDate: "string.date.iso",
    password: "string >= 6",
    password_confirm: "string >= 6"

  })
    .narrow((data, problems: Traversal): boolean => {

      if (data.password !== data.password_confirm) {

        return problems.reject({

          expected: "Identical passwords",
          actual: "",
          path: ["password_confirm"]

        })

      }

      return true;

    });

  type userType = typeof User.infer;

  const form = useForm<userType>({

    resolver: arktypeResolver(User)

  });

  const handleUserSignup = async (date: userType): Promise<void> => {

    setSubmitting(true);

    try {

      const res: Response = await fetch("/api/signup", {

        method: "POST",
        headers: {

          "Content-Type": "application/json",

        },
        body: JSON.stringify(date),

      });

      if (res.status !== 201) {

        const errorData = await res.json();
        toast.error(errorData.message || "An error occurred during signup");
        throw new Error(`Error during signup: ${res.statusText}`);

      };

      const result = await res.json();
      console.log("Signup response: ", result);

      toast.success("Signup with success");

      return login("/login");

    } catch (error: unknown) {

      console.log("Error during signup: ", error);
      toast.error("An unexpected error occurred");

    } finally {

      setSubmitting(false);

    };

  };

  return {

    form,
    isSubmitting,
    handleUserSignup

  };

};

