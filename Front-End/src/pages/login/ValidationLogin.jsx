import * as Yup from "yup";

export const LoginValidation = Yup.object({
    username: Yup.string()
        .required("Please enter user name"),
    
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        )
        .required("Please enter your password"),
});
