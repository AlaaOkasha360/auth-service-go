package routes

import (
	"github.com/AlaaOkasha360/auth-service-go/controllers"
	"github.com/AlaaOkasha360/auth-service-go/middlewares"
	"github.com/gin-gonic/gin"
)

func SetupAdminRoutes(router *gin.Engine, abs *gin.RouterGroup){
	admin := abs.Group("/admin")
	{
		admin.GET("/users", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.GetAllUsers)
		admin.DELETE("/users/:id", middlewares.AuthMiddleware(), middlewares.AdminMiddleware(), controllers.DeleteUser)
	}
}