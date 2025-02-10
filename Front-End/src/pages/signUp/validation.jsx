import * as Yup from "yup";

export const SignUpValidation = Yup.object({
    username: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .required("Please enter your name"),
    
        email: Yup.string()
        .email("Please enter a valid email")
        .required("Please enter your email"),
    
        password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        )
        .required("Please enter your password"),
        phone:Yup.string()
             .required("please Enter your Phone Number")

});

