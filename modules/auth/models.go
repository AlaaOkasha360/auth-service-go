package auth

import (
	"time"

	"github.com/AlaaOkasha360/auth-service-go/config"
)

type RefreshToken struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"not null;index"`
	Token     string    `gorm:"uniqueIndex;not null"`
	ExpiresAt time.Time `gorm:"not null"`
	CreatedAt time.Time
}

type PasswordReset struct{
	ID uint `gorm:"primaryKey"`
	Email string `gorm:"not null"`
	Token string `gorm:"uniqueIndex;not null"`
	OTP uint `gorm:"not null"`
	ExpiresAt time.Time `gorm:"not null"`
}

func Migrate() {
	config.DB.AutoMigrate(&RefreshToken{}, &PasswordReset{})
}
