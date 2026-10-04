package main

import (
	"log"
	"os"

	"github.com/AlaaOkasha360/auth-service-go/config"
	"github.com/AlaaOkasha360/auth-service-go/middlewares"
	"github.com/AlaaOkasha360/auth-service-go/routes"
	"github.com/gin-gonic/gin"
)

func main(){
	
	config.DatabaseConnection()

	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("JWT_SECRET is not set")
	}

	config.RunMigrations()

	router := gin.Default()

	router.Use(middlewares.CORSMiddleware())

	routes.SetupRoutes(router)

	router.Run()
}
