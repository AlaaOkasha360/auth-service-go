package routes

import "github.com/gin-gonic/gin"

func SetupRoutes(router *gin.Engine){
	v1 := router.Group("/api/v1")
	{
		SetupAuthRoutes(router, v1)
		SetupAdminRoutes(router, v1)
		SetupUserRoutes(router, v1)
	}
}