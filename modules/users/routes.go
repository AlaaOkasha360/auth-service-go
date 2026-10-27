package users

import (
	"github.com/AlaaOkasha360/auth-service-go/middlewares"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(rg *gin.RouterGroup){
	rg.GET("/me", middlewares.AuthMiddleware(), GetProfile)
	rg.PATCH("/me", middlewares.AuthMiddleware(), UpdateProfile)

	admin := rg.Group("/admin/users", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(RoleAdmin))
	{
		admin.GET("", GetAllUsers)
		admin.DELETE("/:id", DeleteUser)
	}
}
