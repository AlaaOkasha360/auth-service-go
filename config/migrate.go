package config

import (
	"log"

	"github.com/AlaaOkasha360/auth-service-go/models"
)

func RunMigrations(){
	err := DB.AutoMigrate(
		&models.User{},
		&models.PasswordReset{},
	)

	if err != nil {
        log.Fatal("Migration failed:", err)
    }

    log.Println("Database migration completed")
}