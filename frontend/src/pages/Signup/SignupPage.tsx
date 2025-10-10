import style from "./Signup.Style.module.css";
import Hide from "../../assets/hide.svg";
import View from "../../assets/view.svg"
import { useState } from "react";
import { useNavigate, type NavigateFunction } from "react-router";
import { userSignup } from "../../components/userSignup";

export function SignupPage() {

    const login: NavigateFunction = useNavigate();

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const togglePasswordVisibility = (): void => {

        setIsPasswordVisible(prevState => !prevState);

    };

    const togglePasswordConfirmVisibility = (): void => {

        setIsConfirmPasswordVisible(prevState => !prevState);

    };

    const { form, isSubmitting, handleUserSignup } = userSignup();

    const {

        register,
        handleSubmit,
        formState: { errors }

    } = form;

    return (

        <>

            <div className="container">

                <form method="post" onSubmit={handleSubmit(handleUserSignup)}>

                    <h1>Signup</h1>

                    <label htmlFor="name" className={style.field}>
                        Name<br />

                        <input
                            type="text"
                            id="name"
                            placeholder="Name"
                            autoComplete="name"
                            {...register("name", { required: true })} />
                        {
                            errors.name &&
                            <p id="name-error" role="alert">
                                {errors.name.message}
                            </p>
                        }
                    </label>

                    <label htmlFor="nick" className={style.field}>
                        Nick<br />

                        <input
                            type="text"
                            id="nick"
                            placeholder="Nickname"
                            autoComplete="username"
                            {...register("nick", { required: true })} />
                        {
                            errors.nick &&
                            <p id="nick-error" role="alert">
                                {errors.nick.message}
                            </p>
                        }
                    </label>

                    <label htmlFor="email" className={style.field}>
                        Email<br />

                        <input
                            type="email"
                            id="email"
                            placeholder="Email"
                            autoComplete="email"
                            {...register("email", { required: true })} />
                        {
                            errors.email &&
                            <p id="email-error" role="alert" className={style.problem}>
                                {errors.email.message}
                            </p>
                        }
                    </label>

                    <label htmlFor="birthDate" className={style.field}>
                        Birth Date<br />

                        <input
                            type="date"
                            id="birthDate"
                            {...register("birthDate", { required: true })} />
                        {
                            errors.birthDate &&
                            <p id="birthDate-error" role="alert">
                                {errors.birthDate.message}
                            </p>
                        }
                    </label>

                    <div className="password_field">

                        <label htmlFor="password">
                            Password<br />

                            <div className="field">
                                <input
                                    id="password"
                                    autoComplete="new-password"
                                    type={

                                        isPasswordVisible ? "text" : "password"

                                    }
                                    placeholder="Password"
                                    {...register("password", { required: true })} />

                                <button
                                    type="button"
                                    aria-label="Toggle password visibility icon"
                                    onClick={

                                        (): void => togglePasswordVisibility()

                                    }>
                                    <img
                                        className="toggle_visibility_icon"
                                        id="toggle_visibility_icon"
                                        loading="lazy"
                                        src={

                                            isPasswordVisible ? Hide : View

                                        }
                                        alt="Toggle visibility"
                                    />
                                </button>
                            </div>
                            {
                                errors.password &&
                                <p id="password-error" role="alert">
                                    {errors.password.message}
                                </p>
                            }
                        </label>
                    </div>

                    <div className="password_confirm_field">

                        <label htmlFor="password_confirm">
                            Password confirm<br />

                            <div className="field">
                                <input
                                    id="password_confirm"
                                    autoComplete="new-password"
                                    type={

                                        isConfirmPasswordVisible ? "text" : "password"

                                    }
                                    placeholder="Password confirm"
                                    {...register("password_confirm", { required: true })} />

                                <button
                                    type="button"
                                    aria-label="Toggle password visibility icon"
                                    onClick={

                                        (): void => togglePasswordConfirmVisibility()

                                    }>
                                    <img
                                        className="toggle_visibility_icon"
                                        id="toggle_visibility_icon"
                                        loading="lazy"
                                        src={

                                            isConfirmPasswordVisible ? Hide : View

                                        }
                                        alt="Toggle visibility"
                                    />
                                </button>
                            </div>
                            {
                                errors.password_confirm &&
                                <p id="password_confirm-error" role="alert">
                                    {errors.password_confirm.message}
                                </p>
                            }
                        </label>

                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Signing up..." : "Signup"}
                    </button>

                </form>

                <div className={style.login}>

                    <p>Already have an account?</p>
                    <button type="button" onClick={

                        (): void | Promise<void> => login("/login")

                    }>Login</button>

                </div>

            </div>

        </>

    );

};
