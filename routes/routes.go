package routes

import (
	"github.com/AlaaOkasha360/auth-service-go/modules/auth"
	"github.com/AlaaOkasha360/auth-service-go/modules/users"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine){
	v1 := router.Group("/api/v1")
	{
		auth.RegisterRoutes(v1)
		users.RegisterRoutes(v1)
	}
}
