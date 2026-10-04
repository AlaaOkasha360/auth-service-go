package routes

import (
	"github.com/AlaaOkasha360/auth-service-go/controllers"
	"github.com/AlaaOkasha360/auth-service-go/middlewares"
	"github.com/gin-gonic/gin"
)

func SetupUserRoutes(router *gin.Engine, abs *gin.RouterGroup){
	user := abs.Group("/")
	{
		user.PATCH("/me", middlewares.AuthMiddleware(), controllers.UpdateProfile)
		user.GET("/me", middlewares.AuthMiddleware(), controllers.GetProfile)
	}
}