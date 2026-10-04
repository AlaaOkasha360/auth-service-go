package requests

type RegisterRequest struct{
	Name string `json:"name" binding:"required,min=3,max=100"`
	Email string `json:"email" binding:"required,email"`
	Passowrd string `json:"password" binding:"required,min=8"`
}

type LoginRequest struct{
	Email string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type ForgotPassword struct{
	Email string `json:"email" binding:"required,email"`
}

type ResetPassword struct{
	Token string `json:"token" binding:"required"`
	OTP uint `json:"otp" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}
