package auth

import "github.com/gin-gonic/gin"

func RegisterRoutes(rg *gin.RouterGroup){
	auth := rg.Group("/auth")
	{
		auth.POST("/register", Register)
		auth.POST("/login", Login)
		auth.POST("/refresh", Refresh)
		auth.POST("/logout", Logout)
		auth.POST("/forgot-password", ForgotPassword)
		auth.POST("/reset-password", ResetPassword)
	}
}
