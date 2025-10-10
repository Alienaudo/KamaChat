import style from "./LoginStyle.module.css";
import Hide from "../../assets/hide.svg";
import View from "../../assets/view.svg"
import { useState } from "react";
import { useNavigate, type NavigateFunction } from "react-router";
import { userLogin } from "../../components/userLogin";

export function LoginPage() {

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const togglePasswordVisibility = (): void => {

        setIsPasswordVisible(prevState => !prevState);

    };

    const {

        form,
        isLoggingIn,
        handleUserLogin

    } = userLogin();

    const {

        register,
        handleSubmit,
        formState: { errors }

    } = form;

    const signup: NavigateFunction = useNavigate();

    return (

        <>

            <div className="container">

                <form method="post" onSubmit={handleSubmit(handleUserLogin)}>

                    <h1>Login Page</h1>

                    <label htmlFor="email" className={style.field}>
                        Email: <br />

                        <input
                            id="email"
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            {...register("email", { required: true })}
                        />
                        {
                            errors.email &&
                            <p id="email-error" role="alert">
                                {errors.email.message}
                            </p>
                        }
                    </label>

                    <div className="password_field">

                        <label htmlFor="password">
                            Password <br />

                            <div className="field">
                                <input
                                    id="password"
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    type={

                                        isPasswordVisible ? "text" : "password"

                                    }
                                    {...register("password", { required: true })}
                                />

                                <button type="button" onClick={

                                    (): void => togglePasswordVisibility()

                                }>
                                    <img

                                        className="toggle_visibility_icon"
                                        id="toggle_visibility_icon"
                                        src={

                                            isPasswordVisible ? Hide : View

                                        }
                                        alt="Toggle visibility"

                                    />
                                </button>
                            </div>
                            {
                                errors.password &&
                                <label htmlFor="password">
                                    {errors.password.message}
                                </label>
                            }
                        </label>

                    </div>

                    <button type="submit">
                        {isLoggingIn ? "Logging In..." : "Login"}
                    </button>

                    <label
                        htmlFor="stayLoggedCheckbox"
                        className="stayLogged">

                        <input
                            id="stayLoggedCheckbox"
                            type="checkbox"
                            required={false}
                        />
                        <p>Stay logged</p>

                    </label>

                </form>


                <div className={style.signup}>

                    <p>Don't have an account?</p>
                    <button type="button" onClick={

                        (): void | Promise<void> => signup("/signup")

                    }>Signup</button>

                </div>

            </div>

        </>

    )

};

